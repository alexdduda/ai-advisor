# Symbolos security handoff — owner-only steps

Hey — this is a short checklist of the things the security audit fix
needs that **only you** can do, because they live in accounts that are
under your name (Supabase, the symbolos.ca registrar / Vercel domain
settings, dmarcian, Resend).

Three things, total. Each step has a verification command at the end
so you know it actually took effect. Estimated total time: ~45 min if
nothing fights back.

I (Alex) already shipped the code-level fixes; these are the ones I
can't push without your credentials.

---

## Step 1 — DNS records for symbolos.ca

**Why:** The audit found that `noreply@symbolos.ca` mail is spoofable
right now. No SPF, no DKIM, no DMARC. Anyone can send mail "from"
symbolos.ca to anyone. We need 4 DNS records so receivers (Gmail,
Outlook, etc.) can verify our mail and drop forgeries.

**Where to add them:** Wherever symbolos.ca's nameservers point.
Find out with:

```bash
dig +short NS symbolos.ca
```

- If you see `ns1.vercel-dns.com` / `ns2.vercel-dns.com` → add them in
  Vercel: top nav → **Domains** → click `symbolos.ca` → **DNS Records**
  tab → **Add Record** for each one below.
- If you see Cloudflare / Namecheap / GoDaddy / etc. → add them in
  that registrar's DNS panel. The fields are the same.

### Record 1: SPF

| Field | Value |
|---|---|
| Type | `TXT` |
| Name | `@` (or leave blank — the apex) |
| Value | `v=spf1 include:_spf.resend.com -all` |
| TTL | default (3600) |

### Record 2: DKIM

Log in to Resend → Domains → click `symbolos.ca` (add the domain first
if it isn't there) → it'll show you the DKIM record to add. It looks
like:

| Field | Value |
|---|---|
| Type | `TXT` |
| Name | `resend._domainkey` |
| Value | the long `p=...` string Resend gives you (copy-paste exactly, don't add quotes) |

Don't include the domain in the Name field — Vercel / Cloudflare /
etc. append it automatically. Use `resend._domainkey`, not
`resend._domainkey.symbolos.ca`.

### Record 3: DMARC (in monitor mode for 2 weeks first)

| Field | Value |
|---|---|
| Type | `TXT` |
| Name | `_dmarc` |
| Value | `v=DMARC1; p=none; rua=mailto:symbolosadvsry+rua@dmarcian.com; ruf=mailto:symbolosadvsry+ruf@dmarcian.com; fo=1; adkim=s; aspf=s` |

> Important: the `rua=` and `ruf=` addresses need to come from
> **dmarcian's exact format**. Log in to dmarcian (you made the account
> as `symbolosadvsry@gmail.com`), add `symbolos.ca` as a domain,
> and dmarcian will show you the *exact* DMARC TXT it wants — copy
> theirs, don't copy mine. The placeholders above are illustrative.

After 2 weeks of clean dmarcian reports, come back here, edit the
record, and change `p=none` → `p=quarantine`. Two more weeks at
quarantine, then `p=reject`.

### Record 4: Null MX

We don't accept inbound mail at symbolos.ca, so we publish a "null MX"
so spammers can't even try.

| Field | Value |
|---|---|
| Type | `MX` |
| Name | `@` |
| Priority | `0` |
| Value | `.` (literally a single dot) |

Some UIs reject a bare `.` — if Vercel does, skip this one. The other
three are the load-bearing ones.

### Verify

Give DNS 5–30 min to propagate, then:

```bash
dig +short TXT symbolos.ca | grep spf1            # expect a v=spf1 line
dig +short TXT resend._domainkey.symbolos.ca      # expect a long p= record
dig +short TXT _dmarc.symbolos.ca                 # expect v=DMARC1; p=none; ...
dig +short MX symbolos.ca                         # expect "0 ." or nothing
```

Or paste `symbolos.ca` into https://mxtoolbox.com/SuperTool.aspx and
hit "Domain Health" — it checks all four at once.

Finally, go back to Resend → Domains → symbolos.ca and hit **"Verify
DNS records"**. Should go green. If anything stays red, the value you
pasted has a typo or stray quote.

---

## Step 2 — Supabase: enforce email confirmation + route mail through Resend

**Why:** Right now Supabase has `mailer_autoconfirm = true`, which means
every signup gets a confirmed session immediately, without proving they
own the address. That's what made findings 1–3 of the audit reachable
from any throwaway email. The code-level fixes already require a
verified email for chat, cards, club join, forum post, etc. — but the
Supabase setting itself is the root cause and you need to flip it.

### 2a — Hook Supabase up to Resend SMTP

We do this *first* so when we flip the autoconfirm toggle in 2b, the
confirmation email actually goes out through our high-volume verified
sender (Resend) instead of Supabase's rate-limited 4-emails-per-hour
shared pool.

Supabase Dashboard → **Project Settings → Auth → SMTP Settings →
"Enable Custom SMTP"**

| Field | Value |
|---|---|
| Sender email | `noreply@symbolos.ca` |
| Sender name | `Symbolos` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your Resend API key (`re_...`) — grab from Resend → API Keys |
| Minimum interval | `60` |

Save. Hit **"Send test email"** — should arrive within ~10 seconds.
If it doesn't, the DKIM record from Step 1 isn't propagated yet (or
isn't right). Resend won't actually deliver until DKIM is green.

### 2b — Customize the confirmation email template

Supabase → **Authentication → Email Templates → Confirm signup**.

Subject:
```
Verify your Symbolos account
```

Body — replace the entire HTML with this:

```html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="background:linear-gradient(135deg,#ED1B2F 0%,#B01B2E 100%);border-radius:12px 12px 0 0;padding:24px 32px;">
          <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Symbolos</span>
        </td></tr>
        <tr><td style="background:#ffffff;padding:36px 32px;border:1px solid #e4e4e7;">
          <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 12px;">Verify your email address</h1>
          <p style="font-size:15px;color:#4b5563;margin:0 0 28px;line-height:1.65;">
            Thanks for signing up for Symbolos. Click the button below to confirm your email and activate your account.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="{{ .ConfirmationURL }}"
               style="display:inline-block;background:linear-gradient(135deg,#ED1B2F 0%,#B01B2E 100%);
                      color:#ffffff;padding:14px 36px;border-radius:8px;
                      text-decoration:none;font-weight:700;font-size:15px;">
              Verify email address →
            </a>
          </div>
          <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
            If you didn't sign up for Symbolos, ignore this email.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.7;">
            Symbolos · Not affiliated with McGill University<br>
            <a href="https://symbolos.ca/privacy" style="color:#9ca3af;">Privacy</a>
            &nbsp;·&nbsp;
            <a href="https://symbolos.ca/terms" style="color:#9ca3af;">Terms</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
```

Save.

### 2c — Set the redirect URL

Supabase → **Authentication → URL Configuration**

| Field | Value |
|---|---|
| Site URL | `https://symbolos.ca` |
| Redirect URLs | add `https://symbolos.ca/**` (the wildcard pattern) |

Save.

### 2d — Flip the autoconfirm toggle (THE actual fix)

Supabase → **Authentication → Providers → Email** → find the
**"Confirm sign up"** toggle (sometimes called **"Confirm email"**
depending on dashboard version).

It is currently **OFF** = autoconfirm is ON = the vulnerability.
**Turn it ON.** That makes Supabase require a confirmation click
before a session is treated as verified.

Save.

### 2e — Verify

```bash
curl -s https://<your-project-ref>.supabase.co/auth/v1/settings \
  | python3 -m json.tool | grep -i autoconfirm
```

You want to see `"mailer_autoconfirm": false`. (Counterintuitive — UI
"Confirm sign up = ON" maps to API `mailer_autoconfirm = false`,
because the UI labels behavior and the API labels the flag.)

Then end-to-end test:

1. Open `https://symbolos.ca` in a fresh incognito window.
2. Sign up with a throwaway address you can read mail at.
3. After signup you should land on the "Verify your email" screen
   (the Login screen in verify mode) — *not* the Dashboard.
4. Check the throwaway inbox: you should get **one** email,
   branded "Symbolos", from `noreply@symbolos.ca`, with the gradient
   button.
5. Click the button → you should land on the Dashboard.

If you get **two** emails: something is still calling the old
`/api/auth/send-verification` route in addition to Supabase's native
flow. Tell me and I'll patch the frontend signup code.

If you get **zero** emails: Resend isn't authorized — go back to Step
1 and verify DKIM is green in Resend's dashboard.

If signup succeeds but the **Dashboard loads immediately** without a
confirmation step: the autoconfirm toggle didn't actually save.
Re-do 2d.

### 2f — Confirm any existing test accounts manually

Any account that signed up before today is unconfirmed in the new
regime. To not break our own access:

Supabase → **Authentication → Users** → for each of {you, me,
the audit tester} → click the user → there's a **"Confirm email"**
button (or set `email_confirmed_at` to "now"). Do that for the
accounts we want to keep.

---

## Step 3 — DMARC monitoring at dmarcian

You already made the account at `symbolosadvsry@gmail.com`. Two
things left to do.

### 3a — Add symbolos.ca as a domain in dmarcian

Log in → **Domains → Add Domain** → enter `symbolos.ca` → next.
Dmarcian will show you the **exact `_dmarc` TXT record they want
you to publish** (it's namespaced to your dmarcian account so
reports route to your dashboard).

**Replace the placeholder DMARC record from Step 1 with dmarcian's
exact value.** Keep `p=none` for now — we go to quarantine in two
weeks, reject two weeks after that.

### 3b — Watch the reports for a week

Reports start landing in dmarcian within 24h of DNS propagation.
The dashboard will show:

- **Pass / Fail rates** per sender.
- Any IPs sending mail "as" symbolos.ca that *aren't* Resend.

Anything legitimate (Resend) should be ~100% pass. If you see other
senders passing → someone else is configured to send on our behalf
and we should know who. If you see other senders *failing* → that's
forgery attempts (or a misconfigured app). At `p=none` we just see
them; at `p=quarantine` and `p=reject` we actually block them.

### 3c — Two weeks later: tighten the policy

Open the `_dmarc` TXT record wherever you added it (Vercel /
registrar). Change:

```
v=DMARC1; p=none; ...
```

to:

```
v=DMARC1; p=quarantine; pct=100; ...
```

Watch dmarcian for another two weeks for any unexpected drops. If
real mail starts landing in spam, dmarcian will surface it — fix and
wait. If it's clean, change `p=quarantine` → `p=reject` and you're
done.

---

## TL;DR / handoff state machine

```
[ ] Step 1: 4 DNS records published, Resend dashboard shows green
[ ] Step 2a: Supabase SMTP set to Resend, test email arrives
[ ] Step 2b: Confirm-signup email template replaced with Symbolos HTML
[ ] Step 2c: Site URL / redirect URLs set
[ ] Step 2d: "Confirm sign up" toggle ON
[ ] Step 2e: end-to-end signup test sees verify screen + one branded email
[ ] Step 2f: existing real accounts manually confirmed
[ ] Step 3a: dmarcian-issued DMARC record published (replaces Step 1 placeholder)
[ ] Step 3b: dmarcian dashboard shows pass-rate data after 24h
[ ] Step 3c (in 2 weeks): DMARC moved to p=quarantine
[ ] Step 3c (in 4 weeks): DMARC moved to p=reject
```

Once that checklist is fully ticked, all 11 audit findings are
mitigated end-to-end (code + infra + DNS).

Ping me on anything that doesn't behave like the doc says. The most
common failure mode is a copy-paste artifact in the DKIM TXT record
(extra quotes, line break in the middle of the key), which silently
breaks the whole pipeline — Resend's "Verify DNS records" button is
the canary for that one.

— Alex
