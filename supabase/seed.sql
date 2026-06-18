-- ═══════════════════════════════════════════════════════════════
-- AYA EVENTS HUB — SEED DATA
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── EVENT 1: AYA Builder's Circle — June Session ──
insert into events (
  slug, title, subtitle, description, category, status,
  cover_image_url, banner_image_url,
  start_date, end_date,
  venue_name, venue_address, venue_map_url,
  organizer_name, organizer_contact,
  schedule, faqs, is_featured
) values (
  'builders-circle-june-2026',
  'AYA Builder''s Circle — June Session',
  'A facilitated circle for Baguio''s Founders, Creatives, Community Builders & Enablers',
  'The AYA Builder''s Circle is an intimate, facilitated gathering designed to help Baguio entrepreneurs, creators, and community builders connect meaningfully, share challenges, and find collaborators. Spots are intentionally limited — 5 Founders, 5 Creatives, 5 Community Builders, and 5 Enablers — to keep the room balanced and the conversation real. Expect structured rounds, no corporate awkwardness, and genuine connections with people building things in Baguio.',
  'founder-session',
  'published',
  null, null,
  '2026-06-20 15:30:00+08',
  '2026-06-20 17:00:00+08',
  'El Cielito Hotel Baguio', 'Leonard Wood Road, Baguio City, Benguet', 'https://maps.google.com/?q=El+Cielito+Hotel+Baguio',
  'AYA Community x Destine Events', 'jenncastro@destinevents.biz',
  '[
    {"time": "3:30 PM", "title": "Arrival & Settling In", "description": "Welcome drinks, name tags, and casual mingling at El Cielito Hotel"},
    {"time": "3:45 PM", "title": "Opening Circle", "description": "Introductions and grounding — who''s in the room and why they showed up"},
    {"time": "4:00 PM", "title": "Round 1 — Sharing Wins & Challenges", "description": "Structured small-group rounds across archetypes (F / C / CB / E)"},
    {"time": "4:25 PM", "title": "Round 2 — Collaboration Mapping", "description": "Finding overlaps, asking for help, and spotting opportunities"},
    {"time": "4:45 PM", "title": "Closing Circle", "description": "Each person shares one commitment or connection they''re taking away"},
    {"time": "5:00 PM", "title": "Open Networking", "description": "Free-flow — the conversations that happen here often matter most"}
  ]'::jsonb,
  '[
    {"question": "Who can join the Builder''s Circle?", "answer": "Baguio-based (or Baguio-connected) entrepreneurs, creators, community builders, and enablers. Spots are application-based to keep the group intentional and balanced across archetypes."},
    {"question": "Why only 20 seats?", "answer": "The circle format only works when the group is small enough for real conversation. 5 Founders, 5 Creatives, 5 Community Builders, and 5 Enablers — that''s the magic number."},
    {"question": "What is the F / C / CB / E thing?", "answer": "These are community archetypes: Founder (builder of the thing), Creative (builder of meaning and story), Community Builder (builder of connection between people), and Enabler (builder of infrastructure). You''ll self-identify when you register — it helps us balance the room and structure the rounds."},
    {"question": "What should I bring?", "answer": "Just yourself, a few business cards if you have them, and openness to share. No pitch decks, no presentations."},
    {"question": "What happens after I apply?", "answer": "Our team reviews applications and confirms your slot via email within 2-3 days. Confirmed slots receive a QR ticket for check-in at El Cielito Hotel."},
    {"question": "Is this a one-time event?", "answer": "The Builder''s Circle is a recurring monthly gathering — June 20 is the first official session under the AYA Community. Future sessions will be announced inside the community."}
  ]'::jsonb,
  true
);

-- ── EVENT 2: RE:BLOOM 2026 ──
insert into events (
  slug, title, subtitle, description, category, status,
  cover_image_url, banner_image_url,
  start_date, end_date,
  venue_name, venue_address, venue_map_url,
  organizer_name, organizer_contact,
  schedule, faqs, is_featured
) values (
  'rebloom-2026',
  'RE:BLOOM 2026',
  'A sustainable floral retail transformation initiative for Baguio MSMEs',
  'RE:BLOOM is Destine Events'' flagship sustainability initiative for Baguio''s flower shops and floral MSMEs — built around a circular economy framework of Refuse, Rethink, Reduce. Join us for a half-day showcase featuring local floral entrepreneurs, sustainable packaging workshops, and a community marketplace.',
  'rebloom',
  'published',
  null, null,
  '2026-07-12 09:00:00+08',
  '2026-07-12 16:00:00+08',
  'Baguio Convention Center', 'Gov. Pack Road, Baguio City', null,
  'Destine Events x AYA Community', 'jenncastro@destinevents.biz',
  '[
    {"time": "9:00 AM", "title": "Doors Open & Registration", "description": "Welcome packets and seat assignment"},
    {"time": "9:30 AM", "title": "Opening Remarks", "description": "RE:BLOOM framework introduction"},
    {"time": "10:00 AM", "title": "Panel: Circular Economy for Flower Shops", "description": "Refuse, Rethink, Reduce in practice"},
    {"time": "11:30 AM", "title": "Sustainable Packaging Workshop", "description": "Hands-on session for floral MSMEs"},
    {"time": "1:00 PM", "title": "Lunch & Marketplace", "description": "Browse local floral and eco-product vendors"},
    {"time": "2:30 PM", "title": "MSME Showcase Pitches", "description": "Featured flower shops present their transformation plans"},
    {"time": "4:00 PM", "title": "Closing & Networking", "description": "Wrap-up and community photo"}
  ]'::jsonb,
  '[
    {"question": "Who is RE:BLOOM for?", "answer": "Flower shop owners, floral MSMEs, sustainability advocates, and anyone interested in circular economy practices in retail."},
    {"question": "Is there a cost to attend?", "answer": "General attendance is free with RSVP. VIP and Partner tiers include workshop materials and marketplace booth access."},
    {"question": "Can my flower shop get featured?", "answer": "Yes — apply for the MSME Showcase slot during registration or contact our team directly."}
  ]'::jsonb,
  true
);

-- ── EVENT 3: Founder Session 01 ──
insert into events (
  slug, title, subtitle, description, category, status,
  cover_image_url, banner_image_url,
  start_date, end_date,
  venue_name, venue_address, venue_map_url,
  organizer_name, organizer_contact,
  schedule, faqs, is_featured
) values (
  'founder-session-01',
  'Founder Session 01: Building in Baguio',
  'An honest conversation series for early-stage founders',
  'Founder Session 01 kicks off a new conversation series spotlighting the realities of building a business in Baguio — funding, hiring, distribution, and everything in between. Casual format, real talk, no pitch decks required.',
  'founder-session',
  'draft',
  null, null,
  '2026-08-09 14:00:00+08',
  '2026-08-09 17:00:00+08',
  'Location TBA', 'Baguio City, Benguet', null,
  'AYA Community', 'jenncastro@destinevents.biz',
  '[]'::jsonb,
  '[]'::jsonb,
  false
);

-- ═══════════════════════════════════════════════════════════════
-- TICKETS
-- ═══════════════════════════════════════════════════════════════

-- Builder's Circle tickets — 4 archetype tiers, 5 slots each (20 total)
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'regular', '🧠 Founder Seat', 'Reserved for founders, business owners & startup builders. You carry vision + execution pressure — this room gets it.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 1
from events where slug = 'builders-circle-june-2026';

insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'regular', '🎨 Creative Seat', 'Reserved for designers, artists, content creators & brand thinkers. You turn ideas into things people feel.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 2
from events where slug = 'builders-circle-june-2026';

insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'regular', '🤝 Community Builder Seat', 'Reserved for hosts, organizers, connectors & ecosystem builders. You see who should meet whom before others do.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 3
from events where slug = 'builders-circle-june-2026';

insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'regular', '⚙️ Enabler Seat', 'Reserved for ops, tech, finance, logistics & systems people. You make things actually happen behind the scenes.', 500, 5, '2026-06-01 00:00:00+08', '2026-06-19 23:59:59+08', 'available', 4
from events where slug = 'builders-circle-june-2026';

-- RE:BLOOM tickets
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'early_bird', 'Early Bird', 'General admission — early bird pricing', 0, 100, '2026-06-01 00:00:00+08', '2026-06-30 23:59:59+08', 'available', 1
from events where slug = 'rebloom-2026';

insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'regular', 'General Admission', 'Standard entry to all open sessions', 0, 150, '2026-07-01 00:00:00+08', '2026-07-11 23:59:59+08', 'available', 2
from events where slug = 'rebloom-2026';

insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'vip', 'VIP / Workshop Pass', 'Includes workshop materials & reserved seating', 750, 30, '2026-06-01 00:00:00+08', '2026-07-11 23:59:59+08', 'available', 3
from events where slug = 'rebloom-2026';

insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'partner', 'MSME Showcase Booth', 'Marketplace booth + showcase pitch slot', 1500, 12, '2026-06-01 00:00:00+08', '2026-07-05 23:59:59+08', 'available', 4
from events where slug = 'rebloom-2026';

insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'sponsor', 'Event Sponsor', 'Logo placement, booth, and stage mention', 10000, 5, '2026-06-01 00:00:00+08', '2026-07-10 23:59:59+08', 'available', 5
from events where slug = 'rebloom-2026';

-- Founder Session 01 tickets (draft, hidden)
insert into event_tickets (event_id, tier, name, description, price, capacity, sales_start, sales_end, status, sort_order)
select id, 'regular', 'General Admission', 'Free entry — limited seats', 0, 30, null, null, 'hidden', 1
from events where slug = 'founder-session-01';

-- ═══════════════════════════════════════════════════════════════
-- SPEAKERS
-- ═══════════════════════════════════════════════════════════════

insert into event_speakers (event_id, name, title, bio, sort_order)
select id, 'Monica Joy Fernandez', 'Founder, As You Are Baguio', 'Community builder and host of the AYA Builder''s Circle, connecting 600+ members across Baguio''s creative and entrepreneurial ecosystem.', 1
from events where slug = 'builders-circle-june-2026';

insert into event_speakers (event_id, name, title, bio, sort_order)
select id, 'Jenn Castro', 'Founder, Disenyo Digitals Collective & Destine Events', 'DOST-PCIEERD and LGU Baguio Urban Innovation awardee, building digital systems and community experiences for Baguio MSMEs.', 1
from events where slug = 'rebloom-2026';

-- ═══════════════════════════════════════════════════════════════
-- SPONSORS
-- ═══════════════════════════════════════════════════════════════

insert into sponsors (event_id, name, package, amount, status, sort_order)
select id, 'Disenyo Digitals Collective', 'Founding Tech Partner', 0, 'confirmed', 1
from events where slug = 'rebloom-2026';

insert into sponsors (event_id, name, package, amount, status, sort_order)
select id, 'Destine Events', 'Co-Organizer', 0, 'confirmed', 2
from events where slug = 'rebloom-2026';

-- Global ecosystem sponsor (event_id null)
insert into sponsors (event_id, name, package, amount, status, sort_order)
values (null, 'DTI Cordillera Administrative Region', 'Government Partner', 0, 'confirmed', 1);

-- ═══════════════════════════════════════════════════════════════
-- SAMPLE REGISTRATIONS (for testing admin dashboard / CRM)
-- ═══════════════════════════════════════════════════════════════

-- Sample confirmed registration for Builder's Circle
insert into registrations (
  event_id, ticket_id, full_name, business_name, email, mobile_number,
  industry, social_link, special_notes,
  newsletter_opt_in, networking_opt_in, status, qr_code, archetype
)
select
  e.id, t.id,
  'Maria Santos', 'Highland Threads', 'maria.santos@example.com', '+639171234567',
  'Fashion & Retail', 'https://instagram.com/highlandthreads', 'Vegetarian meal preference',
  true, true, 'confirmed', 'AYA-BC-' || substr(md5(random()::text), 1, 8), 'founder'
from events e, event_tickets t
where e.slug = 'builders-circle-june-2026' and t.event_id = e.id and t.name = '🧠 Founder Seat'
limit 1;

-- Sample pending registration for RE:BLOOM
insert into registrations (
  event_id, ticket_id, full_name, business_name, email, mobile_number,
  industry, social_link, special_notes,
  newsletter_opt_in, networking_opt_in, status, qr_code
)
select
  e.id, t.id,
  'Carlo Reyes', 'Pine Bloom Florals', 'carlo.reyes@example.com', '+639189876543',
  'Floral & Events', 'https://facebook.com/pinebloomflorals', null,
  true, false, 'pending', 'AYA-RB-' || substr(md5(random()::text), 1, 8)
from events e, event_tickets t
where e.slug = 'rebloom-2026' and t.event_id = e.id and t.tier = 'partner'
limit 1;

-- ═══════════════════════════════════════════════════════════════
-- SAMPLE PAYMENTS
-- ═══════════════════════════════════════════════════════════════

insert into payments (registration_id, amount, method, status, reference_number, paid_at)
select r.id, 500, 'gcash', 'paid', 'GC-2026-0001', now()
from registrations r where r.email = 'maria.santos@example.com';

insert into payments (registration_id, amount, method, status, reference_number)
select r.id, 1500, 'bank_transfer', 'pending', null
from registrations r where r.email = 'carlo.reyes@example.com';

-- ═══════════════════════════════════════════════════════════════
-- END OF SEED DATA
-- ═══════════════════════════════════════════════════════════════
