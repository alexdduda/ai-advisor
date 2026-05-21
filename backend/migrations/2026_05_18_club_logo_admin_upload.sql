-- ════════════════════════════════════════════════════════════════════
-- Admins (invited managers) can now upload/update/delete the club logo,
-- not just the owner. Same privilege model as edit_club / manage_members.
-- Run after 2026_04_14_security_tighten_logo_policies.sql.
-- ════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Club owners can upload their own logo" ON storage.objects;
DROP POLICY IF EXISTS "Club owners can update their own logo" ON storage.objects;
DROP POLICY IF EXISTS "Club owners can delete their own logo" ON storage.objects;

-- Helper subquery: clubs the caller can manage (owner OR user_clubs.admin)
-- Inlined into each policy via WITH CHECK / USING.

CREATE POLICY "Club managers can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'club-logos'
    AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM clubs WHERE created_by = auth.uid()
      )
      OR (storage.foldername(name))[1]::uuid IN (
        SELECT club_id FROM user_clubs
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Club managers can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'club-logos'
    AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM clubs WHERE created_by = auth.uid()
      )
      OR (storage.foldername(name))[1]::uuid IN (
        SELECT club_id FROM user_clubs
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Club managers can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'club-logos'
    AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM clubs WHERE created_by = auth.uid()
      )
      OR (storage.foldername(name))[1]::uuid IN (
        SELECT club_id FROM user_clubs
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );
