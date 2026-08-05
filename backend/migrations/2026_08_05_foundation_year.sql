-- ────────────────────────────────────────────────────────────────────────────
-- 2026-08-05 — Foundation (U0) year flag
--
-- The planner had no way to know a student is doing, or has done, the 30-credit
-- Foundation/Freshman year. `year` only says where they are NOW, and the
-- September cron advances it — so a student who finished U0 and moved to U1
-- became indistinguishable from a CEGEP entrant who never had a U0. Their
-- Foundation courses then fell through to the Electives pool, which is wrong:
-- U0 is a program of its own, separate from the major/minor and from electives.
--
-- `foundation_year`:
--   true   — doing, or has completed, the Foundation (U0) year
--   false  — entered directly into U1 (CEGEP / advanced standing)
--   NULL   — not answered; the frontend falls back to (year = 0)
--
-- Backfill: anyone currently in U0 is a Foundation student by definition.
-- Everyone else is left NULL rather than guessed at — a U2 student who did U0
-- can tick the box in their profile, and we'd rather under-claim than tell
-- someone their major courses don't count.
--
-- Idempotent — safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS foundation_year boolean;

UPDATE users
SET foundation_year = true
WHERE foundation_year IS NULL AND year = 0;
