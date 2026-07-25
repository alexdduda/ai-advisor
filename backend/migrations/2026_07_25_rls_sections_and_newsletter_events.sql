-- ─────────────────────────────────────────────────────────────────────────────
-- 2026-07-25 — RLS for mcgill_sections and newsletter_events
--
-- SEC FIX: both tables are queried from the backend (courses.py,
-- newsletters.py) but were never brought under RLS in
-- 2026_06_24_rls_core_tables.sql or 2026_06_23_rls_forum_and_club_tables.sql.
-- Access today is server-side only via the service_role client, which
-- bypasses RLS regardless — but that means there was no boundary at all if
-- either table were ever queried with the anon/authenticated key. Both hold
-- non-sensitive, non-user-owned data (public course schedule / public
-- newsletter events), so the fix mirrors the existing read-only catalogue
-- pattern: authenticated read, service-role-only write.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── mcgill_sections ───────────────────────────────────────────────────────────
-- Course schedule/instructor data — same shape as `courses`.
ALTER TABLE mcgill_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mcgill_sections_select_authenticated" ON mcgill_sections;
CREATE POLICY "mcgill_sections_select_authenticated" ON mcgill_sections
FOR SELECT TO authenticated
USING (true);


-- ── newsletter_events ─────────────────────────────────────────────────────────
-- Feed-synced events for newsletter_sources — same shape as
-- newsletter_sources itself. Writes are service_role only (feed sync job).
ALTER TABLE newsletter_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_events_select_authenticated" ON newsletter_events;
CREATE POLICY "newsletter_events_select_authenticated" ON newsletter_events
FOR SELECT TO authenticated
USING (true);
