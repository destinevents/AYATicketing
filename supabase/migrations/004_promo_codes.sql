-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 004 — PROMO / DISCOUNT CODES
-- Run this in Supabase SQL Editor AFTER migration 003.
-- ═══════════════════════════════════════════════════════════════

-- ── ENUM ──

do $$ begin
  create type discount_type as enum ('percentage', 'fixed');
exception
  when duplicate_object then null;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- PROMO CODES TABLE
-- ═══════════════════════════════════════════════════════════════

create table if not exists promo_codes (
  id uuid primary key default uuid_generate_v4(),

  code text unique not null,           -- the code the user types e.g. AYAMEMBER30
  description text,                    -- internal label e.g. "Community Member 30% Discount"

  discount_type discount_type not null default 'percentage',
  discount_value numeric(10,2) not null, -- 30 = 30% off, or 150 = ₱150 off

  -- Scope — null = applies to all events
  event_id uuid references events(id) on delete cascade,

  -- Limits
  max_uses int,                        -- null = unlimited
  used_count int not null default 0,

  -- Validity window
  valid_from timestamptz default now(),
  valid_until timestamptz,             -- null = never expires

  is_active boolean not null default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_promo_codes_code on promo_codes(code);
create index if not exists idx_promo_codes_event_id on promo_codes(event_id);

alter table promo_codes enable row level security;

-- Public can read active codes (needed so the registration form can validate)
create policy "Public can validate active promo codes"
  on promo_codes for select
  using (is_active = true);

-- Admins full access
create policy "Admins manage promo codes"
  on promo_codes for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

-- ── updated_at trigger ──
create trigger trg_promo_codes_updated_at before update on promo_codes
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- TRACK WHICH CODE WAS USED ON EACH REGISTRATION
-- ═══════════════════════════════════════════════════════════════

alter table registrations
  add column if not exists promo_code_id uuid references promo_codes(id) on delete set null,
  add column if not exists discount_amount numeric(10,2) default 0,
  add column if not exists final_amount numeric(10,2);  -- price after discount

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER — auto-increment promo_codes.used_count on new registration
-- ═══════════════════════════════════════════════════════════════

create or replace function increment_promo_used_count()
returns trigger as $$
begin
  if new.promo_code_id is not null then
    update promo_codes
    set used_count = used_count + 1
    where id = new.promo_code_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_promo_used_count
  after insert on registrations
  for each row execute function increment_promo_used_count();

-- ═══════════════════════════════════════════════════════════════
-- SEED — AYA Community Member 30% discount code
-- ═══════════════════════════════════════════════════════════════

insert into promo_codes (
  code, description, discount_type, discount_value,
  event_id, max_uses, valid_from, valid_until, is_active
) values (
  'AYAMEMBER30',
  'AYA Community Member Discount — 30% off any event ticket',
  'percentage',
  30,
  null,        -- applies to all events
  null,        -- unlimited uses
  now(),
  null,        -- never expires (admin can deactivate manually)
  true
);

-- ═══════════════════════════════════════════════════════════════
-- END OF MIGRATION 004
-- ═══════════════════════════════════════════════════════════════
