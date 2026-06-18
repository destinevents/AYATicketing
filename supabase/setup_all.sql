-- ═══════════════════════════════════════════════════════════════
-- AYA EVENTS HUB — FULL SETUP (reset + schema + migrations + seed)
-- Paste this entire file into Supabase SQL Editor and click Run.
-- Safe to re-run: drops everything first, then rebuilds from scratch.
-- ═══════════════════════════════════════════════════════════════

-- ── RESET ──────────────────────────────────────────────────────

drop view if exists abandoned_registrations;
drop view if exists event_revenue_summary;

drop function if exists set_updated_at() cascade;
drop function if exists adjust_ticket_sold_count() cascade;
drop function if exists upsert_attendee_from_registration() cascade;
drop function if exists increment_promo_used_count() cascade;

drop table if exists email_logs cascade;
drop table if exists promo_codes cascade;
drop table if exists payments cascade;
drop table if exists registrations cascade;
drop table if exists event_speakers cascade;
drop table if exists event_tickets cascade;
drop table if exists sponsors cascade;
drop table if exists admin_users cascade;
drop table if exists attendees cascade;
drop table if exists events cascade;

drop type if exists email_type cascade;
drop type if exists email_status cascade;
drop type if exists community_archetype cascade;
drop type if exists discount_type cascade;
drop type if exists event_status cascade;
drop type if exists event_category cascade;
drop type if exists ticket_tier cascade;
drop type if exists ticket_status cascade;
drop type if exists registration_status cascade;
drop type if exists payment_method cascade;
drop type if exists payment_status cascade;
drop type if exists sponsor_status cascade;

-- ── EXTENSIONS ─────────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── ENUMS ──────────────────────────────────────────────────────

create type event_status as enum ('draft', 'published', 'cancelled', 'completed');
create type event_category as enum ('sip-and-scale', 'rebloom', 'founder-session', 'workshop', 'partner-event', 'other');
create type ticket_tier as enum ('early_bird', 'regular', 'vip', 'partner', 'sponsor', 'guest');
create type ticket_status as enum ('available', 'sold_out', 'closed', 'hidden');
create type registration_status as enum ('pending', 'confirmed', 'cancelled', 'waitlisted');
create type payment_method as enum ('gcash', 'maya', 'bank_transfer', 'paymongo', 'free', 'cash');
create type payment_status as enum ('pending', 'paid', 'cancelled', 'refunded');
create type sponsor_status as enum ('lead', 'confirmed', 'paid', 'completed');
create type community_archetype as enum ('founder', 'creative', 'community_builder', 'enabler');
create type email_type as enum ('registration_confirmation', 'payment_confirmation', 'abandoned_cart_reminder', 'event_reminder', 'newsletter', 'custom_update');
create type email_status as enum ('sent', 'failed', 'skipped');
create type discount_type as enum ('percentage', 'fixed');

-- ── TABLES ─────────────────────────────────────────────────────

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
  schedule jsonb default '[]'::jsonb,
  faqs jsonb default '[]'::jsonb,
  is_featured boolean default false,
  capacity_total int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_events_slug on events(slug);
create index idx_events_status on events(status);
create index idx_events_start_date on events(start_date);
create index idx_events_category on events(category);

create table event_tickets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  tier ticket_tier not null default 'regular',
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  capacity int not null default 0,
  sold int not null default 0,
  sales_start timestamptz,
  sales_end timestamptz,
  status ticket_status not null default 'available',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tickets_event_id on event_tickets(event_id);

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
  archetype community_archetype,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_attendees_email on attendees(email);

create table promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  description text,
  discount_type discount_type not null default 'percentage',
  discount_value numeric(10,2) not null,
  event_id uuid references events(id) on delete cascade,
  max_uses int,
  used_count int not null default 0,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_promo_codes_code on promo_codes(code);
create index idx_promo_codes_event_id on promo_codes(event_id);

create table registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  ticket_id uuid not null references event_tickets(id) on delete restrict,
  attendee_id uuid references attendees(id) on delete set null,
  full_name text not null,
  business_name text,
  email text not null,
  mobile_number text not null,
  industry text,
  social_link text,
  special_notes text,
  newsletter_opt_in boolean default false,
  networking_opt_in boolean default false,
  archetype community_archetype,
  promo_code_id uuid references promo_codes(id) on delete set null,
  discount_amount numeric(10,2) default 0,
  final_amount numeric(10,2),
  status registration_status not null default 'pending',
  qr_code text unique,
  checked_in boolean default false,
  checked_in_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_registrations_event_id on registrations(event_id);
create index idx_registrations_email on registrations(email);
create index idx_registrations_qr on registrations(qr_code);
create index idx_registrations_status on registrations(status);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid not null references registrations(id) on delete cascade,
  amount numeric(10,2) not null default 0,
  method payment_method not null default 'gcash',
  status payment_status not null default 'pending',
  reference_number text,
  proof_image_url text,
  notes text,
  paid_at timestamptz,
  verified_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_payments_registration_id on payments(registration_id);
create index idx_payments_status on payments(status);

create table sponsors (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  package text,
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

create table event_speakers (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  title text,
  bio text,
  photo_url text,
  social_link text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_speakers_event_id on event_speakers(event_id);

create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'admin',
  created_at timestamptz default now()
);

create table email_logs (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references registrations(id) on delete cascade,
  attendee_id uuid references attendees(id) on delete set null,
  email_type email_type not null,
  recipient_email text not null,
  subject text,
  status email_status not null default 'sent',
  error_message text,
  provider_message_id text,
  sent_at timestamptz default now()
);

create index idx_email_logs_registration on email_logs(registration_id);
create index idx_email_logs_attendee on email_logs(attendee_id);
create index idx_email_logs_type on email_logs(email_type);
create index idx_email_logs_sent_at on email_logs(sent_at);

-- ── TRIGGERS ───────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_events_updated_at before update on events for each row execute function set_updated_at();
create trigger trg_tickets_updated_at before update on event_tickets for each row execute function set_updated_at();
create trigger trg_registrations_updated_at before update on registrations for each row execute function set_updated_at();
create trigger trg_payments_updated_at before update on payments for each row execute function set_updated_at();
create trigger trg_sponsors_updated_at before update on sponsors for each row execute function set_updated_at();
create trigger trg_attendees_updated_at before update on attendees for each row execute function set_updated_at();
create trigger trg_promo_codes_updated_at before update on promo_codes for each row execute function set_updated_at();

create or replace function adjust_ticket_sold_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    if new.status = 'confirmed' then
      update event_tickets set sold = sold + 1 where id = new.ticket_id;
    end if;
    return new;
  end if;
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

create or replace function upsert_attendee_from_registration()
returns trigger as $$
declare
  found_id uuid;
begin
  select id into found_id from attendees where email = new.email;
  if found_id is null then
    insert into attendees (full_name, email, mobile_number, business_name, industry, social_link, newsletter_opt_in, networking_opt_in, archetype)
    values (new.full_name, new.email, new.mobile_number, new.business_name, new.industry, new.social_link, new.newsletter_opt_in, new.networking_opt_in, new.archetype)
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
      archetype = coalesce(new.archetype, archetype),
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

create or replace function increment_promo_used_count()
returns trigger as $$
begin
  if new.promo_code_id is not null then
    update promo_codes set used_count = used_count + 1 where id = new.promo_code_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_promo_used_count
  after insert on registrations
  for each row execute function increment_promo_used_count();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────

alter table events enable row level security;
alter table event_tickets enable row level security;
alter table registrations enable row level security;
alter table payments enable row level security;
alter table attendees enable row level security;
alter table sponsors enable row level security;
alter table event_speakers enable row level security;
alter table admin_users enable row level security;
alter table email_logs enable row level security;
alter table promo_codes enable row level security;

create policy "Public can view published events" on events for select using (status = 'published' or status = 'completed');
create policy "Public can view tickets of published events" on event_tickets for select using (exists (select 1 from events where events.id = event_tickets.event_id and (events.status = 'published' or events.status = 'completed')));
create policy "Public can view speakers of published events" on event_speakers for select using (exists (select 1 from events where events.id = event_speakers.event_id and (events.status = 'published' or events.status = 'completed')));
create policy "Public can view sponsors" on sponsors for select using (true);
create policy "Public can create registrations" on registrations for insert with check (true);
create policy "Public can view own registration" on registrations for select using (true);
create policy "Public can create payment record" on payments for insert with check (true);
create policy "Public can validate active promo codes" on promo_codes for select using (is_active = true);

create policy "Admins manage events" on events for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins manage tickets" on event_tickets for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins manage registrations" on registrations for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins manage payments" on payments for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins manage attendees" on attendees for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins manage sponsors" on sponsors for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins manage speakers" on event_speakers for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins view admin_users" on admin_users for select using (auth.uid() = id or exists (select 1 from admin_users a where a.id = auth.uid() and a.role = 'super_admin'));
create policy "Admins manage email logs" on email_logs for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
create policy "Admins manage promo codes" on promo_codes for all using (exists (select 1 from admin_users where admin_users.id = auth.uid())) with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

-- ── VIEWS ──────────────────────────────────────────────────────

create or replace view event_revenue_summary as
select
  e.id as event_id, e.title, e.slug,
  coalesce(sum(p.amount) filter (where p.status = 'paid'), 0) as revenue_paid,
  coalesce(sum(p.amount) filter (where p.status = 'pending'), 0) as revenue_pending,
  count(distinct r.id) as total_registrations,
  count(distinct r.id) filter (where r.status = 'confirmed') as confirmed_registrations,
  count(distinct r.id) filter (where r.checked_in = true) as checked_in_count
from events e
left join registrations r on r.event_id = e.id
left join payments p on p.registration_id = r.id
group by e.id, e.title, e.slug;

create or replace view abandoned_registrations as
select
  r.id as registration_id, r.full_name, r.email, r.created_at as registered_at,
  e.id as event_id, e.title as event_title, e.slug as event_slug, e.start_date as event_start_date,
  t.name as ticket_name, t.price as ticket_price,
  p.id as payment_id, p.status as payment_status
from registrations r
join events e on e.id = r.event_id
join event_tickets t on t.id = r.ticket_id
left join payments p on p.registration_id = r.id
where r.status = 'pending'
  and (p.status is null or p.status = 'pending')
  and r.created_at < now() - interval '2 hours'
  and not exists (select 1 from email_logs el where el.registration_id = r.id and el.email_type = 'abandoned_cart_reminder' and el.status = 'sent');

-- ── SEED DATA ──────────────────────────────────────────────────

insert into events (slug, title, subtitle, description, category, status, cover_image_url, banner_image_url, start_date, end_date, venue_name, venue_address, venue_map_url, organizer_name, organizer_contact, schedule, faqs, is_featured)
values (
  'builders-circle-june-2026',
  'AYA Builder''s Circle — June Session',
  'A facilitated circle for Baguio''s Founders, Creatives, Community Builders & Enablers',
  'The AYA Builder''s Circle is an intimate, facilitated gathering designed to help Baguio entrepreneurs, creators, and community builders connect meaningfully, share challenges, and find collaborators. Spots are intentionally limited — 5 Founders, 5 Creatives, 5 Community Builders, and 5 Enablers — to keep the room balanced and the conversation real.',
  'founder-session', 'published', null, null,
  '2026-06-20 15:30:00+08', '2026-06-20 17:00:00+08',
  'El Cielito Hotel Baguio', 'Leonard Wood Road, Baguio City, Benguet', 'https://maps.google.com/?q=El+Cielito+Hotel+Baguio',
  'AYA Community x Destine Events', 'jenncastro@destinevents.biz',
  '[{"time":"3:30 PM","title":"Arrival & Settling In","description":"Welcome drinks, name tags, and casual mingling"},{"time":"3:45 PM","title":"Opening Circle","description":"Introductions and grounding"},{"time":"4:00 PM","title":"Round 1 — Sharing Wins & Challenges","description":"Structured small-group rounds across archetypes"},{"time":"4:25 PM","title":"Round 2 — Collaboration Mapping","description":"Finding overlaps, asking for help, and spotting opportunities"},{"time":"4:45 PM","title":"Closing Circle","description":"Each person shares one commitment or connection"},{"time":"5:00 PM","title":"Open Networking","description":"Free-flow conversations"}]'::jsonb,
  '[{"question":"Who can join?","answer":"Baguio-based entrepreneurs, creators, community builders, and enablers."},{"question":"Why only 20 seats?","answer":"5 Founders, 5 Creatives, 5 Community Builders, and 5 Enablers — that is the magic number."}]'::jsonb,
  true
);

insert into events (slug, title, subtitle, description, category, status, cover_image_url, banner_image_url, start_date, end_date, venue_name, venue_address, venue_map_url, organizer_name, organizer_contact, schedule, faqs, is_featured)
values (
  'rebloom-2026',
  'RE:BLOOM 2026',
  'A sustainable floral retail transformation initiative for Baguio MSMEs',
  'RE:BLOOM is Destine Events flagship sustainability initiative for Baguio flower shops and floral MSMEs — built around a circular economy framework of Refuse, Rethink, Reduce.',
  'rebloom', 'published', null, null,
  '2026-07-12 09:00:00+08', '2026-07-12 16:00:00+08',
  'Baguio Convention Center', 'Gov. Pack Road, Baguio City', null,
  'Destine Events x AYA Community', 'jenncastro@destinevents.biz',
  '[{"time":"9:00 AM","title":"Doors Open & Registration","description":"Welcome packets and seat assignment"},{"time":"9:30 AM","title":"Opening Remarks","description":"RE:BLOOM framework introduction"},{"time":"10:00 AM","title":"Panel: Circular Economy for Flower Shops","description":"Refuse, Rethink, Reduce in practice"},{"time":"1:00 PM","title":"Lunch & Marketplace","description":"Browse local floral and eco-product vendors"},{"time":"4:00 PM","title":"Closing & Networking","description":"Wrap-up and community photo"}]'::jsonb,
  '[{"question":"Who is RE:BLOOM for?","answer":"Flower shop owners, floral MSMEs, and sustainability advocates."},{"question":"Is there a cost?","answer":"General attendance is free with RSVP. VIP and Partner tiers include workshop materials."}]'::jsonb,
  true
);

insert into events (slug, title, subtitle, description, category, status, cover_image_url, banner_image_url, start_date, end_date, venue_name, venue_address, venue_map_url, organizer_name, organizer_contact, schedule, faqs, is_featured)
values (
  'founder-session-01',
  'Founder Session 01: Building in Baguio',
  'An honest conversation series for early-stage founders',
  'Founder Session 01 kicks off a new conversation series spotlighting the realities of building a business in Baguio.',
  'founder-session', 'draft', null, null,
  '2026-08-09 14:00:00+08', '2026-08-09 17:00:00+08',
  'Location TBA', 'Baguio City, Benguet', null,
  'AYA Community', 'jenncastro@destinevents.biz',
  '[]'::jsonb, '[]'::jsonb, false
);

-- Tickets: Builder's Circle
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'regular', '🧠 Founder Seat', 'Reserved for founders and business owners.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 1 from events where slug = 'builders-circle-june-2026';
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'regular', '🎨 Creative Seat', 'Reserved for designers, artists, and content creators.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 2 from events where slug = 'builders-circle-june-2026';
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'regular', '🤝 Community Builder Seat', 'Reserved for hosts, organizers, and connectors.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 3 from events where slug = 'builders-circle-june-2026';
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'regular', '⚙️ Enabler Seat', 'Reserved for ops, tech, finance, and systems people.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 4 from events where slug = 'builders-circle-june-2026';

-- Tickets: RE:BLOOM
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'early_bird', 'Early Bird', 'General admission — early bird pricing', 0, 100, '2026-06-01 00:00:00+08', '2026-06-30 23:59:59+08', 'available', 1 from events where slug = 'rebloom-2026';
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'regular', 'General Admission', 'Standard entry to all open sessions', 0, 150, '2026-07-01 00:00:00+08', '2026-07-11 23:59:59+08', 'available', 2 from events where slug = 'rebloom-2026';
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'vip', 'VIP / Workshop Pass', 'Includes workshop materials & reserved seating', 750, 30, '2026-06-01 00:00:00+08', '2026-07-11 23:59:59+08', 'available', 3 from events where slug = 'rebloom-2026';
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'partner', 'MSME Showcase Booth', 'Marketplace booth + showcase pitch slot', 1500, 12, '2026-06-01 00:00:00+08', '2026-07-05 23:59:59+08', 'available', 4 from events where slug = 'rebloom-2026';
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order) select id, 'sponsor', 'Event Sponsor', 'Logo placement, booth, and stage mention', 10000, 5, '2026-06-01 00:00:00+08', '2026-07-10 23:59:59+08', 'available', 5 from events where slug = 'rebloom-2026';

-- Tickets: Founder Session 01 (hidden, draft)
insert into event_tickets (event_id, tier, name, description, price, capacity, status, sort_order) select id, 'regular', 'General Admission', 'Free entry — limited seats', 0, 30, 'hidden', 1 from events where slug = 'founder-session-01';

-- Speakers
insert into event_speakers (event_id, name, title, bio, sort_order) select id, 'Monica Joy Fernandez', 'Founder, As You Are Baguio', 'Community builder and host of the AYA Builder''s Circle, connecting 600+ members across Baguio''s creative and entrepreneurial ecosystem.', 1 from events where slug = 'builders-circle-june-2026';
insert into event_speakers (event_id, name, title, bio, sort_order) select id, 'Jenn Castro', 'Founder, Disenyo Digitals Collective & Destine Events', 'DOST-PCIEERD and LGU Baguio Urban Innovation awardee, building digital systems and community experiences for Baguio MSMEs.', 1 from events where slug = 'rebloom-2026';

-- Sponsors
insert into sponsors (event_id, name, package, amount, status, sort_order) select id, 'Disenyo Digitals Collective', 'Founding Tech Partner', 0, 'confirmed', 1 from events where slug = 'rebloom-2026';
insert into sponsors (event_id, name, package, amount, status, sort_order) select id, 'Destine Events', 'Co-Organizer', 0, 'confirmed', 2 from events where slug = 'rebloom-2026';
insert into sponsors (event_id, name, package, amount, status, sort_order) values (null, 'DTI Cordillera Administrative Region', 'Government Partner', 0, 'confirmed', 1);

-- Promo code
insert into promo_codes (code, description, discount_type, discount_value, event_id, max_uses, valid_from, valid_until, is_active)
values ('AYAMEMBER30', 'AYA Community Member Discount — 30% off any event ticket', 'percentage', 30, null, null, now(), null, true);

-- ═══════════════════════════════════════════════════════════════
-- DONE — your database is ready.
-- ═══════════════════════════════════════════════════════════════
