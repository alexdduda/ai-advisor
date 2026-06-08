# Symbolos — pre-launch checklist

What's coded is on this branch. What's NOT coded (dashboard clicks,
credit-card stuff, DNS) is below. Tick them off in order.

## Env vars to add in Vercel (both projects, all environments)

Settings → Environment Variables. Add the ones below; they're all
*soft* — code already falls back to no-op behavior if a key is missing,
so you can ship without them and add later. But the launch IS smoother
if all of these are set before you flip the switch.

### Backend project

| Variable | Where to get it | What breaks without it |
|---|---|---|
| `SENTRY_DSN` | sentry.io → Create project (Python/FastAPI) → DSN | No backend exception tracking. Errors die in Vercel logs. |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.1` (default) | Higher sampling = more Sentry quota burn. Tune later. |
| `RESEND_WEBHOOK_SECRET` | Resend → Webhooks → Add → "Signing Secret" (`whsec_...`) | Bounce/complaint webhook can't verify origin → it'll 401 every event. |
| `LLM_BUDGET_CHAT_PER_DAY` | `200` | None — falls back to default. Lower if costs spike. |
| `LLM_BUDGET_CARDS_PER_DAY` | `40` | Same. |
| `LLM_BUDGET_ELECTIVES_PER_DAY` | `20` | Same. |
| `LLM_BUDGET_TRANSCRIPT_PER_DAY` | `8` | Same. |

Pooler URL — switch the existing Supabase URL var to the pooler endpoint:

| Variable | New value |
|---|---|
| `SUPABASE_URL` | unchanged — keep the original |
| Database connection URL (anywhere it appears as `postgres://...:5432/...`) | change `:5432` to `:6543` (Supabase Supavisor transaction pooler) |

### Frontend project

| Variable | Where to get it | What breaks without it |
|---|---|---|
| `VITE_SENTRY_DSN` | sentry.io → Create project (React) → DSN | No frontend crash tracking. |
| `VITE_SENTRY_ENVIRONMENT` | `production` | Sentry can't separate prod vs preview events. |
| `VITE_POSTHOG_KEY` | posthog.com → Project → API Key (the public `phc_…`) | No funnel analytics. |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` (or EU if you choose) | Defaults to US — fine. |
| `VITE_VERCEL_GIT_COMMIT_SHA` | Vercel injects automatically — no action needed | Sentry releases tagged as "dev" → harder to attribute regressions. |

## Dashboard tasks (no code involved)

### Sentry
1. sentry.io → create org "Symbolos" (or use existing).
2. Create two projects: `symbolos-backend` (Python/FastAPI), `symbolos-frontend` (React).
3. Copy each DSN into the env vars above.
4. Settings → Alerts → "Issue alert" → notify on any new error class. Email to you + partner.
5. Quota: free tier = 5k errors/month. Watch for the first week; raise the `ignoreErrors` filter in `frontend/src/lib/telemetry.js` if a noisy class burns through it.

### PostHog
1. posthog.com → create project "Symbolos."
2. Insights → Funnels → New funnel with these events in order:
   - `signup_completed` → `email_verified` → `onboarding_completed` → `first_card_seen` → `card_chip_clicked`
3. That's your launch retention dashboard.
4. Privacy: Settings → "Recordings" → mask all inputs (already coded but verify in the UI).

### Uptime + status page
1. betterstack.com (free tier) → Create monitor:
   - URL: `https://ai-advisor-backend-seven.vercel.app/api/health`
   - Method: GET
   - Expected: 200 with body `"healthy"`
   - Frequency: 1 min
2. Same site → Status Pages → Create → connect the monitor.
3. Custom domain: point `status.symbolos.ca` CNAME to it.
4. Alert channels: add yourself + partner via email AND push notification.

### Cost alerts (every paid service, do all five)
| Service | Where |
|---|---|
| Anthropic | console.anthropic.com → Plans & Billing → Spend limits. Set alerts at 50% / 80% of expected monthly spend. |
| Vercel | vercel.com → Team → Settings → Billing → Spend management. |
| Supabase | supabase.com → Org Settings → Usage → Budget alerts. |
| Resend | resend.com → Settings → Billing → Notifications. |
| PostHog | posthog.com → Billing → Usage alerts. |

### GitHub
1. Settings → Secrets and variables → Actions → none needed yet (CI uses dummy values).
2. Settings → Security → Dependabot → enable alerts + security updates (the `.github/dependabot.yml` file handles the PR cadence; this enables the alerting).
3. Settings → Branches → Branch protection on `main`:
   - Require PR before merging
   - Require status checks: `backend`, `frontend`, `secret-scan`
   - Require branches to be up to date

## SQL migrations to run in Supabase (in order)

```
backend/migrations/2026_06_01_sec_rls_clubs_pii.sql       (you ran this)
backend/migrations/2026_06_02_email_bounce_columns.sql    (still needed)
```

## Partner's queue (HANDOFF_SECURITY.md)

DNS records + Supabase autoconfirm + custom SMTP + dmarcian.

Until that lands, **don't open signups**. Verification emails won't
arrive reliably without DKIM, so every new user will get stuck on the
verify screen.

## Ship sequence

```
1.  Partner finishes HANDOFF_SECURITY.md.
2.  You: run 2026_06_02_email_bounce_columns.sql.
3.  You: add all the env vars above to both Vercel projects.
4.  You: enable Sentry, PostHog, Better Stack uptime+status.
5.  You: enable Vercel deploy protection on backend prod, set up cost alerts.
6.  You: open a fresh incognito → sign up → click verification link →
        confirm Dashboard loads → confirm one signup event lands in
        PostHog and an "ANOMALY" log line CAN be triggered by
        spam-clicking forum POST.
7.  You: post in #status "we are now open to invites" or whatever the
        soft-launch comms is.
8.  Watch Sentry + uptime + dmarcian for 48 hours.
9.  Two weeks in: tighten DMARC p=none → p=quarantine.
10. Four weeks in: p=quarantine → p=reject.
```

That's launch.

## What's intentionally deferred

- Backup restore drill (run within first month, then quarterly)
- Feature flags (add when there's a 2nd developer)
- Staging Supabase project (add when there's a risky migration coming)
- WCAG audit (run within first quarter)
- Image CDN (only matters if you accept user-uploaded images at scale)
- Native mobile (the mobile-web parity work covers it)
- A/B testing (premature — get to 1000 active users first)

If any of these become urgent, the file structure is already set up to
plug them in.
