-- ─────────────────────────────────────────────────────────────────────────────
-- 2026-07-25 — Restrict profile-images / club-logos buckets to raster images
--
-- SEC FIX: both public buckets accept any upload whose client-reported MIME
-- type starts with "image/" (frontend/src/lib/api.js uploadProfileImage,
-- frontend/src/lib/clubsAPI.js uploadClubLogo) — including image/svg+xml.
-- An SVG can carry an embedded <script> that executes when the object's
-- public URL is opened directly or loaded via <iframe>/<object>: a stored-XSS
-- vector on the Supabase Storage origin. The frontend check is client-side
-- only (File.type is attacker-controlled) and trivially bypassed by calling
-- the Storage SDK directly instead of going through the UI.
--
-- Lock both buckets down server-side to the raster formats the UI actually
-- produces, the same allowed_mime_types pattern already used for
-- job-uploads (2026_06_24_jobs_table.sql). file_size_limit mirrors the
-- frontend's own caps (5 MB avatar, 2 MB club logo) as defense in depth.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    file_size_limit     = 5242880   -- 5 MB
WHERE id = 'profile-images';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    file_size_limit     = 2097152   -- 2 MB
WHERE id = 'club-logos';
