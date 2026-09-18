-- ════════════════════════════════════════════════════════════════════
-- Phase 1: multiplayer engine foundation
-- Room -> Participant -> Game Session -> Round -> Action -> Score
-- Clients never write these tables directly; all mutation happens
-- through the service-role game engine. Reads are limited to public
-- state; participant tokens and private submissions are unreadable.
-- ════════════════════════════════════════════════════════════════════

-- ── rooms: extend the existing table with lifecycle fields ──────────
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'WAITING',
  ADD COLUMN IF NOT EXISTS invite_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS rooms_invite_token_key ON public.rooms(invite_token);

-- ── participants ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid,
  role text NOT NULL CHECK (role IN ('P1','P2')),
  display_name text NOT NULL DEFAULT 'Pookie',
  status text NOT NULL DEFAULT 'WAITING',
  connected_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, role)
);
CREATE INDEX IF NOT EXISTS participants_room_idx ON public.participants(room_id);
CREATE INDEX IF NOT EXISTS participants_user_idx ON public.participants(user_id);

-- Credentials live apart from the public participant record so that a
-- readable participant row can never leak the token.
CREATE TABLE IF NOT EXISTS public.participant_secrets (
  participant_id uuid PRIMARY KEY REFERENCES public.participants(id) ON DELETE CASCADE,
  participant_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_token)
);

-- ── game sessions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  round_number integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS game_sessions_room_idx ON public.game_sessions(room_id, created_at DESC);
-- at most one active session per room
CREATE UNIQUE INDEX IF NOT EXISTS game_sessions_one_active
  ON public.game_sessions(room_id) WHERE status = 'ACTIVE';

-- ── rounds ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  state_version integer NOT NULL DEFAULT 1,
  timer_started_at timestamptz,
  timer_duration_seconds integer,
  timer_status text NOT NULL DEFAULT 'IDLE',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (game_session_id, round_number)
);

-- ── actions (idempotent, ordered) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  round_id uuid REFERENCES public.rounds(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL,
  action_id text NOT NULL,
  action_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb,
  sequence bigserial,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_session_id, action_id)
);
CREATE INDEX IF NOT EXISTS actions_round_idx ON public.actions(round_id, sequence);

-- ── private submissions (never exposed before reveal) ───────────────
CREATE TABLE IF NOT EXISTS public.private_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  submission_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  revealed_at timestamptz,
  UNIQUE (round_id, participant_id, submission_type)
);

-- ── chat: one row per message ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS room_messages_room_idx ON public.room_messages(room_id, created_at);

-- ── score events (server-authored only) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.score_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  round_id uuid REFERENCES public.rounds(id) ON DELETE SET NULL,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  reason text NOT NULL,
  points integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS score_events_session_idx ON public.score_events(game_session_id);

-- ════════════════════════════════════════════════════════════════════
-- GRANTS — readable public state only; no client writes anywhere.
-- ════════════════════════════════════════════════════════════════════
GRANT SELECT ON public.participants   TO anon, authenticated;
GRANT SELECT ON public.game_sessions  TO anon, authenticated;
GRANT SELECT ON public.rounds         TO anon, authenticated;
GRANT SELECT ON public.room_messages  TO anon, authenticated;
GRANT SELECT ON public.score_events   TO anon, authenticated;

GRANT ALL ON public.participants        TO service_role;
GRANT ALL ON public.participant_secrets TO service_role;
GRANT ALL ON public.game_sessions       TO service_role;
GRANT ALL ON public.rounds              TO service_role;
GRANT ALL ON public.actions             TO service_role;
GRANT ALL ON public.private_submissions TO service_role;
GRANT ALL ON public.room_messages       TO service_role;
GRANT ALL ON public.score_events        TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.actions_sequence_seq TO service_role;

-- participant_secrets, actions and private_submissions get NO client
-- grants at all: tokens and unrevealed answers are unreachable.

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE public.participants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_events        ENABLE ROW LEVEL SECURITY;

-- Public state of a live room is readable by anyone holding the room id
-- (rooms are short-lived, code-gated and guest-playable by design).
CREATE POLICY "read live participants" ON public.participants
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = room_id AND r.expires_at > now()));

CREATE POLICY "read live sessions" ON public.game_sessions
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = room_id AND r.expires_at > now()));

CREATE POLICY "read live rounds" ON public.rounds
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.game_sessions gs JOIN public.rooms r ON r.id = gs.room_id
    WHERE gs.id = game_session_id AND r.expires_at > now()));

CREATE POLICY "read live messages" ON public.room_messages
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = room_id AND r.expires_at > now()));

CREATE POLICY "read live score events" ON public.score_events
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.game_sessions gs JOIN public.rooms r ON r.id = gs.room_id
    WHERE gs.id = game_session_id AND r.expires_at > now()));

-- No policies for participant_secrets / actions / private_submissions:
-- only the service-role engine can touch them.

-- ════════════════════════════════════════════════════════════════════
-- Completed sessions are immutable
-- ════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.guard_completed_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'COMPLETE' THEN
    RAISE EXCEPTION 'completed game sessions are immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS game_sessions_immutable ON public.game_sessions;
CREATE TRIGGER game_sessions_immutable
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION public.guard_completed_session();

-- ════════════════════════════════════════════════════════════════════
-- Atomic primitives used by the engine
-- ════════════════════════════════════════════════════════════════════

-- Claim a free player slot in one transaction. Losers of a race get NULL.
CREATE OR REPLACE FUNCTION public.claim_participant_slot(
  p_room_id uuid, p_role text, p_display_name text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.participants (room_id, role, display_name, status, connected_at)
  VALUES (p_room_id, p_role, p_display_name, 'ACTIVE', now())
  ON CONFLICT (room_id, role) DO NOTHING
  RETURNING id INTO v_id;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.participant_secrets (participant_id) VALUES (v_id);
  END IF;
  RETURN v_id;
END;
$$;

-- Optimistic-concurrency state write. Returns the new version, or NULL
-- when the caller's expected_version is stale.
CREATE OR REPLACE FUNCTION public.apply_round_state(
  p_round_id uuid,
  p_expected_version integer,
  p_state jsonb,
  p_status text DEFAULT NULL,
  p_timer_started_at timestamptz DEFAULT NULL,
  p_timer_duration integer DEFAULT NULL,
  p_timer_status text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_version integer;
BEGIN
  UPDATE public.rounds
     SET state = p_state,
         state_version = state_version + 1,
         status = COALESCE(p_status, status),
         timer_started_at = COALESCE(p_timer_started_at, timer_started_at),
         timer_duration_seconds = COALESCE(p_timer_duration, timer_duration_seconds),
         timer_status = COALESCE(p_timer_status, timer_status),
         completed_at = CASE WHEN COALESCE(p_status, status) = 'COMPLETE'
                             THEN now() ELSE completed_at END
   WHERE id = p_round_id
     AND state_version = p_expected_version
  RETURNING state_version INTO v_version;
  RETURN v_version;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_participant_slot(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_round_state(uuid, integer, jsonb, text, timestamptz, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_participant_slot(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_round_state(uuid, integer, jsonb, text, timestamptz, integer, text) TO service_role;

-- ── Realtime ────────────────────────────────────────────────────────
ALTER TABLE public.participants  REPLICA IDENTITY FULL;
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.rounds        REPLICA IDENTITY FULL;
ALTER TABLE public.room_messages REPLICA IDENTITY FULL;
ALTER TABLE public.score_events  REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;        EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.score_events;  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
