-- ═══════════════════════════════════════════════════════════════
-- AYA EVENTS HUB — DATABASE SCHEMA
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ═══════════════════════════════════════════════════════════════

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════

create type event_status as enum ('draft', 'published', 'cancelled', 'completed');
create type event_category as enum ('sip-and-scale', 'rebloom', 'founder-session', 'workshop', 'partner-event', 'other');
create type ticket_tier as enum ('early_bird', 'regular', 'vip', 'partner', 'sponsor', 'guest');
create type ticket_status as enum ('available', 'sold_out', 'closed', 'hidden');
create type registration_status as enum ('pending', 'confirmed', 'cancelled', 'waitlisted');
create type payment_method as enum ('gcash', 'maya', 'bank_transfer', 'paymongo', 'free', 'cash');
create type payment_status as enum ('pending', 'paid', 'cancelled', 'refunded');
create type sponsor_status as enum ('lead', 'confirmed', 'paid', 'completed');

-- ═══════════════════════════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════════════════════════

create table events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  category event_category not null default 'other',
  status event_status not null default 'draft',

  cover_image_url text,
  banner_image_url text,
  gallery_image_urls text[] default '{}',

  start_date timestamptz not null,
  end_date timestamptz,

  venue_name text,
  venue_address text,
  venue_map_url text,

  organizer_name text default 'AYA Community x Destine Events',
  organizer_contact text,

  schedule jsonb default '[]'::jsonb,   -- [{ time, title, description }]
  faqs jsonb default '[]'::jsonb,       -- [{ question, answer }]

  is_featured boolean default false,
  capacity_total int,                    -- optional overall cap (sum of tickets if null)

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_events_slug on events(slug);
create index idx_events_status on events(status);
create index idx_events_start_date on events(start_date);
create index idx_events_category on events(category);

-- ═══════════════════════════════════════════════════════════════
-- EVENT TICKETS
-- ═══════════════════════════════════════════════════════════════

create table event_tickets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,

  tier ticket_tier not null default 'regular',
  name text not null,                     -- display name e.g. "Early Bird"
  description text,

  price numeric(10,2) not null default 0,
  capacity int not null default 0,        -- 0 = unlimited
  sold int not null default 0,

  sales_start timestamptz,
  sales_end timestamptz,

  status ticket_status not null default 'available',
  sort_order int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tickets_event_id on event_tickets(event_id);

-- ═══════════════════════════════════════════════════════════════
-- ATTENDEES (Community CRM — one row per unique person/email)
-- ═══════════════════════════════════════════════════════════════

create table attendees (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  mobile_number text,
  business_name text,
  industry text,
  social_link text,

  newsletter_opt_in boolean default false,
  networking_opt_in boolean default false,

  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_attendees_email on attendees(email);

-- ═══════════════════════════════════════════════════════════════
-- REGISTRATIONS
-- ═══════════════════════════════════════════════════════════════

create table registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  ticket_id uuid not null references event_tickets(id) on delete restrict,
  attendee_id uuid references attendees(id) on delete set null,

  -- snapshot of registration form (kept even if attendee record changes)
  full_name text not null,
  business_name text,
  email text not null,
  mobile_number text not null,
  industry text,
  social_link text,
  special_notes text,

  newsletter_opt_in boolean default false,
  networking_opt_in boolean default false,

  status registration_status not null default 'pending',

  -- QR ticket
  qr_code text unique,                    -- unique token encoded in QR
  checked_in boolean default false,
  checked_in_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_registrations_event_id on registrations(event_id);
create index idx_registrations_email on registrations(email);
create index idx_registrations_qr on registrations(qr_code);
create index idx_registrations_status on registrations(status);

-- ═══════════════════════════════════════════════════════════════
-- PAYMENTS
-- ═══════════════════════════════════════════════════════════════

create table payments (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid not null references registrations(id) on delete cascade,

  amount numeric(10,2) not null default 0,
  method payment_method not null default 'gcash',
  status payment_status not null default 'pending',

  reference_number text,
  proof_image_url text,                   -- optional uploaded screenshot
  notes text,

  paid_at timestamptz,
  verified_by uuid,                       -- admin user id (auth.users)

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_payments_registration_id on payments(registration_id);
create index idx_payments_status on payments(status);

-- ═══════════════════════════════════════════════════════════════
-- SPONSORS
-- ═══════════════════════════════════════════════════════════════

create table sponsors (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,  -- null = global/ecosystem sponsor

  name text not null,
  package text,                            -- e.g. "Gold Sponsor", "In-Kind"
  amount numeric(10,2) default 0,
  logo_url text,
  website text,
  status sponsor_status not null default 'lead',
  notes text,

  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_sponsors_event_id on sponsors(event_id);

-- ═══════════════════════════════════════════════════════════════
-- EVENT SPEAKERS
-- ═══════════════════════════════════════════════════════════════

create table event_speakers (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,

  name text not null,
  title text,                              -- role / job title
  bio text,
  photo_url text,
  social_link text,

  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_speakers_event_id on event_speakers(event_id);

-- ═══════════════════════════════════════════════════════════════
-- ADMIN USERS (maps to Supabase Auth users)
-- ═══════════════════════════════════════════════════════════════

create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'admin',              -- admin | super_admin | check_in_staff
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS — updated_at maintenance
-- ═══════════════════════════════════════════════════════════════

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_events_updated_at before update on events
  for each row execute function set_updated_at();
create trigger trg_tickets_updated_at before update on event_tickets
  for each row execute function set_updated_at();
create trigger trg_registrations_updated_at before update on registrations
  for each row execute function set_updated_at();
create trigger trg_payments_updated_at before update on payments
  for each row execute function set_updated_at();
create trigger trg_sponsors_updated_at before update on sponsors
  for each row execute function set_updated_at();
create trigger trg_attendees_updated_at before update on attendees
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER — auto-increment ticket "sold" count on confirmed registration
-- ═══════════════════════════════════════════════════════════════

create or replace function adjust_ticket_sold_count()
returns trigger as $$
begin
  -- New confirmed registration -> increment
  if (tg_op = 'INSERT') then
    if new.status = 'confirmed' then
      update event_tickets set sold = sold + 1 where id = new.ticket_id;
    end if;
    return new;
  end if;

  -- Status changed
  if (tg_op = 'UPDATE') then
    if old.status != 'confirmed' and new.status = 'confirmed' then
      update event_tickets set sold = sold + 1 where id = new.ticket_id;
    elsif old.status = 'confirmed' and new.status != 'confirmed' then
      update event_tickets set sold = greatest(sold - 1, 0) where id = new.ticket_id;
    end if;
    return new;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_registration_sold_count
  after insert or update on registrations
  for each row execute function adjust_ticket_sold_count();

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER — upsert attendee (Community CRM) on new registration
-- ═══════════════════════════════════════════════════════════════

create or replace function upsert_attendee_from_registration()
returns trigger as $$
declare
  found_id uuid;
begin
  select id into found_id from attendees where email = new.email;

  if found_id is null then
    insert into attendees (full_name, email, mobile_number, business_name, industry, social_link, newsletter_opt_in, networking_opt_in)
    values (new.full_name, new.email, new.mobile_number, new.business_name, new.industry, new.social_link, new.newsletter_opt_in, new.networking_opt_in)
    returning id into found_id;
  else
    update attendees set
      full_name = new.full_name,
      mobile_number = coalesce(new.mobile_number, mobile_number),
      business_name = coalesce(new.business_name, business_name),
      industry = coalesce(new.industry, industry),
      social_link = coalesce(new.social_link, social_link),
      newsletter_opt_in = (newsletter_opt_in or new.newsletter_opt_in),
      networking_opt_in = (networking_opt_in or new.networking_opt_in),
      last_seen_at = now()
    where id = found_id;
  end if;

  new.attendee_id = found_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_upsert_attendee
  before insert on registrations
  for each row execute function upsert_attendee_from_registration();

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table events enable row level security;
alter table event_tickets enable row level security;
alter table registrations enable row level security;
alter table payments enable row level security;
alter table attendees enable row level security;
alter table sponsors enable row level security;
alter table event_speakers enable row level security;
alter table admin_users enable row level security;

-- Public read access for published events & their related public data
create policy "Public can view published events"
  on events for select
  using (status = 'published' or status = 'completed');

create policy "Public can view tickets of published events"
  on event_tickets for select
  using (
    exists (
      select 1 from events
      where events.id = event_tickets.event_id
      and (events.status = 'published' or events.status = 'completed')
    )
  );

create policy "Public can view speakers of published events"
  on event_speakers for select
  using (
    exists (
      select 1 from events
      where events.id = event_speakers.event_id
      and (events.status = 'published' or events.status = 'completed')
    )
  );

create policy "Public can view sponsors"
  on sponsors for select
  using (true);

-- Public can insert their own registration
create policy "Public can create registrations"
  on registrations for insert
  with check (true);

-- Public can view their own registration (by id, used on confirmation page)
create policy "Public can view own registration"
  on registrations for select
  using (true);

-- Public can insert a payment record tied to their registration
create policy "Public can create payment record"
  on payments for insert
  with check (true);

-- ── Admin full access policies ──
-- Admins (rows present in admin_users) get full access to everything.

create policy "Admins manage events"
  on events for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins manage tickets"
  on event_tickets for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins manage registrations"
  on registrations for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins manage payments"
  on payments for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins manage attendees"
  on attendees for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins manage sponsors"
  on sponsors for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins manage speakers"
  on event_speakers for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins view admin_users"
  on admin_users for select
  using (auth.uid() = id or exists (select 1 from admin_users a where a.id = auth.uid() and a.role = 'super_admin'));

-- ═══════════════════════════════════════════════════════════════
-- VIEWS — convenience views for dashboard metrics
-- ═══════════════════════════════════════════════════════════════

create or replace view event_revenue_summary as
select
  e.id as event_id,
  e.title,
  e.slug,
  coalesce(sum(p.amount) filter (where p.status = 'paid'), 0) as revenue_paid,
  coalesce(sum(p.amount) filter (where p.status = 'pending'), 0) as revenue_pending,
  count(distinct r.id) as total_registrations,
  count(distinct r.id) filter (where r.status = 'confirmed') as confirmed_registrations,
  count(distinct r.id) filter (where r.checked_in = true) as checked_in_count
from events e
left join registrations r on r.event_id = e.id
left join payments p on p.registration_id = r.id
group by e.id, e.title, e.slug;

-- ═══════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ═══════════════════════════════════════════════════════════════
