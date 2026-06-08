# DNS hardening for symbolos.ca

The audit finding #6 was that `noreply@symbolos.ca` mail is spoofable
because the domain has no SPF / DKIM / DMARC. Anyone can send mail
*as us*, including phishing that exploits the (formerly) open
`/api/auth/send-verification` endpoint.

The verification endpoint is now locked down (SEC FIX #1), but a hardened
DNS posture is independently important — both to prevent third-party
spoofing of our brand and to get inbox placement.

Add these records at the symbolos.ca registrar (Cloudflare / Namecheap /
wherever).

---

## 1. SPF — declares which IPs are allowed to send for symbolos.ca

```
Type   : TXT
Host   : @            (the apex)
Value  : v=spf1 include:_spf.resend.com -all
TTL    : 3600
```

`-all` is a hard fail. If you later add another mailer (Postmark,
Mailgun), append its include before `-all`.

---

## 2. DKIM — cryptographically signs each outgoing message

Resend issues a domain-specific selector. The exact records are in your
Resend dashboard under **Domains → symbolos.ca → Verify**. They look like:

```
Type   : TXT
Host   : resend._domainkey
Value  : <long key starting with "p=...">
```

Resend will not start signing your mail until that record is published.

---

## 3. DMARC — tells receivers what to do with mail that fails SPF/DKIM

Start in monitor mode for two weeks so you see what breaks, then ramp to
`quarantine`, then `reject`. Initial record:

```
Type   : TXT
Host   : _dmarc
Value  : v=DMARC1; p=quarantine; rua=mailto:dmarc@symbolos.ca; ruf=mailto:dmarc@symbolos.ca; fo=1; adkim=s; aspf=s
TTL    : 3600
```

Notes:
- `p=quarantine` is the recommended starting point given we already have
  audit pressure. If you want to be even more cautious, use `p=none` for
  the first two weeks and read the daily DMARC reports before going to
  quarantine.
- `adkim=s` and `aspf=s` are strict alignment — they require the From
  domain to match the DKIM/SPF domain exactly. That's what we want.
- Set up a real `dmarc@symbolos.ca` inbox (or use a free aggregator like
  Postmark's DMARC monitor / dmarcian).

After two weeks at `quarantine`, change to:

```
Value  : v=DMARC1; p=reject; rua=mailto:dmarc@symbolos.ca; ruf=mailto:dmarc@symbolos.ca; fo=1; adkim=s; aspf=s
```

---

## 4. MX — null record so attackers can't deliver mail to us

We don't accept inbound mail at symbolos.ca (everything is outbound from
Resend). A "null MX" tells everyone not to even try, which closes the
backscatter / catch-all vector.

```
Type     : MX
Host     : @
Priority : 0
Value    : .          (literal dot)
TTL      : 3600
```

If you later add Google Workspace / Fastmail / etc., remove this and
replace with the provider's MX records.

---

## 5. BIMI (optional, nice-to-have)

Once DMARC is at `p=quarantine` (or stronger) and DKIM is verified,
you can publish a BIMI record so Gmail shows the Symbolos logo next to
verified messages. Requires a square SVG logo at
`https://symbolos.ca/bimi-logo.svg` and a paid VMC certificate (~$1k/yr)
for the green checkmark variant. Skip until/unless we care.

---

## Verifying the rollout

```bash
# SPF
dig +short TXT symbolos.ca | grep spf1

# DKIM (Resend selector)
dig +short TXT resend._domainkey.symbolos.ca

# DMARC
dig +short TXT _dmarc.symbolos.ca

# Null MX
dig +short MX symbolos.ca
```

External checks:
- https://www.mail-tester.com/  — score your outbound mail
- https://dmarcian.com/dmarc-inspector/  — DMARC parser
- https://mxtoolbox.com/  — quick checks for everything
