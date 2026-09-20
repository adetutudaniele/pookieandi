// ════════════════════════════════════════════════════════════════════
// Pookie & I — server-authoritative multiplayer engine
//
// The browser may only ask "I would like to do this". Every request is
// authenticated against a participant token, validated against the
// current round state and either applied or rejected. Scores, timers,
// prompts and private answers are owned here, never by the client.
// ════════════════════════════════════════════════════════════════════

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@^2.110.8";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  EngineError,
  getContent,
  getEngine,
  type Role,
  type State,
} from "./patterns.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fail = (code: string, message: string, status = 400, extra: Record<string, unknown> = {}) =>
  json({ ok: false, code, error: message, ...extra }, status);

// ── helpers ─────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._'\-]*$/u;

function cleanName(raw: unknown): string {
  const v = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (v.length < 2 || v.length > 30 || !NAME_RE.test(v)) {
    throw new EngineError("Name must be 2–30 letters, numbers or . _ ' -", "BAD_NAME");
  }
  return v;
}

interface Participant {
  id: string;
  room_id: string;
  role: Role;
  display_name: string;
  user_id: string | null;
  status: string;
}

async function authParticipant(token: unknown): Promise<Participant> {
  if (!UUID_RE.test(String(token ?? ""))) {
    throw new EngineError("Not signed in to this room", "UNAUTHORIZED");
  }
  const { data } = await admin
    .from("participant_secrets")
    .select("participant_id, participants!inner(id, room_id, role, display_name, user_id, status)")
    .eq("participant_token", token)
    .maybeSingle();
  const p = (data as any)?.participants;
  if (!p) throw new EngineError("Not signed in to this room", "UNAUTHORIZED");
  await admin
    .from("participants")
    .update({ last_seen_at: new Date().toISOString(), status: "ACTIVE", connected_at: new Date().toISOString() })
    .eq("id", p.id);
  return p as Participant;
}

async function loadRoom(roomId: string) {
  const { data } = await admin.from("rooms").select("*").eq("id", roomId).maybeSingle();
  if (!data) throw new EngineError("Room not found", "NO_ROOM", );
  if (new Date(data.expires_at).getTime() <= Date.now()) {
    throw new EngineError("This room has expired", "EXPIRED");
  }
  return data;
}

async function activeSession(roomId: string) {
  const { data } = await admin
    .from("game_sessions")
    .select("*")
    .eq("room_id", roomId)
    .eq("status", "ACTIVE")
    .maybeSingle();
  return data;
}

async function currentRound(sessionId: string) {
  const { data } = await admin
    .from("rounds")
    .select("*")
    .eq("game_session_id", sessionId)
    .order("round_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

function shownFor(room: any, gameType: string): number[] {
  const all = (room.shown_prompts ?? {}) as Record<string, number[]>;
  return Array.isArray(all[gameType]) ? all[gameType] : [];
}

async function rememberPrompt(room: any, gameType: string, index: number) {
  if (index == null || index < 0) return;
  const all = { ...(room.shown_prompts ?? {}) } as Record<string, number[]>;
  const list = Array.isArray(all[gameType]) ? all[gameType] : [];
  if (!list.includes(index)) all[gameType] = [...list, index];
  await admin.from("rooms").update({ shown_prompts: all }).eq("id", room.id);
}

/** Remaining seconds computed from timestamps, never from a client tick. */
function timerView(round: any) {
  if (!round?.timer_started_at || !round?.timer_duration_seconds) {
    return { status: round?.timer_status ?? "IDLE", remaining: 0, duration: 0 };
  }
  const elapsed = (Date.now() - new Date(round.timer_started_at).getTime()) / 1000;
  const remaining = Math.max(0, Math.round(round.timer_duration_seconds - elapsed));
  return {
    status: remaining === 0 ? "DONE" : round.timer_status,
    remaining,
    duration: round.timer_duration_seconds,
    startedAt: round.timer_started_at,
  };
}

/** The complete authoritative view of a room for one participant. */
async function snapshot(me: Participant) {
  const room = await loadRoom(me.room_id);
  const [{ data: participants }, session, { data: messages }] = await Promise.all([
    admin.from("participants").select("id, role, display_name, status, last_seen_at, user_id")
      .eq("room_id", room.id),
    activeSession(room.id),
    admin.from("room_messages").select("id, participant_id, message, created_at")
      .eq("room_id", room.id).order("created_at", { ascending: true }).limit(300),
  ]);

  let round: any = null;
  let allowed: string[] = [];
  if (session) {
    round = await currentRound(session.id);
    if (round) {
      try {
        allowed = getEngine(session.game_type).allowedActions(round.state as State, me.role);
      } catch { allowed = []; }
    }
  }

  // Scores are derived from server-written score events only, and they run for
  // the whole room (across every game session) because the scoreboard the
  // players see is a running date-night total, not a per-game total.
  const scores: Record<string, number> = { P1: 0, P2: 0 };
  const byId = new Map((participants ?? []).map((p: any) => [p.id, p.role]));
  const { data: events } = await admin
    .from("score_events")
    .select("participant_id, points")
    .in("participant_id", [...byId.keys()]);
  for (const e of events ?? []) {
    const role = byId.get(e.participant_id);
    if (role) scores[role] += e.points;
  }

  // My own private submission for the current round (mine only, never theirs).
  let mySubmission: unknown = null;
  if (round) {
    const { data } = await admin.from("private_submissions")
      .select("payload").eq("round_id", round.id).eq("participant_id", me.id).maybeSingle();
    mySubmission = data?.payload ?? null;
  }

  return {
    ok: true,
    room: {
      id: room.id,
      code: room.room_code,
      status: room.status,
      inviteToken: room.invite_token,
      expiresAt: room.expires_at,
    },
    me: { id: me.id, role: me.role, displayName: me.display_name, userId: me.user_id },
    participants: participants ?? [],
    session: session
      ? { id: session.id, gameType: session.game_type, status: session.status, roundNumber: session.round_number }
      : null,
    round: round
      ? {
        id: round.id,
        number: round.round_number,
        status: round.status,
        state: round.state,
        version: round.state_version,
      }
      : null,
    allowedActions: allowed,
    scores,
    timer: timerView(round),
    mySubmission,
    messages: messages ?? [],
  };
}

// ════════════════════════════════════════════════════════════════════
// Operations
// ════════════════════════════════════════════════════════════════════

async function createRoom(body: any) {
  const name = cleanName(body.display_name);
  let room: any = null;
  for (let attempt = 0; attempt < 12 && !room; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const { data } = await admin.from("rooms")
      .insert({ room_code: code, player1_name: name, status: "WAITING" })
      .select().maybeSingle();
    room = data;
  }
  if (!room) throw new EngineError("Could not create a room, please try again", "NO_CODE");

  const { data: pid } = await admin.rpc("claim_participant_slot", {
    p_room_id: room.id, p_role: "P1", p_display_name: name,
  });
  const me = await participantById(pid as string);
  const token = await tokenFor(pid as string);
  return { ...(await snapshot(me)), participantToken: token };
}

async function participantById(id: string): Promise<Participant> {
  const { data } = await admin.from("participants")
    .select("id, room_id, role, display_name, user_id, status").eq("id", id).maybeSingle();
  if (!data) throw new EngineError("Participant not found", "UNAUTHORIZED");
  return data as Participant;
}

async function tokenFor(participantId: string): Promise<string> {
  const { data } = await admin.from("participant_secrets")
    .select("participant_token").eq("participant_id", participantId).maybeSingle();
  return data!.participant_token as string;
}

/** Atomic slot claim: two simultaneous joiners cannot both become P2. */
async function joinRoom(body: any) {
  const name = cleanName(body.display_name);
  const code = String(body.room_code ?? "").trim();
  if (!/^\d{4}$/.test(code)) throw new EngineError("Room codes are 4 digits", "BAD_CODE");

  const { data: room } = await admin.from("rooms")
    .select("*").eq("room_code", code).gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!room) throw new EngineError("That room code isn't active", "NO_ROOM", );

  const { data: pid } = await admin.rpc("claim_participant_slot", {
    p_room_id: room.id, p_role: "P2", p_display_name: name,
  });
  if (!pid) throw new EngineError("This room already has two players", "ROOM_FULL");

  await admin.from("rooms")
    .update({ player2_name: name, player2_connected: true, status: "ACTIVE" })
    .eq("id", room.id);

  const me = await participantById(pid as string);
  const token = await tokenFor(pid as string);
  return { ...(await snapshot(me)), participantToken: token };
}

async function startSession(me: Participant, gameType: string, rematch: boolean) {
  getEngine(gameType); // validates the game exists
  const existing = await activeSession(me.room_id);
  if (existing) {
    if (!rematch && existing.game_type === gameType) {
      return snapshot(me);
    }
    // finish the current session rather than destroying it
    await admin.from("game_sessions")
      .update({ status: "COMPLETE", completed_at: new Date().toISOString() })
      .eq("id", existing.id);
  }

  const { data: session } = await admin.from("game_sessions")
    .insert({ room_id: me.room_id, game_type: gameType, status: "ACTIVE", round_number: 1 })
    .select().maybeSingle();

  const room = await loadRoom(me.room_id);
  const engine = getEngine(gameType);
  const content = getContent(gameType);
  const state = engine.initialState({ content, shown: shownFor(room, gameType), roundNumber: 1 });

  await admin.from("rounds").insert({
    game_session_id: session!.id,
    round_number: 1,
    state,
    status: "ACTIVE",
  });
  await rememberPrompt(room, gameType, state.promptIndex);
  await admin.from("rooms").update({ active_game: gameType }).eq("id", me.room_id);
  return snapshot(me);
}

async function completeGame(me: Participant) {
  const session = await activeSession(me.room_id);
  if (!session) return snapshot(me);
  await admin.from("game_sessions")
    .update({ status: "COMPLETE", completed_at: new Date().toISOString() })
    .eq("id", session.id);
  await recordHistory(session.id, me.room_id);
  return snapshot(me);
}

/** Leaderboard attribution: each signed-in participant gets their own row,
 *  scored by their own role — P2 is never mistaken for P1. */
async function recordHistory(sessionId: string, roomId: string) {
  const [{ data: participants }, { data: events }, { data: session }] = await Promise.all([
    admin.from("participants").select("id, role, display_name, user_id").eq("room_id", roomId),
    admin.from("score_events").select("participant_id, points").eq("game_session_id", sessionId),
    admin.from("game_sessions").select("started_at, round_number").eq("id", sessionId).maybeSingle(),
  ]);
  const totals = new Map<string, number>();
  for (const e of events ?? []) {
    totals.set(e.participant_id, (totals.get(e.participant_id) ?? 0) + e.points);
  }
  const minutes = session
    ? Math.max(0, Math.round((Date.now() - new Date(session.started_at).getTime()) / 60000))
    : 0;
  for (const p of participants ?? []) {
    if (!p.user_id) continue;
    const other = (participants ?? []).find((q: any) => q.id !== p.id);
    await admin.from("session_history").insert({
      user_id: p.user_id,
      partner_name: other?.display_name ?? "Pookie",
      final_scores: {
        p1: totals.get((participants ?? []).find((q: any) => q.role === "P1")?.id ?? "") ?? 0,
        p2: totals.get((participants ?? []).find((q: any) => q.role === "P2")?.id ?? "") ?? 0,
        mine: totals.get(p.id) ?? 0,
        role: p.role,
      },
      rounds_played: session?.round_number ?? 0,
      duration_minutes: minutes,
    });
  }
}

/** Store a private answer. The opposing client can never read this row. */
async function submitPrivate(me: Participant, body: any) {
  const session = await activeSession(me.room_id);
  if (!session) throw new EngineError("No game in progress", "NO_SESSION");
  const round = await currentRound(session.id);
  if (!round) throw new EngineError("No round in progress", "NO_ROUND");

  const engine = getEngine(session.game_type);
  const allowed = engine.allowedActions(round.state as State, me.role);
  if (!allowed.includes("SUBMIT")) {
    throw new EngineError("You can't submit right now", "NOT_ALLOWED");
  }

  const payload = body.payload ?? {};
  await admin.from("private_submissions").upsert({
    game_session_id: session.id,
    round_id: round.id,
    participant_id: me.id,
    submission_type: engine.submissionType ?? "answer",
    payload,
  }, { onConflict: "round_id,participant_id,submission_type" });

  // Tell the engine a submission landed (the value itself stays private
  // except where the game publishes it, e.g. Two Truths' statements).
  return applyThroughEngine(me, session, round, {
    actionId: String(body.action_id ?? crypto.randomUUID()),
    type: "SUBMITTED",
    payload: {},
    expectedVersion: round.state_version,
  });
}

async function loadSubmissions(roundId: string, roomId: string) {
  const [{ data: subs }, { data: parts }] = await Promise.all([
    admin.from("private_submissions").select("participant_id, payload").eq("round_id", roundId),
    admin.from("participants").select("id, role").eq("room_id", roomId),
  ]);
  const byId = new Map((parts ?? []).map((p: any) => [p.id, p.role]));
  const out: Partial<Record<Role, any>> = {};
  for (const s of subs ?? []) {
    const role = byId.get(s.participant_id) as Role | undefined;
    if (role) out[role] = s.payload;
  }
  return out;
}

interface ActionRequest {
  actionId: string;
  type: string;
  payload: Record<string, any>;
  expectedVersion: number | null;
}

async function applyThroughEngine(
  me: Participant,
  session: any,
  round: any,
  req: ActionRequest,
) {
  // ── idempotency: the same action_id never applies twice ───────────
  const { data: inserted, error: insertErr } = await admin.from("actions").insert({
    game_session_id: session.id,
    round_id: round.id,
    participant_id: me.id,
    action_id: req.actionId,
    action_type: req.type,
    payload: req.payload,
  }).select("id").maybeSingle();

  if (insertErr) {
    const { data: prior } = await admin.from("actions")
      .select("result").eq("game_session_id", session.id).eq("action_id", req.actionId).maybeSingle();
    if (prior) {
      return { ...(await snapshot(me)), replayed: true, result: prior.result ?? null };
    }
    throw new EngineError("Could not record that action", "ACTION_FAILED");
  }

  const engine = getEngine(session.game_type);
  const content = getContent(session.game_type);
  const room = await loadRoom(me.room_id);

  // ── optimistic concurrency ────────────────────────────────────────
  if (req.expectedVersion != null && req.expectedVersion !== round.state_version) {
    await admin.from("actions").update({ result: { rejected: "STALE" } }).eq("id", inserted!.id);
    return { ...(await snapshot(me)), rejected: "STALE" };
  }

  // ── authorisation for this role in this state ─────────────────────
  const allowed = engine.allowedActions(round.state as State, me.role);
  const internal = req.type === "SUBMITTED";
  if (!internal && !allowed.includes(req.type)) {
    await admin.from("actions").update({ result: { rejected: "NOT_ALLOWED" } }).eq("id", inserted!.id);
    throw new EngineError("That move isn't available to you right now", "NOT_ALLOWED");
  }

  const needsSubs = ["REVEAL", "JUDGE", "GUESS", "SUBMITTED"].includes(req.type);
  const submissions = needsSubs ? await loadSubmissions(round.id, me.room_id) : undefined;

  const result = engine.applyAction(round.state as State, {
    role: me.role,
    type: req.type,
    payload: req.payload,
    submissions,
  }, { content, shown: shownFor(room, session.game_type), roundNumber: round.round_number });

  // ── persist ───────────────────────────────────────────────────────
  if (result.advanceRound) {
    const nextNumber = round.round_number + 1;
    await admin.from("rounds")
      .update({ status: "COMPLETE", completed_at: new Date().toISOString() })
      .eq("id", round.id);
    const timer = result.timer;
    await admin.from("rounds").insert({
      game_session_id: session.id,
      round_number: nextNumber,
      state: result.state,
      status: "ACTIVE",
      timer_started_at: timer ? new Date().toISOString() : null,
      timer_duration_seconds: timer?.durationSeconds ?? null,
      timer_status: timer ? "RUNNING" : "IDLE",
    });
    await admin.from("game_sessions").update({ round_number: nextNumber }).eq("id", session.id);
    await rememberPrompt(room, session.game_type, result.state.promptIndex);
  } else {
    const { data: version } = await admin.rpc("apply_round_state", {
      p_round_id: round.id,
      p_expected_version: round.state_version,
      p_state: result.state,
      p_status: result.complete ? "COMPLETE" : null,
      p_timer_started_at: result.timer ? new Date().toISOString() : null,
      p_timer_duration: result.timer?.durationSeconds ?? null,
      p_timer_status: result.timer ? "RUNNING" : null,
    });
    if (version == null) {
      await admin.from("actions").update({ result: { rejected: "STALE" } }).eq("id", inserted!.id);
      return { ...(await snapshot(me)), rejected: "STALE" };
    }
  }

  // ── scoring: only the server ever writes points ───────────────────
  if (result.scores?.length) {
    const { data: parts } = await admin.from("participants")
      .select("id, role").eq("room_id", me.room_id);
    const byRole = new Map((parts ?? []).map((p: any) => [p.role, p.id]));
    const rows = result.scores
      .filter((s) => s.points > 0 && byRole.has(s.role))
      .map((s) => ({
        game_session_id: session.id,
        round_id: round.id,
        participant_id: byRole.get(s.role),
        reason: s.reason,
        points: s.points,
      }));
    if (rows.length) await admin.from("score_events").insert(rows);
  }

  if (result.revealSubmissions) {
    await admin.from("private_submissions")
      .update({ revealed_at: new Date().toISOString() })
      .eq("round_id", round.id);
  }

  const snap = await snapshot(me);
  await admin.from("actions").update({ result: { applied: true, phase: result.state.phase } })
    .eq("id", inserted!.id);
  return snap;
}

async function submitAction(me: Participant, body: any) {
  const session = await activeSession(me.room_id);
  if (!session) throw new EngineError("No game in progress", "NO_SESSION");
  const round = await currentRound(session.id);
  if (!round) throw new EngineError("No round in progress", "NO_ROUND");
  const actionId = String(body.action_id ?? "");
  if (!actionId) throw new EngineError("Missing action id", "BAD_REQUEST");
  // A version number only identifies a state within one round, so the round
  // itself is part of the expectation: an action aimed at a finished round
  // must never land on its successor.
  if (body.round_id && body.round_id !== round.id) {
    return { ...(await snapshot(me)), rejected: "STALE" };
  }
  return applyThroughEngine(me, session, round, {
    actionId,
    type: String(body.action_type ?? ""),
    payload: body.payload ?? {},
    expectedVersion: body.expected_version == null ? null : Number(body.expected_version),
  });
}

async function sendMessage(me: Participant, body: any) {
  const message = String(body.message ?? "").trim().slice(0, 500);
  if (!message) throw new EngineError("Message is empty", "BAD_REQUEST");
  // One row per message — simultaneous messages can never overwrite.
  await admin.from("room_messages").insert({
    room_id: me.room_id,
    participant_id: me.id,
    message,
  });
  return { ok: true };
}

async function leaveRoom(me: Participant) {
  await admin.from("participants").update({ status: "LEFT" }).eq("id", me.id);
  return { ok: true };
}

/** A guest who signs in keeps the same participant identity. */
async function linkUser(me: Participant, req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) throw new EngineError("Not signed in", "UNAUTHORIZED");
  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data.user) throw new EngineError("Not signed in", "UNAUTHORIZED");
  await admin.from("participants").update({ user_id: data.user.id }).eq("id", me.id);
  return snapshot({ ...me, user_id: data.user.id });
}

// ════════════════════════════════════════════════════════════════════
// Router
// ════════════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail("BAD_METHOD", "POST only", 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid request body");
  }

  const op = String(body.op ?? "");
  try {
    switch (op) {
      case "create_room":
        return json(await createRoom(body));
      case "join_room":
        return json(await joinRoom(body));
      case "reconnect_participant":
      case "get_state":
        return json(await snapshot(await authParticipant(body.participant_token)));
      case "start_game":
        return json(await startSession(
          await authParticipant(body.participant_token),
          String(body.game_type ?? ""),
          false,
        ));
      case "start_rematch":
        return json(await startSession(
          await authParticipant(body.participant_token),
          String(body.game_type ?? ""),
          true,
        ));
      case "submit_action":
        return json(await submitAction(await authParticipant(body.participant_token), body));
      case "submit_private_submission":
        return json(await submitPrivate(await authParticipant(body.participant_token), body));
      case "send_message":
        return json(await sendMessage(await authParticipant(body.participant_token), body));
      case "complete_game":
        return json(await completeGame(await authParticipant(body.participant_token)));
      case "leave_room":
        return json(await leaveRoom(await authParticipant(body.participant_token)));
      case "link_user":
        return json(await linkUser(await authParticipant(body.participant_token), req));
      default:
        return fail("UNKNOWN_OP", `Unknown operation ${op}`);
    }
  } catch (err) {
    if (err instanceof EngineError) {
      const status = err.code === "UNAUTHORIZED" ? 401 : err.code === "NOT_ALLOWED" ? 403 : 400;
      return fail(err.code, err.message, status);
    }
    console.error("game engine error", err);
    return fail("SERVER_ERROR", "Something went wrong", 500);
  }
});
