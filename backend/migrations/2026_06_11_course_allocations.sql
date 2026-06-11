-- ────────────────────────────────────────────────────────────────────────────
-- 2026-06-11 — Course allocations (Degree Planning)
--
-- Persists which program a student chose to count a given course toward,
-- for two cases:
--   1. Overlap resolution — a course that satisfies blocks in >1 program;
--      the student picks which one it counts for.
--   2. Manual electives — a course that matches no block but the student
--      assigns it to a major/minor ("Other Courses (Added by you)").
--
-- Previously this lived only in the browser's localStorage, so it didn't
-- follow the user across devices. This table is the source of truth; the
-- frontend keeps a localStorage copy as an instant-paint cache.
--
-- Idempotent — safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS course_allocations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_code  text NOT NULL,          -- normalized "SUBJ CAT", e.g. "ANTH 209"
  program_key  text NOT NULL,          -- e.g. "anthropology_minor"
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  -- One allocation per course per user (a course counts toward one program).
  UNIQUE (user_id, course_code)
);

-- Fast lookup of all of a user's allocations (the GET on Degree Planning load).
CREATE INDEX IF NOT EXISTS idx_course_allocations_user
  ON course_allocations (user_id);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE course_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_alloc_select_own" ON course_allocations;
CREATE POLICY "course_alloc_select_own"
  ON course_allocations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "course_alloc_insert_own" ON course_allocations;
CREATE POLICY "course_alloc_insert_own"
  ON course_allocations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "course_alloc_update_own" ON course_allocations;
CREATE POLICY "course_alloc_update_own"
  ON course_allocations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "course_alloc_delete_own" ON course_allocations;
CREATE POLICY "course_alloc_delete_own"
  ON course_allocations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Keep updated_at fresh on upsert.
CREATE OR REPLACE FUNCTION touch_course_allocations_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_course_allocations_updated_at ON course_allocations;
CREATE TRIGGER trg_course_allocations_updated_at
  BEFORE UPDATE ON course_allocations
  FOR EACH ROW EXECUTE FUNCTION touch_course_allocations_updated_at();
