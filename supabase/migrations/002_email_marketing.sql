-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 002 — EMAIL MARKETING & ABANDONED CART RECOVERY
-- Run this in Supabase SQL Editor AFTER schema.sql + seed.sql
-- (Safe to run on existing AYA Events Hub projects.)
-- ═══════════════════════════════════════════════════════════════

-- ── ENUMS ──

do $$ begin
  create type email_type as enum (
    'registration_confirmation',
    'payment_confirmation',
    'abandoned_cart_reminder',
    'event_reminder',
    'newsletter',
    'custom_update'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type email_status as enum ('sent', 'failed', 'skipped');
exception
  when duplicate_object then null;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- EMAIL LOGS — every email sent through the system
-- ═══════════════════════════════════════════════════════════════

create table if not exists email_logs (
  id uuid primary key default uuid_generate_v4(),

  registration_id uuid references registrations(id) on delete cascade,
  attendee_id uuid references attendees(id) on delete set null,

  email_type email_type not null,
  recipient_email text not null,
  subject text,

  status email_status not null default 'sent',
  error_message text,
  provider_message_id text,        -- Resend message id, for debugging

  sent_at timestamptz default now()
);

create index if not exists idx_email_logs_registration on email_logs(registration_id);
create index if not exists idx_email_logs_attendee on email_logs(attendee_id);
create index if not exists idx_email_logs_type on email_logs(email_type);
create index if not exists idx_email_logs_sent_at on email_logs(sent_at);

alter table email_logs enable row level security;

create policy "Admins manage email logs"
  on email_logs for all
  using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
  with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

-- Allow the registration API (service role) to insert logs — service role
-- bypasses RLS automatically, no extra policy needed for that path.

-- ═══════════════════════════════════════════════════════════════
-- VIEW — registrations with a pending payment that haven't been
-- reminded yet (the "abandoned cart" queue)
-- ═══════════════════════════════════════════════════════════════

create or replace view abandoned_registrations as
select
  r.id as registration_id,
  r.full_name,
  r.email,
  r.created_at as registered_at,
  e.id as event_id,
  e.title as event_title,
  e.slug as event_slug,
  e.start_date as event_start_date,
  t.name as ticket_name,
  t.price as ticket_price,
  p.id as payment_id,
  p.status as payment_status
from registrations r
join events e on e.id = r.event_id
join event_tickets t on t.id = r.ticket_id
left join payments p on p.registration_id = r.id
where r.status = 'pending'
  and (p.status is null or p.status = 'pending')
  and r.created_at < now() - interval '2 hours'
  and not exists (
    select 1 from email_logs el
    where el.registration_id = r.id
    and el.email_type = 'abandoned_cart_reminder'
    and el.status = 'sent'
  );

-- ═══════════════════════════════════════════════════════════════
-- END OF MIGRATION 002
-- ═══════════════════════════════════════════════════════════════
