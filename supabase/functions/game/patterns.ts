// ════════════════════════════════════════════════════════════════════
// Pookie & I — game state machines
//
// Four reusable patterns plus two stateful games. Every game exposes the
// same contract: initialState / allowedActions / applyAction / isComplete.
// The UI renders whatever state comes out of here; it never decides.
// ════════════════════════════════════════════════════════════════════

import { CATALOG, type GameContent } from "./catalog.ts";

export type Role = "P1" | "P2";
export type State = Record<string, any>;

export interface ScoreAward {
  role: Role;
  reason: string;
  points: number;
}

export interface ApplyInput {
  role: Role;
  type: string;
  payload: Record<string, any>;
  /** Private submissions for the current round, keyed by role. Only made
   *  available to the engine at reveal time. */
  submissions?: Partial<Record<Role, any>>;
}

export interface ApplyResult {
  state: State;
  scores?: ScoreAward[];
  /** true when the action finishes the round and a new one should start */
  advanceRound?: boolean;
  complete?: boolean;
  /** reveal private submissions belonging to this round */
  revealSubmissions?: boolean;
  timer?: { durationSeconds: number } | null;
}

export class EngineError extends Error {
  constructor(message: string, readonly code = "INVALID_ACTION") {
    super(message);
  }
}

export interface Engine {
  pattern: "prompt" | "turn" | "simultaneous" | "stateful";
  /** submission_type expected before reveal, if the game uses private answers */
  submissionType?: string;
  initialState(ctx: Ctx): State;
  allowedActions(state: State, role: Role): string[];
  applyAction(state: State, input: ApplyInput, ctx: Ctx): ApplyResult;
  isComplete(state: State): boolean;
}

export interface Ctx {
  content: GameContent;
  /** prompt indices already used in this room, so nothing repeats */
  shown: number[];
  roundNumber: number;
}

// ── prompt selection (server-owned, never repeats until exhausted) ───
function pickPrompt(ctx: Ctx): { prompt: string; index: number } {
  const list = ctx.content.prompts ?? [];
  if (!list.length) return { prompt: "", index: -1 };
  let pool = list.map((_, i) => i).filter((i) => !ctx.shown.includes(i));
  if (!pool.length) pool = list.map((_, i) => i); // exhausted → reshuffle
  const index = pool[Math.floor(Math.random() * pool.length)];
  return { prompt: list[index], index };
}

function requireRole(role: Role, expected: Role) {
  if (role !== expected) {
    throw new EngineError(`not your turn (${expected} to act)`, "WRONG_TURN");
  }
}

// ════════════════════════════════════════════════════════════════════
// A. PROMPT GAMES — PROMPT_SHOWN → DISCUSS → NEXT
// ════════════════════════════════════════════════════════════════════
interface PromptOpts {
  /** extra scoring actions either player may take, e.g. "Point to me" */
  scoreActions?: Record<string, { reason: string; points: number }>;
  /** first to this many points wins the session */
  targetScore?: number;
  timerSeconds?: number;
}

function promptEngine(opts: PromptOpts = {}): Engine {
  const scoreActions = opts.scoreActions ?? {};
  return {
    pattern: "prompt",
    initialState(ctx) {
      const { prompt, index } = pickPrompt(ctx);
      return { pattern: "prompt", phase: "PROMPT_SHOWN", prompt, promptIndex: index };
    },
    allowedActions(state) {
      const base = state.phase === "PROMPT_SHOWN" ? ["DISCUSS", "NEXT"] : ["NEXT"];
      return [...base, ...Object.keys(scoreActions)];
    },
    applyAction(state, input, ctx) {
      if (scoreActions[input.type]) {
        const rule = scoreActions[input.type];
        const target: Role = input.payload?.target === "P2" || input.payload?.target === "P1"
          ? input.payload.target
          : input.role;
        return {
          state: { ...state, lastScore: { role: target, reason: rule.reason } },
          scores: [{ role: target, reason: rule.reason, points: rule.points }],
        };
      }
      if (input.type === "DISCUSS") {
        return { state: { ...state, phase: "DISCUSS" } };
      }
      if (input.type === "NEXT") {
        const { prompt, index } = pickPrompt(ctx);
        return {
          state: { pattern: "prompt", phase: "PROMPT_SHOWN", prompt, promptIndex: index },
          advanceRound: true,
          timer: opts.timerSeconds ? { durationSeconds: opts.timerSeconds } : null,
        };
      }
      throw new EngineError(`unknown action ${input.type}`);
    },
    isComplete: () => false,
  };
}

// ════════════════════════════════════════════════════════════════════
// B. TURN-BASED — P1_TURN → P2_TURN → RESOLVE → NEXT
// ════════════════════════════════════════════════════════════════════
interface TurnOpts {
  /** both players take a turn before the round can resolve */
  bothTurns?: boolean;
  /** reactions the non-acting player may give, with their scoring */
  reactions?: Record<string, { reason: string; points: number; to: "actor" | "reactor" }>;
  promptRequired?: boolean;
}

function turnEngine(opts: TurnOpts = {}): Engine {
  const reactions = opts.reactions ?? {};
  return {
    pattern: "turn",
    initialState(ctx) {
      const { prompt, index } = pickPrompt(ctx);
      const first: Role = ctx.roundNumber % 2 === 1 ? "P1" : "P2";
      return {
        pattern: "turn",
        phase: `${first}_TURN`,
        turn: first,
        prompt,
        promptIndex: index,
        entries: {},
      };
    },
    allowedActions(state, role) {
      if (state.phase === "RESOLVE") return ["NEXT", ...Object.keys(reactions)];
      if (state.turn === role) return ["SUBMIT_TURN"];
      return Object.keys(reactions);
    },
    applyAction(state, input, ctx) {
      if (reactions[input.type]) {
        const rule = reactions[input.type];
        const actor: Role = state.turn === "P1" ? "P1" : "P2";
        const target: Role = rule.to === "actor" ? actor : input.role;
        return {
          state: { ...state, lastReaction: { type: input.type, by: input.role } },
          scores: [{ role: target, reason: rule.reason, points: rule.points }],
        };
      }
      if (input.type === "SUBMIT_TURN") {
        requireRole(input.role, state.turn);
        const text = String(input.payload?.text ?? "").slice(0, 500);
        const entries = { ...state.entries, [input.role]: text };
        const other: Role = input.role === "P1" ? "P2" : "P1";
        if (opts.bothTurns && !entries[other]) {
          return { state: { ...state, entries, turn: other, phase: `${other}_TURN` } };
        }
        return { state: { ...state, entries, phase: "RESOLVE" } };
      }
      if (input.type === "NEXT") {
        if (state.phase !== "RESOLVE") {
          throw new EngineError("round is not finished yet", "PREMATURE_NEXT");
        }
        const next = this.initialState({ ...ctx, roundNumber: ctx.roundNumber + 1 });
        return { state: next, advanceRound: true };
      }
      throw new EngineError(`unknown action ${input.type}`);
    },
    isComplete: () => false,
  };
}

// ════════════════════════════════════════════════════════════════════
// C. SIMULTANEOUS — WAITING → *_SUBMITTED → REVEAL → RESOLVE → NEXT
// Answers live in private_submissions; the opposing client cannot read
// them until the engine performs REVEAL.
// ════════════════════════════════════════════════════════════════════
interface SimulOpts {
  submissionType: string;
  timerSeconds?: number;
  /** scoring applied at reveal, given both answers */
  resolve?: (a: any, b: any) => ScoreAward[];
}

function simultaneousEngine(opts: SimulOpts): Engine {
  return {
    pattern: "simultaneous",
    submissionType: opts.submissionType,
    initialState(ctx) {
      const { prompt, index } = pickPrompt(ctx);
      return {
        pattern: "simultaneous",
        phase: "WAITING",
        prompt,
        promptIndex: index,
        submitted: { P1: false, P2: false },
        reveal: null,
      };
    },
    allowedActions(state, role) {
      if (state.phase === "REVEAL") return ["NEXT"];
      if (state.submitted.P1 && state.submitted.P2) return ["REVEAL"];
      return state.submitted[role] ? [] : ["SUBMIT"];
    },
    applyAction(state, input, ctx) {
      if (input.type === "SUBMITTED") {
        // internal: raised by submit_private_submission
        const submitted = { ...state.submitted, [input.role]: true };
        const phase = submitted.P1 && submitted.P2
          ? "READY"
          : `${input.role}_SUBMITTED`;
        return { state: { ...state, submitted, phase } };
      }
      if (input.type === "REVEAL") {
        if (!state.submitted.P1 || !state.submitted.P2) {
          throw new EngineError("both players must submit before reveal", "NOT_READY");
        }
        const subs = input.submissions ?? {};
        const scores = opts.resolve ? opts.resolve(subs.P1, subs.P2) : [];
        return {
          state: { ...state, phase: "REVEAL", reveal: { P1: subs.P1 ?? null, P2: subs.P2 ?? null } },
          scores,
          revealSubmissions: true,
        };
      }
      if (input.type === "NEXT") {
        if (state.phase !== "REVEAL") {
          throw new EngineError("cannot skip an unrevealed round", "PREMATURE_NEXT");
        }
        const next = this.initialState({ ...ctx, roundNumber: ctx.roundNumber + 1 });
        return {
          state: next,
          advanceRound: true,
          timer: opts.timerSeconds ? { durationSeconds: opts.timerSeconds } : null,
        };
      }
      throw new EngineError(`unknown action ${input.type}`);
    },
    isComplete: () => false,
  };
}

// ════════════════════════════════════════════════════════════════════
// D1. 20 QUESTIONS (stateful/competitive)
// SETUP → ASKING → ANSWERED → … → FINAL_GUESS → CORRECT/INCORRECT → COMPLETE
// ════════════════════════════════════════════════════════════════════
const MAX_QUESTIONS = 20;

const twentyEngine: Engine = {
  pattern: "stateful",
  submissionType: "secret",
  initialState(ctx) {
    const thinker: Role = ctx.roundNumber % 2 === 1 ? "P1" : "P2";
    const guesser: Role = thinker === "P1" ? "P2" : "P1";
    const ideas = ctx.content.ideas ?? [];
    return {
      pattern: "stateful",
      game: "twenty",
      phase: "SETUP",
      thinker,
      guesser,
      idea: ideas.length ? ideas[Math.floor(Math.random() * ideas.length)] : null,
      questionsAsked: 0,
      questionsRemaining: MAX_QUESTIONS,
      history: [],
      pendingQuestion: null,
      finalGuess: null,
      secret: null,
      outcome: null,
    };
  },
  allowedActions(state, role) {
    switch (state.phase) {
      case "SETUP":
        return role === state.thinker ? ["SUBMIT"] : [];
      case "ASKING":
        return role === state.guesser ? ["ASK", "FINAL_GUESS"] : [];
      case "AWAITING_ANSWER":
        return role === state.thinker ? ["ANSWER"] : [];
      case "FINAL_GUESS":
        return role === state.guesser ? ["FINAL_GUESS"] : [];
      case "JUDGING":
        return role === state.thinker ? ["JUDGE"] : [];
      case "COMPLETE":
        return ["NEXT"];
      default:
        return [];
    }
  },
  applyAction(state, input, ctx) {
    switch (input.type) {
      case "SUBMITTED": {
        requireRole(input.role, state.thinker);
        return { state: { ...state, phase: "ASKING" } };
      }
      case "ASK": {
        if (state.phase !== "ASKING") throw new EngineError("not accepting questions now");
        requireRole(input.role, state.guesser);
        const question = String(input.payload?.question ?? "").trim().slice(0, 300);
        if (!question) throw new EngineError("question is empty");
        return { state: { ...state, phase: "AWAITING_ANSWER", pendingQuestion: question } };
      }
      case "ANSWER": {
        if (state.phase !== "AWAITING_ANSWER") throw new EngineError("no question to answer");
        requireRole(input.role, state.thinker);
        const answer = String(input.payload?.answer ?? "").toLowerCase();
        if (!["yes", "no", "sometimes"].includes(answer)) {
          throw new EngineError("answer must be yes, no or sometimes");
        }
        const asked = state.questionsAsked + 1;
        const history = [...state.history, { q: state.pendingQuestion, a: answer }];
        const out = {
          ...state,
          history,
          pendingQuestion: null,
          questionsAsked: asked,
          questionsRemaining: Math.max(0, MAX_QUESTIONS - asked),
          phase: asked >= MAX_QUESTIONS ? "FINAL_GUESS" : "ASKING",
        };
        return { state: out };
      }
      case "FINAL_GUESS": {
        if (state.phase !== "ASKING" && state.phase !== "FINAL_GUESS") {
          throw new EngineError("cannot guess right now");
        }
        requireRole(input.role, state.guesser);
        const guess = String(input.payload?.guess ?? "").trim().slice(0, 200);
        if (!guess) throw new EngineError("guess is empty");
        return { state: { ...state, phase: "JUDGING", finalGuess: guess } };
      }
      case "JUDGE": {
        if (state.phase !== "JUDGING") throw new EngineError("nothing to judge");
        requireRole(input.role, state.thinker);
        const correct = input.payload?.correct === true;
        const secret = input.submissions?.[state.thinker as Role]?.secret ?? null;
        const winner: Role = correct ? state.guesser : state.thinker;
        return {
          state: {
            ...state,
            phase: "COMPLETE",
            outcome: correct ? "CORRECT" : "INCORRECT",
            secret,
          },
          scores: [{
            role: winner,
            reason: correct ? "guessed it" : "stumped them",
            points: 1,
          }],
          revealSubmissions: true,
        };
      }
      case "NEXT": {
        if (state.phase !== "COMPLETE") {
          throw new EngineError("finish the round first", "PREMATURE_NEXT");
        }
        return {
          state: this.initialState({ ...ctx, roundNumber: ctx.roundNumber + 1 }),
          advanceRound: true,
        };
      }
      default:
        throw new EngineError(`unknown action ${input.type}`);
    }
  },
  isComplete: (state) => state.phase === "COMPLETE",
};

// ════════════════════════════════════════════════════════════════════
// D2. TWO TRUTHS & A LIE (stateful, private submission)
// SETUP → GUESSING → REVEAL → NEXT (teller alternates)
// ════════════════════════════════════════════════════════════════════
const truthsEngine: Engine = {
  pattern: "stateful",
  submissionType: "statements",
  initialState(ctx) {
    const teller: Role = ctx.roundNumber % 2 === 1 ? "P1" : "P2";
    return {
      pattern: "stateful",
      game: "truths",
      phase: "SETUP",
      teller,
      guesser: teller === "P1" ? "P2" : "P1",
      statements: null,
      guess: null,
      lieIndex: null,
      correct: null,
    };
  },
  allowedActions(state, role) {
    if (state.phase === "SETUP") return role === state.teller ? ["SUBMIT"] : [];
    if (state.phase === "GUESSING") return role === state.guesser ? ["GUESS"] : [];
    if (state.phase === "REVEAL") return ["NEXT"];
    return [];
  },
  applyAction(state, input, ctx) {
    switch (input.type) {
      case "SUBMITTED": {
        requireRole(input.role, state.teller);
        // The statements themselves are public; which one is the lie is not.
        const statements = (input.submissions?.[state.teller as Role]?.statements ?? [])
          .map((s: unknown) => String(s).slice(0, 300));
        if (statements.length !== 3) throw new EngineError("three statements required");
        return { state: { ...state, phase: "GUESSING", statements } };
      }
      case "GUESS": {
        if (state.phase !== "GUESSING") throw new EngineError("not accepting guesses");
        requireRole(input.role, state.guesser);
        const guess = Number(input.payload?.index);
        if (![0, 1, 2].includes(guess)) throw new EngineError("pick statement 1, 2 or 3");
        const lieIndex = Number(input.submissions?.[state.teller as Role]?.lieIndex ?? -1);
        const correct = guess === lieIndex;
        return {
          state: { ...state, phase: "REVEAL", guess, lieIndex, correct },
          scores: [{
            role: correct ? state.guesser : state.teller,
            reason: correct ? "spotted the lie" : "fooled them",
            points: 1,
          }],
          revealSubmissions: true,
        };
      }
      case "NEXT": {
        if (state.phase !== "REVEAL") {
          throw new EngineError("reveal before moving on", "PREMATURE_NEXT");
        }
        return {
          state: this.initialState({ ...ctx, roundNumber: ctx.roundNumber + 1 }),
          advanceRound: true,
        };
      }
      default:
        throw new EngineError(`unknown action ${input.type}`);
    }
  },
  isComplete: (state) => state.phase === "REVEAL",
};

// ════════════════════════════════════════════════════════════════════
// Scoring rules for the simultaneous games
// ════════════════════════════════════════════════════════════════════
const matchBoth = (reason: string) => (a: any, b: any): ScoreAward[] => {
  const av = JSON.stringify(a?.value ?? a ?? null);
  const bv = JSON.stringify(b?.value ?? b ?? null);
  if (av !== "null" && av === bv) {
    return [
      { role: "P1", reason, points: 1 },
      { role: "P2", reason, points: 1 },
    ];
  }
  return [];
};

const rateUsResolve = (a: any, b: any): ScoreAward[] => {
  const x = Number(a?.value), y = Number(b?.value);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
  if (Math.abs(x - y) <= 1) {
    return [
      { role: "P1", reason: "in sync", points: 1 },
      { role: "P2", reason: "in sync", points: 1 },
    ];
  }
  return [];
};

// ════════════════════════════════════════════════════════════════════
// Registry — every existing game, mapped to a pattern. No new games.
// ════════════════════════════════════════════════════════════════════
const REGISTRY: Record<string, Engine> = {
  // A. prompt games
  questions: promptEngine(),
  activities: promptEngine(),
  challenges: promptEngine(),
  never: promptEngine(),
  thisorthat: promptEngine(),
  wyr: promptEngine(),
  song: promptEngine({
    targetScore: 5,
    scoreActions: { GOT_IT_RIGHT: { reason: "got it right", points: 1 } },
  }),
  word: promptEngine({
    scoreActions: { POINT_TO_ME: { reason: "point to me", points: 1 } },
  }),

  // B. turn-based games
  emoji: turnEngine({ bothTurns: false }),
  confessdare: turnEngine({ bothTurns: false }),
  assumptions: turnEngine({
    bothTurns: false,
    reactions: {
      CONFIRM: { reason: "read them right", points: 1, to: "reactor" },
      DENY: { reason: "wrong assumption", points: 0, to: "reactor" },
    },
  }),
  unpopular: turnEngine({
    bothTurns: false,
    reactions: {
      SHOCKED: { reason: "genuinely shocking take", points: 1, to: "actor" },
      AGREE: { reason: "agreed", points: 0, to: "actor" },
    },
  }),

  // C. simultaneous commit/reveal games
  rateus: simultaneousEngine({ submissionType: "rating", resolve: rateUsResolve }),
  finishsentence: simultaneousEngine({
    submissionType: "sentence",
    resolve: matchBoth("same ending"),
  }),
  kma: simultaneousEngine({ submissionType: "kma", resolve: matchBoth("same call") }),
  mostlikely: simultaneousEngine({
    submissionType: "vote",
    resolve: matchBoth("same verdict"),
  }),
  scenario: simultaneousEngine({ submissionType: "answer", timerSeconds: 60 }),
  redgreen: simultaneousEngine({ submissionType: "flag", resolve: matchBoth("same flag") }),
  hottakes: simultaneousEngine({ submissionType: "stance", resolve: matchBoth("same stance") }),

  // D. stateful/competitive games
  twenty: twentyEngine,
  truths: truthsEngine,
};

export function getEngine(gameType: string): Engine {
  const engine = REGISTRY[gameType];
  if (!engine) throw new EngineError(`unknown game ${gameType}`, "UNKNOWN_GAME");
  return engine;
}

export function getContent(gameType: string): GameContent {
  const content = CATALOG[gameType];
  if (!content) throw new EngineError(`unknown game ${gameType}`, "UNKNOWN_GAME");
  return content;
}

export const GAME_TYPES = Object.keys(REGISTRY);
