# Handoff — land the 2026-07-25 security work upstream

Paste this whole file as the opening prompt of a fresh Claude Code session.

**Start that session with `damianphim/symbolos` as a source.** This matters:
the session that produced this work was scoped to `alexdduda/ai-advisor` only,
and cross-owner repo adds are not supported mid-session (`add_repo` returns
`cross-tier adds are not supported in v1`). That is the single reason this
work was never landed upstream. If your new session is scoped only to the
fork, you will hit the same wall.

---

## Where the work already is

Five commits, already pushed and current on the fork:

- **Repo:** `alexdduda/ai-advisor` (a public fork of `damianphim/symbolos`)
- **Branch:** `claude/symbolos-codebase-issues-ogwvxz`
- **Base:** branched from `main` at `232cf53`
- **Head:** `6e08d72`

```
6e08d72  Fix silently-401ing subscriber count; add security review notes
60d5b59  Restrict profile-images/club-logos buckets to raster image MIME types
2271940  Add RLS migration for mcgill_sections and newsletter_events
d4f2efe  Bump transitive frontend deps to close known CVEs
15f8d87  Validate manager-invite email with EmailStr instead of bare @ check
```

11 files, +259 / −25. Nothing is uncommitted or unpushed.

---

## Task 1 — open the PR into upstream

Open a PR from `alexdduda/ai-advisor:claude/symbolos-codebase-issues-ogwvxz`
into `damianphim/symbolos:main`.

Check for a PR template first (`.github/pull_request_template.md`,
`.github/PULL_REQUEST_TEMPLATE.md`, root, or `docs/`) and mirror its headings
if one exists. Otherwise use the summary below as the body.

Do **not** rewrite, squash, or rebase the commits — each is scoped to one
fix with its rationale in the message.

### Suggested PR title

```
Security review fixes: SVG upload XSS, missing RLS, dependency CVEs
```

### Suggested PR body

> Internal security review pass. Prompted by a third-party pentest write-up
> of an unrelated app — none of its specific findings applied here (different
> stack), but the issue classes were used as a checklist.
>
> Full write-up, including everything checked and found clean, is in
> `docs/security-review-2026-07-25.md`.
>
> **Fixes**
>
> 1. **SVG upload → stored XSS (most serious).** The `profile-images` and
>    `club-logos` buckets had no `allowed_mime_types`, so they accepted
>    `image/svg+xml`. The only gate was a client-side
>    `file.type.startsWith('image/')`, which SVG passes — and `File.type` is
>    attacker-controlled anyway, bypassable by calling the Storage SDK
>    directly instead of using the UI. An SVG with an embedded `<script>`
>    executes when its public URL is opened directly or via
>    `<iframe>`/`<object>`. Fixed server-side with `allowed_mime_types` +
>    `file_size_limit` on both buckets, matching the existing `job-uploads`
>    pattern. Frontend checks tightened to an explicit raster whitelist —
>    that part is UX feedback, not the boundary.
>
> 2. **Two tables with no RLS.** `mcgill_sections` and `newsletter_events`
>    are queried by the backend but were never covered by the earlier RLS
>    migrations. Access is service-role only today (which bypasses RLS
>    regardless), so there was no live exploit — but it violated the repo's
>    own "new tables need RLS" invariant. Both follow the existing read-only
>    catalogue pattern.
>
> 3. **Four frontend dependency CVEs** — `brace-expansion` (high),
>    `postcss` (high), `tar` (moderate), `dompurify` (low). All transitive;
>    resolved with no `package.json` change. `pip-audit` on the backend was
>    clean.
>
> 4. **Weak email validation** on the manager-invite endpoint — a bare
>    `"@" in email` check, replaced with `EmailStr` to match how account
>    emails are validated elsewhere.
>
> 5. **Broken subscriber count** (functional, not a vulnerability).
>    `ClubsTab.jsx` called `/api/clubs/{id}/subscribers` with a bare
>    `fetch()` and no auth header. That endpoint was made auth-required by an
>    earlier security fix, so it has been 401ing ever since with the error
>    swallowed by `.catch(() => {})` — the count silently rendered as 0.
>    Routed through a new `clubsAPI.getClubSubscribers()` helper.
>
> **⚠️ Merging this does not apply fixes 1 and 2.** Both are SQL migrations,
> and per `backend/migrations/README.md` migrations in this repo are run by
> hand in the Supabase SQL Editor. See the deploy note below.
>
> **Verification:** frontend 59/59 tests pass, `npm run build` green,
> backend `test_clubs.py` 72/72 pass.

---

## Task 2 — flag the deploy step

The two migrations are **inert until someone runs them in the Supabase SQL
Editor.** Merging the PR does not apply them. Make sure this is not lost —
say it in the PR body (it is in the draft above) and in a review comment if
the PR gets approved without it being acknowledged.

Run in this order:

1. `backend/migrations/2026_07_25_rls_sections_and_newsletter_events.sql`
2. `backend/migrations/2026_07_25b_restrict_image_bucket_mime_types.sql`

Both are idempotent and need no downtime.

Verification queries:

```sql
-- Expect relrowsecurity = true for both
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('mcgill_sections', 'newsletter_events');

-- Expect {image/png,image/jpeg,image/webp,image/gif} for both
SELECT id, allowed_mime_types, file_size_limit
FROM storage.buckets
WHERE id IN ('profile-images', 'club-logos');
```

**You almost certainly cannot do this step yourself** — it needs Supabase
dashboard access, which is not in the repo. Do not claim it is done. Hand it
to the human, and tell them fix 1 (the SVG XSS vector) stays open in
production until migration 2 runs.

---

## Task 3 — watch the PR

After opening it, offer to subscribe to PR activity (`subscribe_pr_activity`)
and drive CI to green. CI config is `.github/workflows/ci.yml`; the backend
tests need dummy env vars, which that workflow already sets — mirror them if
you run tests locally:

```
ANTHROPIC_API_KEY=sk-ant-dummy-for-ci
SUPABASE_URL=https://test.supabase.co
SUPABASE_SERVICE_KEY=service-dummy
SUPABASE_ANON_KEY=anon-dummy
ADMIN_SECRET=ci-admin-secret-padded-to-32-chars-or-more
CRON_SECRET=ci-cron-secret-padded-to-32-chars-or-more
ADMIN_EMAILS=admin@symbolos.ca
RESEND_API_KEY=re_ci_dummy
```

`pytest` is not in `requirements.txt`; install it separately.

---

## Known-clean — do not redo this

Already swept this pass. Re-checking is wasted effort unless the code moved:

- **IDOR** — all 39 `{user_id}` routes enforce `require_self()`, and
  `require_self` itself is a correct strict-equality check. All 40 routes
  keyed by other resource IDs (`{job_id}`, `{card_id}`, `{post_id}`,
  `{club_id}`, `{request_id}`, …) verify ownership or role; scoped deletes
  correctly filter on both the resource ID and the owning ID.
- **Auth** — JWTs verified server-side via Supabase `auth.get_user()`; no
  local static-secret decode, so no "missing secret ⇒ forgeable token" path.
- **CORS** — explicit validated allowlist, no wildcard.
- **Rate limiting** — tiered per IP and per user; fails *closed* to a
  conservative in-memory limit on DB outage.
- **Secrets** — all `CRON_SECRET`/`ADMIN_SECRET` comparisons use
  `hmac.compare_digest`; both validated ≥32 chars at startup.
- **Webhooks** — Resend verified with HMAC-SHA256, constant-time compare,
  5-minute replay window, fail-closed in production.
- **SSRF** — newsletter feed fetcher blocks private IPs, `localhost`, cloud
  metadata hosts, non-HTTP schemes.
- **SQL injection** — no interpolated SQL; RPC calls parameterized.
- **PII** — all three transcript layers intact.
- **Frontend XSS** — no `dangerouslySetInnerHTML`, `eval`, or `innerHTML =`;
  CSP has no `unsafe-inline` in `script-src`.

## Open, not addressed

- `_ADMIN_USER_IDS` is hardcoded in `auth.py` and duplicated in
  `clubs/permissions.py`, kept in sync by hand. Drift risk, not a
  vulnerability. Worth consolidating; out of scope for this PR.
- This was static review — it finds missing controls, not multi-step business
  logic abuse. A pentest is complementary, not redundant. Do not describe
  this work as "the app is secure".
