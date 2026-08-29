# Primadonis

A standalone event app for the Primadonis concert: buy a ticket, see the
lineup, get scanned in at the door, and post to a live event feed. Built as
its own codebase inside this repo. No shared code or infra with the
Symbolos advising app.

## Stack and why

| Concern | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind | Fast to build a distinct visual identity; ships as static files. |
| Backend | FastAPI (Python) | Small surface area (tickets, event, feed); easy to add routes. |
| Auth + DB + Storage | Supabase (Postgres, Auth, Storage) | One service covers auth, relational data, RLS, and file storage. No separate infra to run for a single-event app. |
| Payments | Stripe Checkout | Stripe hosts the card form and owns PCI compliance; we never touch card numbers. Handles Apple Pay/Google Pay automatically. |
| Deploy | Vercel (frontend + backend as separate projects, both serverless) | Scales to zero between visits, scales out automatically during the on-sale rush, no server to provision. |

## Why this scales for a <1k-attendee single event

- **Frontend and backend are both serverless** (Vercel). There's no fixed
  capacity to size. A burst of traffic when tickets go on sale just spins
  up more function instances.
- **Stripe absorbs the payment-processing load and the fraud/PCI risk.**
  The backend only creates a Checkout Session and later verifies a signed
  webhook. It's never in the hot path of actually charging a card.
- **Overselling is prevented at the database, not the application.**
  `reserve_ticket_tier()` (see `schema.sql`) locks the tier row with
  `SELECT ... FOR UPDATE` before checking remaining inventory, so two
  concurrent buyers can never both win the last seat. This holds even
  across multiple serverless function instances, which plain
  application-level checks would not.
- **Door check-in is also atomic**: `check_in_ticket()` does the
  "is it paid, is it unused, mark it used" check in one SQL statement, so
  two staff phones scanning the same QR code at the same instant can't
  both admit it.
- **Rate limiting** on `/api/tickets/checkout`, `/etransfer`, and
  `/checkin` (`slowapi`, per-IP) caps how hard the on-sale moment or a
  scan-line issue can hammer the API. The limits in `main.py` are sized
  for <1k attendees. Raise them (and consider a waiting-room page in
  front of checkout) before using this for a bigger on-sale.
- **`/api/event` is safe to CDN-cache.** It returns no per-user data, same
  pattern as Symbolos's public `/api/clubs` endpoint.

If this event grows past ~1k attendees or becomes recurring across venues,
revisit: a real ticket-queue/waiting-room in front of checkout, moving
ticket tiers to per-event rows only (already modeled that way), and
Supabase's connection pooler (`pgbouncer`) if Postgres connection count
becomes the bottleneck.

## Payments: Stripe, with an e-Transfer fallback

Stripe Checkout is the primary path (card, Apple Pay, Google Pay). Some
students prefer to pay by Interac e-Transfer. **Stripe does not clear
e-Transfers**, so this is a manual fallback, not a real payment
integration: `/api/tickets/etransfer` reserves the seat and marks the
ticket `pending_etransfer`; a staff member (`is_staff = true` in
`profiles`) confirms receipt via `/api/tickets/etransfer/{id}/confirm`,
which issues the ticket the same way a Stripe webhook would. This does not
scale past a small event run by people who can manually reconcile an
e-Transfer inbox. That's an accepted tradeoff for a <1k campus event.

## Storage

- **Tickets** live in Postgres (`tickets` table), not as generated
  PDFs/images. The QR code is rendered client-side from a random
  `qr_secret` token issued when the ticket is created. Nothing sensitive is
  stored in the QR code itself; it's an opaque bearer token looked up
  server-side.
- **User-uploaded photos** (event feed) go to a public Supabase Storage
  bucket (`feed-photos`), gated so only authenticated users can upload but
  anyone can view. See the storage policies at the bottom of `schema.sql`.

## Data model

See `schema.sql` for the full schema, RLS policies, and the atomic
`reserve_ticket_tier` / `confirm_ticket_paid` / `check_in_ticket` functions.
Tables: `profiles`, `events`, `ticket_tiers`, `tickets`, `lineup_slots`,
`attendance` ("who's going"), `feed_posts`, `feed_comments`.

## Local development

### 1. Supabase

Create a project, then run `schema.sql` in the SQL editor. Create a storage
bucket named `feed-photos` if the script's `insert into storage.buckets`
didn't take (some Supabase plans restrict that from SQL). Do it from the
Storage tab instead, and mark it public.

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in Supabase + Stripe keys
python seed_event.py   # creates the event, ticket tiers, lineup
uvicorn app.main:app --reload --port 8000
```

For local Stripe webhooks: `stripe listen --forward-to localhost:8000/api/tickets/webhook`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev   # http://localhost:5173
```

### 4. Making yourself staff (for door check-in / e-Transfer confirmation)

```sql
update profiles set is_staff = true where id = '<your-user-id>';
```

Staff sign in normally, then visit `/staff/scan` to open the camera-based
door scanner.

## What's stubbed / not production-hardened

- No admin UI for editing the event, tiers, or lineup. Done via
  `seed_event.py` or direct SQL. Fine for a single event; build a real
  admin screen before running several events.
- No refund flow beyond Stripe's own dashboard.
- No email confirmation/receipt on purchase. Stripe's own receipt email
  covers card payments; e-Transfer buyers aren't emailed automatically.
- Feed has no moderation UI (`feed_posts.is_hidden` exists in the schema
  for a future admin "hide post" action, but nothing sets it yet).
