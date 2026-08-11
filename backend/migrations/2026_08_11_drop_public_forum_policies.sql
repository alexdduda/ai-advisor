-- ─────────────────────────────────────────────────────────────────────────────
-- 2026-08-11 — Drop leftover {public} policies on forum_posts / forum_replies
--
-- MIGRATION DRIFT. 2026_06_23_rls_forum_and_club_tables.sql created the
-- intended {authenticated} policies, but its DROP list only named the NEW
-- policy names (forum_posts_select_auth, _insert_own, …). The older
-- {public} policies were never named, so they survived — and production ended
-- up running both sets at once.
--
-- Postgres OR's permissive policies together, so the most permissive wins:
--
--   forum_posts_select    {public}  USING (true)   <-- anon reads everything
--   forum_posts_select_auth {authenticated} USING (true)
--
-- Net effect: anyone holding the anon key — which ships in the frontend
-- bundle — could read the entire forum, including user_id, with no account.
-- The forum is McGill-only by design (require_mcgill_email gates posting), and
-- the clubs migration explicitly guarded against exactly this ("the anon key
-- in the bundle means anyone with it can — lock it down here"). Verified
-- against production: anon SELECT returned real posts.
--
-- Writes were NOT exposed: the {public} insert/delete policies key off
-- auth.uid(), which is NULL for anon, so they never matched. Confirmed
-- empirically — an anon INSERT was rejected with a row-level security
-- violation and an anon UPDATE affected 0 rows. They are dropped anyway as
-- duplicates of the {authenticated} versions, so one set of policies remains
-- and the repo matches production.
--
-- Every command stays covered by the {authenticated} policies that remain:
--   SELECT  forum_posts_select_auth / forum_replies_select_auth
--   INSERT  forum_posts_insert_own  / forum_replies_insert_own
--   UPDATE  forum_posts_update_own  / forum_replies_update_own
--   DELETE  forum_posts_delete_own  / forum_replies_delete_own
--
-- Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "forum_posts_select"   ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_insert"   ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_delete"   ON public.forum_posts;

DROP POLICY IF EXISTS "forum_replies_select" ON public.forum_replies;
DROP POLICY IF EXISTS "forum_replies_insert" ON public.forum_replies;
DROP POLICY IF EXISTS "forum_replies_delete" ON public.forum_replies;


-- ── Verify ───────────────────────────────────────────────────────────────────
-- Expect ONLY {authenticated} rows to remain — no {public}:
--
--   SELECT tablename, policyname, roles, cmd
--   FROM pg_policies
--   WHERE schemaname='public' AND tablename IN ('forum_posts','forum_replies')
--   ORDER BY tablename, policyname;
--
-- Then, with the anon key, this must return 0 rows:
--   SELECT id FROM forum_posts;
