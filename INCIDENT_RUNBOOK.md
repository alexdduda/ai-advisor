# Symbolos — incident runbook

One page. Skim it now so you know where things are when something is on
fire. Top of page = "I don't know what's wrong, just fix it." Lower
sections = specific failure modes with the right command to run.

## On-call basics

**Primary on-call:** Alex (alexdduda@…)
**Secondary:** Partner (symbolosadvsry@…)
**Escalation:** the other person if first is offline >30 min.

**You always need:**
- Vercel access (frontend + backend projects)
- Supabase Studio access
- Sentry (errors)
- Status page admin (to post incident)
- Resend (email)

If you can't reach one of the above, that's the first thing to fix — get
the partner to grant you team access *before* you actually need it.

---

## "I don't know what's broken" — triage in 60 seconds

```bash
# 1. Is the frontend up?
curl -I https://symbolos.ca | head -1

# 2. Is the backend up?
curl -s https://ai-advisor-backend-seven.vercel.app/api/health

# 3. Is Supabase up?
open https://status.supabase.com

# 4. Is Anthropic up?
open https://status.anthropic.com

# 5. Latest deploys
open https://vercel.com/<your-team>/ai-advisor/deployments

# 6. Recent errors
open https://<your-sentry-org>.sentry.io/issues/
```

If all five are green and Sentry is quiet → it's almost certainly DNS or
a user-specific cookie/JWT issue, not infrastructure.

---

## Failure modes (in rough order of likelihood)

### A. The frontend won't load

**Symptom:** symbolos.ca shows Vercel's "deployment failed" page or a
blank screen.

**Check:**
1. Vercel → Deployments → look at the most recent one.
2. If status is "Error": the build failed. Click for the log.
3. If status is "Ready" but the page is blank: open browser DevTools →
   Console. Look for a CSP violation or a 404 on `/assets/index-*.js`.

**Fix:** Click the previous successful deployment → "Promote to
Production." That instantly reverts. Then debug at leisure.

```bash
# From a terminal, if you have the Vercel CLI:
vercel rollback https://symbolos.ca
```

### B. The backend is down (5xx everywhere)

**Symptom:** every API call returns 500/502/503. Dashboard loads but
shows red errors.

**Check:**
1. `curl https://ai-advisor-backend-seven.vercel.app/api/health` — if
   500, the function is crashing on import.
2. Vercel → backend project → Functions → click any function → look at
   the Runtime Logs.
3. Common causes:
   - Missing env var (someone rotated `ANTHROPIC_API_KEY` and forgot to
     update Vercel).
   - Bad Supabase migration that broke a table the API queries.
   - Bad recent deploy.

**Fix:**
- Roll back the backend deploy (same way as frontend).
- If env var: re-paste it in Vercel → Settings → Environment Variables,
  redeploy.
- If migration: roll the migration back in Supabase Studio → SQL Editor
  with the inverse statements, then re-deploy.

### C. Anthropic costs spiking

**Symptom:** Sentry alert "LLM budget exceeded" appearing for many users,
OR Anthropic dashboard shows $/day climbing fast.

**Check:**
1. Anthropic console → Usage → which model + which user?
2. Sentry → search `anomaly action=card_chip_click count` — looks for
   the per-user threshold alerts the anomaly logger writes.
3. Supabase → SQL Editor:
   ```sql
   SELECT key, count FROM rate_limits
   WHERE key LIKE 'llm_budget:%'
   AND window_start = date_trunc('day', now())
   ORDER BY count DESC LIMIT 20;
   ```
   Top rows are the heaviest users today.

**Fix:**
- Temporary: lower the daily budget env vars in Vercel (e.g.
  `LLM_BUDGET_CHAT_PER_DAY=50`). Takes effect on next request.
- Specific bad actor: ban them via Supabase Studio → auth.users →
  set `banned_until = now() + interval '1 year'`.
- Last resort: pause Anthropic key — they stop, every legit user also
  stops. Use only if you're being financially attacked.

### D. Verification email isn't arriving

**Symptom:** new users stuck on the verify screen, Resend dashboard
shows mail "delivered" but nobody got it.

**Check:**
1. Resend → Domains → symbolos.ca. **Is DKIM green?** If red, that's
   why — `HANDOFF_SECURITY.md` step 1 isn't complete.
2. dmarcian dashboard — is mail showing up there as "passed" or
   "failed"?
3. Pick a stuck user → Resend → Logs → search for their address. Look
   at the actual SMTP response from McGill's mail server. McGill IT
   sometimes greylists / blocks based on SPF reputation.

**Fix:**
- Most common: DKIM/SPF/DMARC missing → finish security handoff.
- McGill blocking: open a ticket with McGill IT, give them the source
  IP from Resend's logs, ask them to allowlist.
- Resend itself down: check https://status.resend.com.

### E. Database slow (>2s response times)

**Symptom:** Sentry shows slow `transaction` events on every endpoint;
users complain of laggy loads.

**Check:**
```sql
-- Supabase SQL Editor
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC LIMIT 20;
```
Look for any query with high mean time + high call count. Usually a
missing index.

**Fix:**
- Add the missing index. Migrations in `backend/migrations/` show the
  pattern — copy one, write the index, run it in Supabase SQL Editor.
- Connection-pool exhaustion: ensure backend uses Supavisor on port
  6543, not 5432. Check Vercel env `SUPABASE_*` strings.

### F. Sentry flooding (>1000 errors/hour)

**Symptom:** Sentry inbox is unmanageable. Quota almost certainly
exhausted by end of day.

**Check:** First few groups by frequency — there's usually one error
swallowing everything else.

**Fix:**
- If it's a single recurring exception in user code: revert / hotfix.
- If it's a Sentry SDK noise (rate-limit 429s, AbortControllers): add
  a `beforeSend` filter in `frontend/src/lib/telemetry.js`.
- Inhibit specific errors:
  ```js
  Sentry.init({ ignoreErrors: [/Network Error/, /AbortError/] })
  ```

### G. Database backup needed (data corruption / wrong deploy)

**Check:** Supabase → Database → Backups. Point-in-Time-Recovery
covers the last 7 days on Pro tier.

**Fix:**
1. **STOP all writes** first — pause the backend deploy in Vercel
   (Settings → General → Pause deployment) so no further writes
   complicate the restore window.
2. Pick the PITR timestamp just before the corruption.
3. Click "Restore." Supabase performs the restore into a NEW project —
   it never overwrites prod.
4. Update Vercel env `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` /
   `SUPABASE_ANON_KEY` to the new project.
5. Trigger a re-deploy. Unpause.
6. Post-mortem: write up what went wrong, file a Notion task to add the
   missing guardrail.

**Practice this once a quarter** so you know it works. The doc says do
it; if you've never done it, you don't actually have a backup.

---

## Status page communication template

When you've confirmed the incident is real and user-facing, post to the
status page immediately. Don't wait until you have a fix.

```
**Investigating** (post within 5 min of detection)
We're seeing elevated errors on the dashboard. We're investigating.

**Identified** (when you know the cause)
Issue identified as <thing>. Working on a fix now. ETA: <N> minutes.

**Monitoring** (after deploy of fix)
A fix has been deployed and metrics are returning to normal. Monitoring.

**Resolved** (after 30 min of clean metrics)
Incident resolved. Post-mortem coming this week.
```

Users tolerate outages far better than they tolerate silence.

---

## Post-mortem template

Within 48h of any user-visible incident, write a `POSTMORTEM_YYYY-MM-DD.md`
in the repo with:

1. Timeline (when detected, when paged, when fixed)
2. Impact (how many users, how long, what couldn't they do)
3. Root cause (the one sentence answer)
4. Action items (with owners, with due dates)

Blame-free. The point is "what guardrail was missing," not "who pushed
the bad commit."

---

## When NOT to push at 2am

Three rules:
1. **Never deploy a major refactor at night.** Roll back the bad thing
   and ship the real fix in daylight.
2. **Never disable a security check to fix a bug.** The auditor caught
   11 of them. Adding the 12th is not an emergency-response move.
3. **Never bypass the verification gate to let "just this one user" in.**
   If a real user needs help, set `email_confirmed_at` on their auth
   row from Supabase Studio. Don't loosen the rule for everyone.
