-- ─────────────────────────────────────────────────────────────────────────────
-- 2026-08-11 — Column grants on club_events / club_announcements
--
-- Follow-up to 2026_08_10_clubs_column_grants.sql, same class of gap: RLS
-- decides which ROWS a role may read and says nothing about COLUMNS.
--
-- Re-tested the club-content policies with real rows (the earlier check was
-- vacuous — both tables were empty, so "0 rows" proved nothing). Seeded one
-- event + one announcement on a private and a public club and probed:
--
--   anon                      private 0   public 0     <- correct
--   authenticated non-member  private 0   public 1     <- correct
--
-- Row-level behaviour is right: private-club content stays member-only, and
-- public-club content is readable. But the rows that ARE returned carry
-- created_by — a user id the codebase itself classifies as PII
-- (CLUB_LIST_PII_FIELDS in api/routes/clubs/helpers.py, stripped from the club
-- listing for exactly this reason). Leaving it readable here is inconsistent
-- with that, and it links a real person to each post.
--
-- Fix: revoke blanket SELECT, re-grant every column except created_by.
--
-- SAFETY — the trap that broke My Clubs on 2026-08-10:
-- REVOKE removes table-level SELECT, and `SELECT *` REQUIRES table-level
-- privilege (column grants only apply to explicit column lists). That is why
-- clubs(*) started failing with 42501. Checked before writing this one:
--   * the frontend never reads either table directly (no supabase.from(...));
--   * every backend read uses the privileged server-side role, which bypasses
--     grants — including the `select("*, clubs(name, category)")` in
--     get_subscribed_club_events.
-- So no caller relies on `SELECT *` with the anon/authenticated roles and this
-- migration is safe to run independently of any deploy.
--
-- Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE SELECT ON public.club_events        FROM anon, authenticated;
REVOKE SELECT ON public.club_announcements FROM anon, authenticated;

GRANT SELECT (
    id, club_id, title, description,
    date, time, end_time, location,
    join_link, recurrence, created_at
) ON public.club_events TO anon, authenticated;

GRANT SELECT (
    id, club_id, title, body,
    date, join_link, created_at
) ON public.club_announcements TO anon, authenticated;


-- ── Verify ───────────────────────────────────────────────────────────────────
--   SELECT table_name, grantee, column_name
--   FROM information_schema.column_privileges
--   WHERE table_name IN ('club_events','club_announcements')
--     AND grantee IN ('anon','authenticated') AND privilege_type = 'SELECT'
--   ORDER BY table_name, grantee, column_name;
--
-- created_by must be absent for both roles on both tables.
