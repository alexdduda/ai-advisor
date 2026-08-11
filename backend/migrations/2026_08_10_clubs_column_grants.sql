-- ─────────────────────────────────────────────────────────────────────────────
-- 2026-08-10 — Column-level grants on `clubs` (PII leak via direct PostgREST)
--
-- PROBLEM
-- RLS decides which ROWS a role may read; it says nothing about COLUMNS. The
-- clubs SELECT policy lets anon/authenticated read every verified club, so
-- PostgREST happily returns every column — including contact_email and
-- executive_emails.
--
-- The API strips those (strip_club_pii / CLUB_LIST_PII_FIELDS, SEC FIX #4),
-- but nothing forces a client to use the API. The anon key ships in the
-- frontend bundle (confirmed: dist/assets/supabase-*.js), so anyone can call
-- PostgREST directly and read the raw row. Verified against production:
--
--   anon -> GET /rest/v1/clubs?select=*
--     McGill AI Lab  contact_email=…@gmail.com  executive_emails=…@mail.mcgill.ca
--
-- Those are real McGill student addresses — harvestable by anyone who opens
-- DevTools. The 2026_06_01 migration anticipated this and waved it off
-- ("anything sensitive should be re-read via the API not directly via
-- PostgREST"), which doesn't hold: the client chooses, not us.
--
-- FIX
-- Revoke blanket SELECT and re-grant only the non-PII columns. The excluded
-- set is exactly CLUB_LIST_PII_FIELDS in api/routes/clubs/helpers.py:
--   contact_email, executive_emails, created_by, admin_emails, owner_email
-- (admin_emails / owner_email are listed there but not present on the table
-- today; they're simply never granted if added later, which fails safe.)
--
-- Only the anon and authenticated roles are touched here. The backend's
-- privileged server-side role keeps full access, so club managers still get
-- those fields through the API — the only path that checks authorisation.
--
-- ⚠️ Pair this with the code change that replaces `clubs(*)` with an explicit
-- column list in get_user_clubs (api/routes/clubs/membership.py). PostgREST
-- expands `*` against granted columns, but an explicit list removes any doubt
-- and stops that endpoint returning PII for clubs you've merely joined.
--
-- Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE SELECT ON public.clubs FROM anon, authenticated;

GRANT SELECT (
    id,
    name,
    category,
    description,
    description_fr,
    description_zh,
    meeting_schedule,
    meeting_schedule_fr,
    meeting_schedule_zh,
    join_instructions,
    join_instructions_fr,
    join_instructions_zh,
    location,
    logo_url,
    website_url,
    application_url,
    tags,
    member_count,
    is_private,
    is_verified,
    created_at
) ON public.clubs TO anon, authenticated;


-- ── Verify ───────────────────────────────────────────────────────────────────
-- Expect: contact_email, executive_emails and created_by absent for both roles.
--
--   SELECT grantee, column_name
--   FROM information_schema.column_privileges
--   WHERE table_name = 'clubs'
--     AND grantee IN ('anon','authenticated')
--     AND privilege_type = 'SELECT'
--   ORDER BY grantee, column_name;
--
-- And from the app's anon key, this must now fail rather than return data:
--   SELECT contact_email FROM clubs LIMIT 1;   -- permission denied
