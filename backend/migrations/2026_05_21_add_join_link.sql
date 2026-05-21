-- Add optional join_link column to club_events and club_announcements
-- Allows posters to attach a Zoom/Teams/etc. link to events and announcements

ALTER TABLE club_events ADD COLUMN IF NOT EXISTS join_link text;
ALTER TABLE club_announcements ADD COLUMN IF NOT EXISTS join_link text;
