-- ────────────────────────────────────────────────────────────────────────────
-- 2026-06-02 — Email bounce tracking columns
--
-- Backs the POST /api/webhooks/resend handler. When Resend tells us an
-- address hard-bounced or filed a spam complaint, we flag the user so
-- the frontend can prompt them to update their email instead of
-- silently re-sending verification mail that will never arrive.
--
-- Idempotent — safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_bounced boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_bounced_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_bounce_reason text;

-- Index so the cron / admin views can find bounced accounts cheaply.
CREATE INDEX IF NOT EXISTS idx_users_email_bounced
  ON users (email_bounced)
  WHERE email_bounced = true;

-- RLS: these are owner-readable but not user-editable. The webhook uses
-- the service role so it bypasses RLS regardless.
DO $$
BEGIN
  BEGIN
    REVOKE UPDATE (email_bounced, email_bounced_at, email_bounce_reason)
      ON users FROM anon, authenticated;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
