// ═══════════════════════════════════════════════════════════════
// AYA EVENTS HUB — SHARED TYPES
// Mirrors supabase/schema.sql
// ═══════════════════════════════════════════════════════════════

export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type EventCategory =
  | "sip-and-scale"
  | "rebloom"
  | "founder-session"
  | "workshop"
  | "partner-event"
  | "other";
export type TicketTier =
  | "early_bird"
  | "regular"
  | "vip"
  | "partner"
  | "sponsor"
  | "guest";
export type TicketStatus = "available" | "sold_out" | "closed" | "hidden";
export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "waitlisted";
export type PaymentMethod =
  | "gcash"
  | "maya"
  | "bank_transfer"
  | "paymongo"
  | "free"
  | "cash";
export type PaymentStatus = "pending" | "paid" | "cancelled" | "refunded";
export type SponsorStatus = "lead" | "confirmed" | "paid" | "completed";

export type EmailType =
  | "registration_confirmation"
  | "payment_confirmation"
  | "abandoned_cart_reminder"
  | "event_reminder"
  | "newsletter"
  | "custom_update";

export type EmailStatus = "sent" | "failed" | "skipped";

export type CommunityArchetype = "founder" | "creative" | "community_builder" | "enabler";

export type DiscountType = "percentage" | "fixed";

export interface PromoCodeRecord {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  event_id: string | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: EventCategory;
  status: EventStatus;

  cover_image_url: string | null;
  banner_image_url: string | null;
  gallery_image_urls: string[];

  start_date: string;
  end_date: string | null;

  venue_name: string | null;
  venue_address: string | null;
  venue_map_url: string | null;

  organizer_name: string | null;
  organizer_contact: string | null;

  schedule: ScheduleItem[];
  faqs: FaqItem[];

  is_featured: boolean;
  coming_soon: boolean;
  capacity_total: number | null;

  created_at: string;
  updated_at: string;
}

export interface EventTicketRecord {
  id: string;
  event_id: string;
  tier: TicketTier;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  sold: number;
  sales_start: string | null;
  sales_end: string | null;
  status: TicketStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AttendeeRecord {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string | null;
  business_name: string | null;
  industry: string | null;
  social_link: string | null;
  newsletter_opt_in: boolean;
  networking_opt_in: boolean;
  first_seen_at: string;
  last_seen_at: string;
  archetype: CommunityArchetype | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRecord {
  id: string;
  event_id: string;
  ticket_id: string;
  attendee_id: string | null;

  full_name: string;
  business_name: string | null;
  email: string;
  mobile_number: string;
  industry: string | null;
  social_link: string | null;
  special_notes: string | null;

  newsletter_opt_in: boolean;
  networking_opt_in: boolean;

  archetype: CommunityArchetype | null;

  promo_code_id: string | null;
  discount_amount: number;
  final_amount: number | null;

  status: RegistrationStatus;

  qr_code: string | null;
  checked_in: boolean;
  checked_in_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  registration_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string | null;
  proof_image_url: string | null;
  notes: string | null;
  paid_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerRecord {
  id: string;
  name: string;
  category: string;
  location: string;
  location_label: string;
  logo: string;
  description: string;
  tags: string[];
  website: string;
  is_active: boolean;
  is_placeholder: boolean;
  sort_order: number;
  created_at: string;
}

export interface SponsorRecord {
  id: string;
  event_id: string | null;
  name: string;
  package: string | null;
  amount: number;
  logo_url: string | null;
  website: string | null;
  status: SponsorStatus;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventSpeakerRecord {
  id: string;
  event_id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  social_link: string | null;
  sort_order: number;
  created_at: string;
}

export interface EmailLogRecord {
  id: string;
  registration_id: string | null;
  attendee_id: string | null;
  email_type: EmailType;
  recipient_email: string;
  subject: string | null;
  status: EmailStatus;
  error_message: string | null;
  provider_message_id: string | null;
  sent_at: string;
}

export interface AbandonedRegistration {
  registration_id: string;
  full_name: string;
  email: string;
  registered_at: string;
  event_id: string;
  event_title: string;
  event_slug: string;
  event_start_date: string;
  ticket_name: string;
  ticket_price: number;
  payment_id: string | null;
  payment_status: string | null;
}

// ── Composite / view types ──

export interface EventWithTickets extends EventRecord {
  event_tickets: EventTicketRecord[];
  event_speakers?: EventSpeakerRecord[];
  sponsors?: SponsorRecord[];
}

export interface EventRevenueSummary {
  event_id: string;
  title: string;
  slug: string;
  revenue_paid: number;
  revenue_pending: number;
  total_registrations: number;
  confirmed_registrations: number;
  checked_in_count: number;
}

// ── Category display metadata ──

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  "sip-and-scale": "Sip & Scale",
  rebloom: "RE:BLOOM",
  "founder-session": "Founder Session",
  workshop: "Community Workshop",
  "partner-event": "Partner Event",
  other: "Community Event",
};

export const TICKET_TIER_LABELS: Record<TicketTier, string> = {
  early_bird: "Early Bird",
  regular: "Regular",
  vip: "VIP",
  partner: "Partner",
  sponsor: "Sponsor",
  guest: "Guest",
};

// ── Community archetype display metadata (F / C / CB / E) ──

export interface ArchetypeMeta {
  code: string;
  emoji: string;
  label: string;
  tagline: string;
  description: string;
  prompt: string; // "In conversation, they ask/anchor toward..."
}

export const ARCHETYPE_META: Record<CommunityArchetype, ArchetypeMeta> = {
  founder: {
    code: "F",
    emoji: "🧠",
    label: "Founder",
    tagline: "Builder of the thing",
    description:
      "Creates companies, products, or initiatives. Carries vision + execution pressure — usually thinking in systems, scale, and survival.",
    prompt: "What are you building, and why?",
  },
  creative: {
    code: "C",
    emoji: "🎨",
    label: "Creative",
    tagline: "Builder of meaning, story, and experience",
    description:
      "Designers, artists, content creators, storytellers, brand thinkers. Turns ideas into things people feel — focused on expression, identity, narrative, aesthetics.",
    prompt: "How does this feel / look / land with people?",
  },
  community_builder: {
    code: "CB",
    emoji: "🤝",
    label: "Community Builder",
    tagline: "Builder of connection between people",
    description:
      "Hosts, organizers, connectors, ecosystem builders. Thinks in relationships and networks — sees who should meet whom before others do.",
    prompt: "Who else should be in this room / loop / idea?",
  },
  enabler: {
    code: "E",
    emoji: "⚙️",
    label: "Enabler",
    tagline: "Builder of infrastructure",
    description:
      "People who make things possible behind the scenes — ops, tech, funding, education, systems, logistics, partnerships. Removes friction for everyone else.",
    prompt: "What's blocking this from actually happening?",
  },
};
