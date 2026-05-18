-- ════════════════════════════════════════════════════════════════════
-- Scaling indexes — covers the hot-path filters/sorts the backend runs.
-- All use IF NOT EXISTS so re-running is safe and idempotent.
-- Run this in the Supabase SQL Editor.
-- ════════════════════════════════════════════════════════════════════

-- ── User-scoped tables (everything filtered by user_id) ──────────────
CREATE INDEX IF NOT EXISTS idx_advisor_cards_user_source_generated
  ON advisor_cards (user_id, source, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_completed_courses_user_code
  ON completed_courses (user_id, course_code);

CREATE INDEX IF NOT EXISTS idx_current_courses_user_code
  ON current_courses (user_id, course_code);

CREATE INDEX IF NOT EXISTS idx_favorites_user_created
  ON favorites (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date
  ON calendar_events (user_id, date);

-- ── Clubs / membership ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_clubs_user
  ON user_clubs (user_id);

CREATE INDEX IF NOT EXISTS idx_user_clubs_club
  ON user_clubs (club_id);

CREATE INDEX IF NOT EXISTS idx_clubs_created_by
  ON clubs (created_by);

CREATE INDEX IF NOT EXISTS idx_clubs_category
  ON clubs (category);

CREATE INDEX IF NOT EXISTS idx_club_join_requests_club_status
  ON club_join_requests (club_id, status);

CREATE INDEX IF NOT EXISTS idx_club_subscriptions_user
  ON club_subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_club_subscriptions_club
  ON club_subscriptions (club_id);

CREATE INDEX IF NOT EXISTS idx_club_events_club_date
  ON club_events (club_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_club_announcements_club_created
  ON club_announcements (club_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_club_managers_club
  ON club_managers (club_id);

-- ── Forum ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_created
  ON forum_posts (category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_created
  ON forum_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_likes
  ON forum_posts (like_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_replies_post_created
  ON forum_replies (post_id, created_at);

-- Already added in the reviews migration, here for completeness
CREATE INDEX IF NOT EXISTS idx_forum_posts_review_target
  ON forum_posts (review_target_type, review_target_value)
  WHERE review_target_type IS NOT NULL;

-- ── Notification queue (daily cron scans for due rows) ──────────────
CREATE INDEX IF NOT EXISTS idx_notification_queue_due
  ON notification_queue (sent, send_on)
  WHERE sent = FALSE;

-- ── Course catalogue (search hot path) ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_subject_catalog
  ON courses (subject, catalog);

-- Trigram index for fuzzy course search (case-insensitive title/code).
-- Requires pg_trgm extension. Skip silently if not enabled.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE INDEX IF NOT EXISTS idx_courses_title_trgm
      ON courses USING gin (title gin_trgm_ops);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- pg_trgm not available; ILIKE will fall back to seq scan
  NULL;
END $$;

-- ── Degree requirements (lookup by program key) ────────────────────
CREATE INDEX IF NOT EXISTS idx_requirement_blocks_program
  ON requirement_blocks (program_id);

CREATE INDEX IF NOT EXISTS idx_requirement_courses_block
  ON requirement_courses (block_id);

-- ── Users (lookups by email) ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email_lower
  ON users (LOWER(email));

-- ── Rate limit table (high write throughput, pruned by send_on) ────
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window
  ON rate_limits (key, window_start);
