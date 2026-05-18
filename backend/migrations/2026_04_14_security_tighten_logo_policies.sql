-- ════════════════════════════════════════════════════════════════════
-- SECURITY FIX — tighten club-logos storage policies so only the club
-- owner can upload/update/delete their own club's logo.
--
-- Previous policies (in 2026_04_14_club_logos_and_activity.sql) only
-- checked bucket_id, meaning any authenticated user could overwrite any
-- club's logo by knowing the club's UUID.
-- ════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can upload logos"   ON storage.objects;
DROP POLICY IF EXISTS "Club owners/admins can update logos"    ON storage.objects;
DROP POLICY IF EXISTS "Club owners/admins can delete logos"    ON storage.objects;

-- Upload path is club-logos/{club_id}/logo.{ext}.
-- (storage.foldername(name))[1] returns the first path segment.
CREATE POLICY "Club owners can upload their own logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'club-logos'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM clubs WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Club owners can update their own logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'club-logos'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM clubs WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Club owners can delete their own logo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'club-logos'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM clubs WHERE created_by = auth.uid()
    )
  );

-- "Anyone can read club logos" policy from the original migration stays.
