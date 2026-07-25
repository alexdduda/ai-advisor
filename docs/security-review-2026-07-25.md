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

## Follow-up pass — 2026-07-25 (post-migration verification)

The migrations above were applied and then **verified empirically**, not by
re-reading the SQL:

- `storage.buckets` for `profile-images` and `club-logos` both report
  `{image/png,image/jpeg,image/webp,image/gif}` with the intended size caps.
- RLS confirmed by querying `mcgill_sections`, `newsletter_events`, `users`
  and `completed_courses` with the **anon** key: 0 rows in every case.
  `audit_log` is not exposed in PostgREST's schema cache at all.

Attempting the actual attack surfaced two residuals:

### 1. `allowed_mime_types` checks the declared type, not the bytes

A `image/svg+xml` upload is correctly rejected. But SVG **bytes** uploaded
with a lied `Content-Type: image/png` were *accepted* into `profile-images`.
Supabase validates the declared Content-Type header, not file content.

**This is not exploitable as XSS.** Traced end to end: the object is served
back as `image/png`, and browsers do not sniff `image/png` into SVG script
execution — the same lie that defeats the filter also neuters the payload.
SVG loaded via `<img>` is script-disabled by spec regardless, and
`profile_image` URLs are already constrained to our own bucket by the F-06
validator in `users.py`.

Hardened anyway (`frontend/src/lib/imageBytes.js`): both upload paths now
verify magic bytes and send the *sniffed* type as `contentType`, so a
mislabelled file cannot dictate how it is later served. Covered by
`imageBytes.test.js`, including the exact SVG-as-PNG case.

**Residual, accepted:** this is client-side. Anything calling the Storage
SDK directly still bypasses it, and the bucket will still accept SVG bytes
under a lied header. Closing that properly would require proxying uploads
through the backend for server-side byte validation — disproportionate for a
non-exploitable issue. Revisit if these buckets are ever served from an
origin that honours `image/svg+xml`.

### 2. No `X-Content-Type-Options: nosniff` on storage objects

Our own API sets `nosniff` (`main.py`), but public bucket URLs are served by
Supabase's CDN, which we cannot add response headers to from application
code. **Not fixable in this repo** — it needs Supabase-side configuration.
Defense-in-depth only; the MIME allowlist is the actual control.

### 3. Prompt injection on the club-translation path — fixed

`clubs/translation.py` interpolated club-owner-controlled text into a Claude
prompt with no `sanitise_context_field`, unlike every other LLM path. Bounded
(1000/300/2000-char fields, JSON-parsed output with per-field fallback) and
not an XSS vector — there is no `dangerouslySetInnerHTML` anywhere in the
frontend. The realistic abuse was **moderation evasion**: write benign
English, steer the model into emitting an unrelated FR/ZH "translation" that
an English-only reviewer never sees. Now sanitised with per-field caps that
mirror the `schemas.py` bounds (using the 500-char default would have
silently truncated legitimate descriptions).

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
