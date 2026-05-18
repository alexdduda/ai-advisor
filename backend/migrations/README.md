# Database migrations

Run these in the Supabase SQL Editor, in order.

| File | What it does |
|---|---|
| `2026_04_14_forum_reviews_and_professors.sql` | Adds `professor` to course tables, review fields to `forum_posts`, drops legacy category CHECK |
| `2026_04_14_club_logos_and_activity.sql` | Adds `clubs.logo_url`, creates the public `club-logos` storage bucket and RLS policies |
| `2026_04_14_scaling_indexes.sql` | Adds hot-path indexes (forum sort, user-scoped queries, notification cron) — safe to re-run |

All migrations are idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, `DO $$ ... END $$` guards) so re-running them is a no-op.

---

## Supabase connection pooler

Once you cross ~1k concurrent users, each Vercel serverless invocation opening
a fresh Postgres connection becomes the bottleneck. Supabase ships a built-in
PgBouncer pooler — switch to it by editing **one env var**:

1. Supabase dashboard → **Settings → Database → Connection string**
2. Pick the **Transaction** mode pooler (port `6543`, not `5432`)
3. Copy that URL and set it as `SUPABASE_URL` in your Vercel env vars

Two gotchas:

- The pooled connection requires the **Pro plan** ($25/mo). Free tier is direct only.
- Statement-level features (e.g. `LISTEN/NOTIFY`, prepared statements) are unavailable in
  Transaction mode. We don't use either, so this is safe.

Direct URL still works for migrations run from the SQL Editor — those don't go through the pooler.

---

## Scaling roadmap (where we are)

Already shipped (Tier 1 + parts of Tier 2):

- ✅ Tiered rate limits per endpoint (general 100 / chat 50 / Claude-heavy 30 rpm per IP, halved per user)
- ✅ Index migration for hot-path queries
- ✅ Anthropic prompt caching on `chat.py` (system block marked `ephemeral`)
- ✅ Anthropic prompt caching on `cards.py` (stream + generate + retranslate)
- ✅ Both models on Haiku 4.5 (no tier change needed)

Still TODO (revisit at ~5–10k users):

- Async-ify the remaining sync Supabase calls in `transcript.py`, `electives.py`, and `forum.py` (wrap with `asyncio.to_thread`)
- Move long-running PDF parsing off Vercel (Inngest, Trigger.dev, or Supabase Edge Functions)
- Real connection pool with `asyncpg` once we leave Vercel for a long-lived host
