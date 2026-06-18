-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 003 — COMMUNITY ARCHETYPES (F / C / CB / E)
-- Run this in Supabase SQL Editor AFTER migration 002.
-- (Safe to run on existing AYA Events Hub projects.)
-- ═══════════════════════════════════════════════════════════════

-- ── ENUM ──

do $$ begin
  create type community_archetype as enum (
    'founder',           -- 🧠 F — Builder of the thing
    'creative',          -- 🎨 C — Builder of meaning, story, experience
    'community_builder', -- 🤝 CB — Builder of connection between people
    'enabler'            -- ⚙️ E — Builder of infrastructure
  );
exception
  when duplicate_object then null;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- COLUMNS — add archetype to registrations (per-event self-identification)
-- and attendees (latest known archetype, used for CRM segmentation)
-- ═══════════════════════════════════════════════════════════════

alter table registrations
  add column if not exists archetype community_archetype;

alter table attendees
  add column if not exists archetype community_archetype;

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER UPDATE — propagate archetype into the attendee CRM record
-- whenever a registration with an archetype comes in (most recent wins)
-- ═══════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════
-- END OF MIGRATION 003
-- ═══════════════════════════════════════════════════════════════
