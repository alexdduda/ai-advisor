-- ────────────────────────────────────────────────────────────────────────────
-- 2026-10-27 — Allow type = 'exam' (and the other types the app writes) on
--              calendar_events
--
-- The Calendar tab turns each student's final exams into events and schedules
-- them through POST /api/notifications/schedule with type = 'exam'. Every call
-- failed with 23514:
--
--   new row for relation "calendar_events" violates check constraint
--   "calendar_events_type_check"
--
-- (Sentry SYMBOLOS-BACKEND-1D.) The constraint exists in production but in no
-- migration, so its allowed list is unknown here. Same class of bug as
-- 2026_08_05b_degree_programs_foundation_type.sql and
-- 2026_09_10_calendar_events_client_id.sql: the app writes something the
-- database was never told about. Exam reminders from the schedule path could
-- not have been queued until this is applied.
--
-- Because the current list is unknown, this rebuilds the constraint from the
-- UNION of:
--   * every value the existing constraint already allows (read from the
--     catalog, so nothing is narrowed away)
--   * every value already stored in calendar_events (so adding the constraint
--     cannot fail on existing rows)
--   * every type the app writes: the Calendar UI's own types (personal,
--     academic, club, exam) and the syllabus extractor's (assignment,
--     midterm, final), plus quiz, which the reminder email supports
--
-- Idempotent — safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  allowed text;
BEGIN
  SELECT string_agg(quote_literal(t), ', ' ORDER BY t)
    INTO allowed
  FROM (
    SELECT unnest(ARRAY[
      'personal', 'academic', 'club', 'exam',
      'assignment', 'midterm', 'final', 'quiz'
    ]) AS t

    UNION

    SELECT DISTINCT type FROM calendar_events WHERE type IS NOT NULL

    UNION

    SELECT m[1]
    FROM pg_constraint c,
         LATERAL regexp_matches(pg_get_constraintdef(c.oid), '''([^'']+)''', 'g') AS m
    WHERE c.conname = 'calendar_events_type_check'
      AND c.conrelid = 'calendar_events'::regclass
  ) s;

  ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_type_check;

  EXECUTE format(
    'ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_type_check CHECK (type IN (%s))',
    allowed
  );
END $$;
