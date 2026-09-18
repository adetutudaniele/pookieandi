# Pookie & I — Multiplayer Engine Rebuild

The look, wording, games and prompts stay exactly as they are. What changes is the invisible machinery underneath: who is allowed to do what, and where the truth about a game lives. Today the two browsers argue about the score and the state; after this, the server decides and both screens simply show the answer.

## Why this needs phases

This touches every game and the whole join/reconnect flow. Doing it in one go would leave the app broken for days. So it ships in six reviewable stages, each one working before the next starts. Only the last stage deletes the old machinery.

## Phase 1 — New foundation (backend only, app untouched)

New tables: rooms, participants, game_sessions, rounds, actions, private_submissions, room_messages, score_events. Access locked down so a browser can read only what it is entitled to and can never write game state directly.

Controlled server operations, the only way the app changes anything:
`create_room`, `join_room`, `reconnect_participant`, `submit_action`, `submit_private_submission`, `leave_room`, `complete_game`, `start_rematch`.

Built in from the start:
- Claiming the second player slot is atomic — two people racing, one wins, one is told the room is full.
- Each participant gets a private token; a name is never proof of identity. Signing in later attaches the account to the same participant.
- Every action carries an id; a retried action returns the first result instead of scoring twice.
- Every round carries a version; an action based on a stale version is rejected with the current state returned.
- Private answers live in a table the other player cannot read until reveal.
- Timers stored as start time + duration, so remaining time is correct after a refresh and keeps running in a background tab.
- Scores only ever created by server scoring rules, recorded as individual score events.
- Chat stored as one row per message, so simultaneous messages cannot overwrite each other.

## Phase 2 — Engine + wiring

A small rules engine with one contract per game — `initialState`, `allowedActions`, `applyAction`, `isComplete`, `resolve` — and four shared patterns: prompt, turn-based, simultaneous commit/reveal, and competitive/stateful. The existing screens are rewired to send actions and render whatever state comes back, keeping the current visuals. Realtime is used purely to tell clients "state changed", never as a permission check.

## Phase 3 — First five games

Deep Questions, Finish My Sentence, Two Truths & a Lie, Rate Us, 20 Questions — one per pattern, proving the engine. 20 Questions gets its real flow including the final guess, and its counter counts questions asked.

## Phase 4 — Remaining games

Every other existing game moved onto the matching pattern. No new games.

## Phase 5 — Testing

Two real browsers side by side (one as each player) covering: joining and racing for the slot, invalid/expired rooms, a third person trying to join, impersonation attempts, refresh, disconnect, offline, background tab, duplicate and stale actions, attempts to fake a score or read the other player's private answer, rematch, and every migrated game. Plus keyboard-only and screen-reader checks, and the six screen sizes in portrait and landscape at 200% zoom.

## Phase 6 — Remove the old engine

Delete the legacy sync code, the old whole-room writes and the leftover patch layers, once everything above passes.

## Technical notes

- Server operations implemented as Postgres security-definer functions where transactional atomicity matters (slot claiming, action application, version checks), with edge functions only where needed.
- `rooms.game_state`, `scores`, `active_game`, `player*_connected`, `shown_prompts` become read-only to clients; the legacy columns stay until Phase 6 so nothing breaks mid-migration.
- Idempotency via a unique `(game_session_id, action_id)` constraint; concurrency via `expected_version` compared against `rounds.state_version` inside the same transaction.
- Leaderboard recomputed from completed sessions and score events, attributed per participant/role rather than assuming the row owner is P1. Completed sessions become immutable.
- Existing account, profile, avatar, session-history and analytics work is preserved.

## What I need from you

Approval to start with Phase 1, and confirmation that a longer, staged delivery is acceptable rather than one big switch.
