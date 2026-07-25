# Security review — 2026-07-25

Internal review pass. Scope: dependency CVEs, IDOR/ownership enforcement, RLS
coverage, storage buckets, webhook signatures, prompt-injection and PII paths,
frontend XSS surface.

This review was prompted by a third-party pentest write-up of an unrelated
app. None of the specific findings in that write-up applied here (different
stack, different features), but the issue *classes* were used as the checklist.

---

## ACTION REQUIRED — run these in the Supabase SQL Editor

Two of the fixes below are SQL migrations. Per `backend/migrations/README.md`
migrations are **not** applied automatically — until these are run in the
Supabase SQL Editor, the fixes are inert in production.

| Order | File | Why |
|---|---|---|
| 1 | `backend/migrations/2026_07_25_rls_sections_and_newsletter_events.sql` | Enables RLS on `mcgill_sections` + `newsletter_events` |
| 2 | `backend/migrations/2026_07_25b_restrict_image_bucket_mime_types.sql` | Blocks SVG upload to `profile-images` / `club-logos` |

Both are idempotent and safe to re-run. Neither requires downtime.

**Verify after running:**

```sql
-- 1. Both tables should report rowsecurity = true
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('mcgill_sections', 'newsletter_events');

-- 2. Both buckets should list only raster MIME types
SELECT id, allowed_mime_types, file_size_limit
FROM storage.buckets
WHERE id IN ('profile-images', 'club-logos');
```

Expected: `relrowsecurity = true` for both tables; `allowed_mime_types =
{image/png,image/jpeg,image/webp,image/gif}` for both buckets.

---

## Findings and fixes

### 1. SVG upload to public image buckets — stored XSS (highest severity here)

`profile-images` and `club-logos` were created without `allowed_mime_types`,
so they accepted any upload. The only gate was a client-side
`file.type.startsWith('image/')` check in `api.js` / `clubsAPI.js` —
`image/svg+xml` passes that check, and `File.type` is attacker-controlled
anyway (bypassable by calling the Storage SDK directly instead of using the
UI). An SVG carrying an embedded `<script>` executes when its public URL is
opened directly or loaded via `<iframe>`/`<object>`, on the Supabase Storage
origin.

Fixed by setting `allowed_mime_types` + `file_size_limit` on both buckets
server-side (migration 2 above), matching the pattern already used for
`job-uploads`. Frontend checks tightened from prefix-match to an explicit
raster whitelist — that part is UX feedback, not the boundary.

### 2. Two tables with no RLS

`mcgill_sections` and `newsletter_events` are queried by the backend
(`courses.py`, `newsletters.py`) but were never covered by the earlier RLS
migrations. Access today is service-role only, which bypasses RLS regardless,
so there was no live exploit — but it violated the project's own "new tables
need RLS" invariant and left no boundary if either is ever queried with the
anon/authenticated key. Both hold public, non-user-owned data, so they follow
the read-only catalogue pattern: authenticated read, service-role write.

### 3. Four dependency CVEs (frontend)

`brace-expansion` (high), `postcss` (high), `tar` (moderate), `dompurify`
(low). All transitive, resolved by `npm audit fix` with no `package.json`
change. `pip-audit` on the backend: clean, 0 vulnerabilities.

### 4. Weak email validation on manager invite

`ManagerInviteCreate.email` was `str` with a manual `"@" in email` check,
weaker than the `EmailStr` validation used for account emails. Switched to
`EmailStr`.

### 5. Broken subscriber count (functional regression from a prior security fix)

`ClubsTab.jsx` fetched `/api/clubs/{id}/subscribers` with a bare `fetch()`
and no `Authorization` header. That endpoint was made auth-required by an
earlier fix ("SEC FIX #3" — it previously let anonymous scrapers enumerate
every club's popularity). The call has been 401ing ever since, with the
failure swallowed by `.catch(() => {})`, so the count silently rendered as 0.
Routed through a new `clubsAPI.getClubSubscribers()` helper that sends auth
headers.

Not a vulnerability — but worth noting as a pattern: a bare `fetch()` to our
own API bypasses the `authHeaders()` convention and fails silently. Prefer
the `clubsAPI` / `api.js` helpers for all internal calls.

---

## Checked and found clean

- **IDOR**: all 39 `{user_id}` routes enforce `require_self()`, and
  `require_self` itself is a correct strict-equality check. All 40 routes
  keyed by other resource IDs (`{job_id}`, `{card_id}`, `{post_id}`,
  `{reply_id}`, `{club_id}`, `{event_id}`, `{request_id}`, …) verify
  ownership or role before acting; scoped deletes correctly filter on both
  the resource ID and the owning ID.
- **Auth**: JWTs verified server-side via Supabase `auth.get_user()` — no
  local static-secret decode, so there is no "missing secret ⇒ forgeable
  token" failure mode.
- **CORS**: explicit validated allowlist, no wildcard, correctly paired with
  `allow_credentials`.
- **Rate limiting**: tiered per-IP and per-user; on DB outage it fails
  *closed* to a conservative in-memory limit rather than disabling itself.
- **Secrets**: all `CRON_SECRET` / `ADMIN_SECRET` comparisons use
  `hmac.compare_digest`; both validated to ≥32 chars at startup.
- **Webhooks**: Resend verified with HMAC-SHA256, constant-time compare, a
  5-minute replay window, and fail-closed in production. Inngest signing key
  is required in production by a config validator.
- **SSRF**: the newsletter feed fetcher blocks private IPs, `localhost`,
  cloud metadata hosts, and non-HTTP schemes on every fetch.
- **SQL injection**: no string-interpolated SQL; all RPC calls are
  parameterized.
- **Mass assignment**: `UserUpdate` is a strict field whitelist; the
  `extra="allow"` models are scoped to a JSONB prefs blob, not DB columns.
- **PII**: all three transcript layers intact — local pypdf extraction,
  regex redaction before the Claude call, refusal of scanned PDFs, plus
  `_scrub_pii` on model output.
- **Prompt injection**: centralized filter with normalization (l33t,
  unicode, diacritics) covering direct messages and stored context fields.
- **Frontend XSS**: no `dangerouslySetInnerHTML`, no `eval`, no
  `innerHTML =`. CSP has no `unsafe-inline` in `script-src`, plus
  `object-src 'none'` and `frame-ancestors 'none'`.

---

## Not covered by this review

Static review finds missing controls; it does not find business-logic abuse
or exploit chains. A pentest is complementary, not redundant. Specifically
out of scope here:

- Multi-step logic abuse (e.g. club role escalation via a sequence of
  legitimate-looking requests).
- Live verification that the two migrations above were applied correctly —
  run the verification queries.
- `_ADMIN_USER_IDS` in `auth.py` is hardcoded and duplicated in
  `clubs/permissions.py`, kept in sync by hand. Not a vulnerability, but a
  drift risk worth consolidating.
- Supabase project-level config (email confirm settings, JWT expiry, service
  key rotation) — lives in the dashboard, not in this repo.
