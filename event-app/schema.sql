-- Primadonis event app — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`) for a fresh project.
-- Idempotent: safe to re-run.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (mirrors auth.users; created by trigger on signup)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  is_staff boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Event, ticket tiers, tickets
-- ---------------------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  venue text,
  description text,
  doors_at timestamptz,
  starts_at timestamptz not null,
  ends_at timestamptz,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'cad',
  quantity_total integer not null check (quantity_total >= 0),
  quantity_sold integer not null default 0 check (quantity_sold >= 0),
  sales_open_at timestamptz,
  sales_close_at timestamptz,
  created_at timestamptz not null default now(),
  constraint sold_within_total check (quantity_sold <= quantity_total)
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  tier_id uuid not null references ticket_tiers(id) on delete restrict,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'pending_etransfer', 'paid', 'checked_in', 'refunded', 'cancelled')),
  qr_secret text unique not null default encode(gen_random_bytes(24), 'base64url'),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  purchased_at timestamptz,
  checked_in_at timestamptz,
  checked_in_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists tickets_user_id_idx on tickets(user_id);
create index if not exists tickets_qr_secret_idx on tickets(qr_secret);

-- ---------------------------------------------------------------------------
-- Lineup / schedule
-- ---------------------------------------------------------------------------
create table if not exists lineup_slots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  artist_name text not null,
  bio text,
  stage text,
  set_start timestamptz not null,
  set_end timestamptz,
  order_index integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Social layer: "who's going" + photo/comment wall
-- ---------------------------------------------------------------------------
create table if not exists attendance (
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  image_url text,
  caption text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references feed_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Atomic operations (called via supabase.rpc(...) from the backend, using
-- the service-role key). These exist so ticket sales and door check-in are
-- safe under concurrent requests — the "row lock + check + write" happens
-- inside one transaction instead of racing between two round trips.
-- ---------------------------------------------------------------------------

-- Reserves one ticket against a tier's remaining inventory. Locks the tier
-- row first so two simultaneous buyers can never both grab the last seat.
create or replace function reserve_ticket_tier(p_tier_id uuid, p_user_id uuid)
returns uuid as $$
declare
  v_event_id uuid;
  v_remaining integer;
  v_ticket_id uuid;
begin
  select event_id, quantity_total - quantity_sold
    into v_event_id, v_remaining
    from ticket_tiers
    where id = p_tier_id
    for update;

  if v_event_id is null then
    raise exception 'unknown ticket tier';
  end if;

  if v_remaining <= 0 then
    raise exception 'sold_out' using errcode = 'P0001';
  end if;

  update ticket_tiers set quantity_sold = quantity_sold + 1 where id = p_tier_id;

  insert into tickets (event_id, tier_id, user_id, status)
  values (v_event_id, p_tier_id, p_user_id, 'pending_payment')
  returning id into v_ticket_id;

  return v_ticket_id;
end;
$$ language plpgsql;

-- Releases a reserved seat back to inventory (payment abandoned/expired).
create or replace function release_ticket_reservation(p_ticket_id uuid)
returns void as $$
declare
  v_tier_id uuid;
begin
  update tickets set status = 'cancelled'
    where id = p_ticket_id and status in ('pending_payment', 'pending_etransfer')
    returning tier_id into v_tier_id;

  if v_tier_id is not null then
    update ticket_tiers set quantity_sold = quantity_sold - 1 where id = v_tier_id;
  end if;
end;
$$ language plpgsql;

-- Marks a ticket paid after Stripe (or a manually-confirmed e-transfer)
-- confirms payment. Idempotent: re-delivering the same webhook is a no-op.
create or replace function confirm_ticket_paid(
  p_ticket_id uuid,
  p_session_id text,
  p_payment_intent_id text
)
returns void as $$
begin
  update tickets
    set status = 'paid',
        purchased_at = now(),
        stripe_checkout_session_id = coalesce(p_session_id, stripe_checkout_session_id),
        stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id)
    where id = p_ticket_id
      and status in ('pending_payment', 'pending_etransfer');
end;
$$ language plpgsql;

-- Door check-in: single-use, atomic. Returns the checked-in row, or no rows
-- if the ticket doesn't exist, isn't paid, or was already scanned — the
-- caller distinguishes "already used" by a follow-up lookup if needed.
create or replace function check_in_ticket(p_qr_secret text, p_staff_id uuid)
returns tickets as $$
declare
  v_ticket tickets;
begin
  update tickets
    set status = 'checked_in',
        checked_in_at = now(),
        checked_in_by = p_staff_id
    where qr_secret = p_qr_secret
      and status = 'paid'
    returning * into v_ticket;

  return v_ticket;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table events enable row level security;
alter table ticket_tiers enable row level security;
alter table tickets enable row level security;
alter table lineup_slots enable row level security;
alter table attendance enable row level security;
alter table feed_posts enable row level security;
alter table feed_comments enable row level security;

drop policy if exists "profiles are publicly readable" on profiles;
create policy "profiles are publicly readable" on profiles for select using (true);
drop policy if exists "users update own profile" on profiles;
create policy "users update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "events are publicly readable" on events;
create policy "events are publicly readable" on events for select using (true);
drop policy if exists "tiers are publicly readable" on ticket_tiers;
create policy "tiers are publicly readable" on ticket_tiers for select using (true);
drop policy if exists "lineup is publicly readable" on lineup_slots;
create policy "lineup is publicly readable" on lineup_slots for select using (true);

-- Tickets: users may only ever read their own. All writes go through the
-- backend's service-role key (Stripe webhook, check-in scanner) so a client
-- can never mint or mark its own ticket paid/checked-in.
drop policy if exists "users read own tickets" on tickets;
create policy "users read own tickets" on tickets for select using (auth.uid() = user_id);

drop policy if exists "attendance is publicly readable" on attendance;
create policy "attendance is publicly readable" on attendance for select using (true);
drop policy if exists "users manage own attendance" on attendance;
create policy "users manage own attendance" on attendance for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "feed posts are publicly readable" on feed_posts;
create policy "feed posts are publicly readable" on feed_posts for select using (not is_hidden);
drop policy if exists "users create own posts" on feed_posts;
create policy "users create own posts" on feed_posts for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own posts" on feed_posts;
create policy "users delete own posts" on feed_posts for delete using (auth.uid() = user_id);

drop policy if exists "comments are publicly readable" on feed_comments;
create policy "comments are publicly readable" on feed_comments for select using (true);
drop policy if exists "users create own comments" on feed_comments;
create policy "users create own comments" on feed_comments for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own comments" on feed_comments;
create policy "users delete own comments" on feed_comments for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for feed photos (run once; Supabase Storage API also works)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('feed-photos', 'feed-photos', true)
on conflict (id) do nothing;

drop policy if exists "feed photos are publicly readable" on storage.objects;
create policy "feed photos are publicly readable" on storage.objects
  for select using (bucket_id = 'feed-photos');

drop policy if exists "authenticated users upload feed photos" on storage.objects;
create policy "authenticated users upload feed photos" on storage.objects
  for insert with check (bucket_id = 'feed-photos' and auth.role() = 'authenticated');
