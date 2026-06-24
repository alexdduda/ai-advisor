-- ────────────────────────────────────────────────────────────────────────────
-- 2026-06-23 — Audit log table
--
-- Append-only record of sensitive data access: transcript reads, data
-- exports, account deletions, and admin profile views. Used to reconstruct
-- data-access timelines for PIPEDA/Law 25 breach investigations.
--
-- Backend writes via service_role (bypasses RLS). Authenticated users can
-- read their own rows (transparency). No user-initiated writes or deletes.
-- GDPR/Law 25 erasure is handled via service_role in the delete_user flow.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    action      text        NOT NULL,
    resource    text,
    ip          text,
    user_agent  text,
    created_at  timestamptz DEFAULT now() NOT NULL
);

-- Lookups by user, and by time range for incident review
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx   ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can see their own entries (transparency / subject-access requests)
DROP POLICY IF EXISTS "audit_log_select_own" ON audit_log;
CREATE POLICY "audit_log_select_own"
ON audit_log FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE for regular users — backend uses service_role only
