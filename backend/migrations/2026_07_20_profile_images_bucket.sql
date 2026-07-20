-- ════════════════════════════════════════════════════════════════════
-- Storage bucket for user profile pictures.
-- Run this in the Supabase SQL Editor.
--
-- The frontend previously tried to save a raw base64 data: URI directly
-- into users.profile_image, which the FIX F-06 validator (https:// only)
-- always rejected — profile photo uploads silently failed. This bucket
-- lets the frontend upload the file to Storage first, then save the
-- resulting public URL, matching the club-logos pattern.
--
-- Path convention: profile-images/{user_id}/avatar.{ext}
-- Policies are scoped from the start (not loosened-then-tightened like
-- club-logos was) — a user can only write/update/delete their own path.
-- ════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read profile images"        ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar"      ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar"      ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar"      ON storage.objects;

CREATE POLICY "Anyone can read profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
