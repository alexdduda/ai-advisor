-- ════════════════════════════════════════════════════════════════════
-- Backfill: default username to the first name derived from McGill email
-- for any existing user whose username is NULL or empty.
--   'first.last@mail.mcgill.ca' → 'First'
-- New users get this default automatically in create_user() going forward.
-- ════════════════════════════════════════════════════════════════════

UPDATE users
SET username = INITCAP(SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 1))
WHERE (username IS NULL OR TRIM(username) = '')
  AND email IS NOT NULL
  AND email <> ''
  AND POSITION('@' IN email) > 0;
