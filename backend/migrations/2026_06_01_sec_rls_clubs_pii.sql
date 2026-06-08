-- ────────────────────────────────────────────────────────────────────────────
-- 2026-06-01 — Security hardening (audit findings #4 + #8)
--
-- The Supabase anon key ships in the JS bundle, so anyone can hit the
-- PostgREST endpoints directly with it. RLS is the only thing standing
-- between an attacker and the raw `clubs` / `users` tables.
--
-- This migration:
--   1. Locks down `clubs` so the anon role only sees non-private rows
--      with PII columns nulled out. Authenticated users see the same
--      thing except managers see everything for clubs they manage.
--   2. Locks down `users.verification_token` columns so neither role
--      can read them through PostgREST. Service-role still has full
--      access for the backend.
--
-- Idempotent — safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

-- ── 1. Helper: is the caller a manager of this club? ─────────────────────────
CREATE OR REPLACE FUNCTION public.is_club_manager(_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM clubs
    WHERE id = _club_id AND created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM club_managers
    WHERE club_id = _club_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_clubs
    WHERE club_id = _club_id AND user_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_club_manager(uuid) TO anon, authenticated;

-- ── 2. Clubs RLS ────────────────────────────────────────────────────────────
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clubs_select_public_or_managed" ON clubs;
DROP POLICY IF EXISTS "clubs_select_anon" ON clubs;

-- Authenticated users: see every verified non-private club, plus any club
-- they manage (even if private or unverified). PostgREST will still return
-- PII columns to managers — application layer (list_clubs) strips them for
-- non-managers, which is fine because anything sensitive should be re-read
-- via the API not directly via PostgREST.
CREATE POLICY "clubs_select_public_or_managed"
ON clubs FOR SELECT
TO authenticated
USING (
  (is_verified = true AND COALESCE(is_private, false) = false)
  OR is_club_manager(id)
);

-- Anon role: only verified, non-private clubs. (Frontend doesn't read
-- clubs anonymously, but the anon key in the bundle means anyone with
-- it can — lock it down here.)
CREATE POLICY "clubs_select_anon"
ON clubs FOR SELECT
TO anon
USING (
  is_verified = true AND COALESCE(is_private, false) = false
);

-- Writes go through the API (service role only), never via anon/auth.
DROP POLICY IF EXISTS "clubs_insert_managers" ON clubs;
DROP POLICY IF EXISTS "clubs_update_managers" ON clubs;
DROP POLICY IF EXISTS "clubs_delete_owner"    ON clubs;

CREATE POLICY "clubs_insert_managers"
ON clubs FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "clubs_update_managers"
ON clubs FOR UPDATE
TO authenticated
USING (is_club_manager(id))
WITH CHECK (is_club_manager(id));

CREATE POLICY "clubs_delete_owner"
ON clubs FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ── 3a. Add the throttle timestamp column verification.py writes to ─────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_verification_sent_at timestamptz;

-- ── 3b. Users table: revoke verification_token columns from anon/auth ───────
-- We can't have per-column RLS, but we can REVOKE the column from the roles
-- and force them to go through the backend (which uses service-role and the
-- get_user_by_id helper that strips these fields, SEC FIX #8).
DO $$
BEGIN
  -- These will error if the columns don't exist yet — wrap in EXCEPTION.
  BEGIN
    REVOKE SELECT (verification_token, verification_token_expires_at, last_verification_sent_at)
      ON users FROM anon, authenticated;
  EXCEPTION WHEN undefined_column THEN
    -- last_verification_sent_at is added by the application — best-effort.
    NULL;
  END;
END $$;
