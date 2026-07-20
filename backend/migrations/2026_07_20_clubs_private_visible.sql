-- ════════════════════════════════════════════════════════════════════
-- Product decision: "private" club means join-by-application only, not
-- hidden. Verified private clubs should be just as discoverable in
-- Explore/Trending as public ones — only the join flow differs (request
-- + approval instead of instant join, already enforced in
-- membership.py). Updates the RLS added in 2026_06_01_sec_rls_clubs_pii.sql
-- to drop the is_private=false requirement, keeping only is_verified=true.
--
-- Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "clubs_select_public_or_managed" ON clubs;
DROP POLICY IF EXISTS "clubs_select_anon" ON clubs;

-- Authenticated users: see every verified club (public or private), plus
-- any club they manage (even if unverified). PostgREST will still return
-- PII columns to managers — application layer (list_clubs) strips them
-- for non-managers.
CREATE POLICY "clubs_select_public_or_managed"
ON clubs FOR SELECT
TO authenticated
USING (
  is_verified = true
  OR is_club_manager(id)
);

-- Anon role: only verified clubs. (Frontend doesn't read clubs
-- anonymously, but the anon key in the bundle means anyone with it can —
-- lock it down here.)
CREATE POLICY "clubs_select_anon"
ON clubs FOR SELECT
TO anon
USING (
  is_verified = true
);
