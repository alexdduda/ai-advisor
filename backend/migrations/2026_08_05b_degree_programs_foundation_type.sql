-- ────────────────────────────────────────────────────────────────────────────
-- 2026-08-05b — Allow program_type = 'foundation'
--
-- The U0 Foundation seed introduced a new program_type in code, but
-- `degree_programs_program_type_check` was never told about it, so every
-- Foundation program insert failed with 23514:
--
--   new row for relation "degree_programs" violates check constraint
--   "degree_programs_program_type_check"
--
-- Same class of bug as 2026_07_20_advisor_cards_advice_category.sql — a new
-- enum-ish value added in the app but not in the DB constraint.
--
-- The list below is the union of:
--   * every value actually present in degree_programs today (major, minor,
--     honours, concentration, beng, diploma, bscarch, bge, core)
--   * every value the app knows how to render (TYPE_LABEL_KEYS in
--     DegreeRequirementsView.jsx adds joint_honours, required,
--     supplementary_minor)
--   * the new 'foundation'
--
-- It is therefore a superset of the old constraint: no existing row can fail
-- it, and nothing the seeds already emit is narrowed away.
--
-- Idempotent — safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE degree_programs
  DROP CONSTRAINT IF EXISTS degree_programs_program_type_check;

ALTER TABLE degree_programs
  ADD CONSTRAINT degree_programs_program_type_check
  CHECK (program_type IN (
    'major',
    'minor',
    'honours',
    'joint_honours',
    'concentration',
    'core',
    'required',
    'beng',
    'bge',
    'bscarch',
    'diploma',
    'supplementary_minor',
    'foundation'
  ));
