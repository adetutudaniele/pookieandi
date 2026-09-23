# Pookie & I — Multiplayer Engine Rebuild

## Phase 1 — Foundation
- [x] Schema: participants, participant_secrets, game_sessions, rounds, actions,
      private_submissions, room_messages, score_events
- [x] RLS: no client writes; tokens + private submissions unreadable
- [x] Atomic primitives: claim_participant_slot, apply_round_state
- [x] Completed sessions immutable (trigger)
- [x] Realtime publication for public state tables
- [x] Server game engine (edge function `game`) — operations + four patterns
- [x] Authoritative timers, server scoring, chat rows

## Phase 2 — Connect existing UI
- [x] Client engine adapter (public/pk-engine.js) wired in, visuals unchanged
- [x] Rooms, chat, scores, presence now server-authoritative
- [x] Reconnect via participant token, realtime resubscribe

## Phase 3 — Representative games
- [ ] Deep Questions, Finish My Sentence, Two Truths & a Lie, Rate Us, 20 Questions

## Phase 4 — Remaining games
- [ ] All other existing games onto matching patterns (no new games)

## Phase 5 — QA
- [ ] Two-browser Playwright suite (rooms, identity, sync, recovery, security)
- [ ] Accessibility + responsive regression

## Phase 6 — Legacy removal
- [ ] Remove old sync code, whole-room writes, patch layers
