# AYA Events Hub

A centralized event management & ticketing platform for the **As You Are Baguio** community — built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

Supports **Sip & Scale**, **RE:BLOOM**, **Founder Sessions**, **Community Workshops**, **Partner Events**, and any future event types.

---

## ✨ Features

- **Events Hub** (`/events`) — upcoming/past events, featured banner, category filters, search
- **Dynamic event pages** (`/events/[slug]`) — hero, description, schedule, venue, organizer, speakers, sponsors, gallery, FAQs
- **Ticketing system** — Early Bird / Regular / VIP / Partner / Sponsor / Guest tiers with price, capacity, sales windows
- **Registration flow** — ticket select → form → payment instructions → confirmation page
- **QR ticket generation** — unique QR per registration, encodes a check-in verification URL
- **Admin dashboard** — secure login (Supabase Auth), metrics, event CRUD (incl. duplicate), registrations management, payment status updates, sponsor module
- **Check-in dashboard** — scan/enter QR code, verify attendee, mark attendance
- **Community CRM** — every registrant automatically becomes a community record (with newsletter + networking opt-ins), exportable to CSV
- **Branded email marketing** — registration & payment confirmations (with QR ticket), abandoned cart recovery reminders, and admin-composed community updates — all with AYA logo, name, and tagline
- **Community archetypes (F/C/CB/E)** — optional self-identification (Founder / Creative / Community Builder / Enabler) for richer CRM segmentation and event facilitation

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS (AYA brand tokens: pine, fog, gold, terra, moss) |
| Database / Auth | Supabase (Postgres + RLS + Auth) |
| QR Codes | `qrcode` npm package |
| Email | Resend + React Email (branded templates) |
| Forms | `react-hook-form` + `zod` |
| Hosting | Vercel |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run `supabase/schema.sql` — this creates all tables, enums, triggers, RLS policies, and the `event_revenue_summary` view.
3. Run `supabase/seed.sql` — this seeds 3 sample events (AYA Builder's Circle, RE:BLOOM 2026, Founder Session 01) with tickets, speakers, sponsors, and sample registrations.
4. Run `supabase/migrations/002_email_marketing.sql` — adds `email_logs` table + `abandoned_registrations` view.
5. Run `supabase/migrations/003_community_archetypes.sql` — adds the F/C/CB/E `archetype` field to registrations & attendees.
6. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep secret — server-only)

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase keys and site URL. See [.env.example](.env.example) for the full list (payment gateway keys are placeholders for now).

### 4. Create your first admin user

1. In Supabase Dashboard → **Authentication → Users**, click **Add User** and create an account (e.g. `jenn@destinevents.biz`) with a password.
2. Copy the new user's **UUID**.
3. In **SQL Editor**, run:

```sql
insert into admin_users (id, full_name, role)
values ('PASTE-USER-UUID-HERE', 'Jenn Castro', 'super_admin');
```

4. You can now log in at `/admin/login`.

### 5. Run locally

```bash
npm run dev
```

Visit:
- `http://localhost:3000` — home
- `http://localhost:3000/events` — Events Hub
- `http://localhost:3000/admin/login` — Admin dashboard

---

## 🗄️ Database Schema

See `supabase/schema.sql` for the full schema. Summary of tables:

| Table | Purpose |
|---|---|
| `events` | Core event records (slug, title, category, status, dates, venue, schedule/FAQs as JSONB) |
| `event_tickets` | Ticket tiers per event (price, capacity, sold, sales window, status) |
| `registrations` | One row per registrant — snapshot of form data + QR code + check-in status |
| `payments` | One row per registration — method, status (pending/paid/cancelled/refunded) |
| `attendees` | Community CRM — auto-upserted from registrations by email |
| `sponsors` | Sponsors (event-specific or global/ecosystem) |
| `event_speakers` | Speakers/hosts per event |
| `admin_users` | Maps Supabase Auth users to admin roles |

**Key triggers:**
- `trg_registration_sold_count` — auto-increments/decrements `event_tickets.sold` when a registration's status changes to/from `confirmed`.
- `trg_upsert_attendee` — auto-creates or updates an `attendees` row whenever a registration is inserted, linking via `attendee_id`.

**Row Level Security:**
- Public (anon) can: read published/completed events, tickets, speakers, sponsors; insert registrations and payments.
- Admins (rows in `admin_users`) have full read/write access to everything.

---

## 🎟️ Registration & Ticketing Flow

```
Visitor → /events/[slug] → Select Ticket → /events/[slug]/register?ticket=ID
        → Registration Form (POST /api/registrations)
        → /events/confirmation/[id]  (QR ticket + payment instructions)
```

- **Free tickets** (`price = 0`) are auto-confirmed and the payment record is marked `paid`.
- **Paid tickets** start as `pending` — the confirmation page shows GCash / Maya / Bank Transfer instructions. Admins mark payments as `paid` in **Admin → Events → Registrations**, which the trigger then reflects in `event_tickets.sold`.

### Community opt-ins

Every registration form includes:

- ☑ **Join the AYA Community Newsletter**
- ☑ **Be included in future networking and business opportunities**

Both are stored on the registration *and* the `attendees` CRM record, so every event attendee becomes part of the growing AYA ecosystem — not just a one-time ticket.

---

## 💳 Payment Architecture

**Live PayMongo payment link is wired in:**

- `NEXT_PUBLIC_PAYMONGO_PAYMENT_LINK=https://paymongo.page/l/ayafounderscreatives` (AYA Founders & Creatives)
- This renders as a **"Pay Now via PayMongo →"** button on the confirmation page for any paid ticket. It accepts card, GCash, and Maya through PayMongo's hosted checkout.
- Manual GCash / Maya / Bank Transfer instructions remain available in a collapsible "Or pay manually" section as a fallback.

**Reconciliation (manual, for now):**

Since this is a single shared hosted link (not a per-registration checkout session), payments aren't automatically matched to registrations. The flow is:

1. Attendee pays via the PayMongo link (or manual GCash/Maya/bank transfer) and emails proof of payment + their **registration ID** (shown on the confirmation page).
2. Admin verifies the payment in PayMongo's dashboard, then marks the registration's payment as **Paid** in **Admin → Events → Registrations** (or via `PATCH /api/payments`).
3. The `trg_registration_sold_count` trigger updates `event_tickets.sold` automatically when `registrations.status = 'confirmed'`.

**Going further (per-registration checkout):**

To generate a unique PayMongo Checkout Session per registration (so payments auto-reconcile via webhook):

1. Get full API keys from PayMongo and set `PAYMONGO_SECRET_KEY` / `PAYMONGO_PUBLIC_KEY`.
2. On registration, call PayMongo's Checkout Sessions API with the registration ID in `metadata`, and redirect to the returned `checkout_url` instead of the shared link.
3. Add a webhook route (`/api/webhooks/paymongo`) that verifies the event signature and updates `payments.status = 'paid'` + `paid_at` automatically using the `metadata.registration_id`.

Admins can always manually override payment status (Pending / Paid / Cancelled / Refunded) via **Admin → Events → Registrations**, or via `PATCH /api/payments`.

---

## 🔳 QR Tickets & Check-In

- On registration, a unique token is generated (`generateQrToken()` in `src/lib/utils.ts`), stored as `registrations.qr_code`.
- The confirmation page renders a QR code (via `src/lib/qrcode.ts`) that encodes:
  `${NEXT_PUBLIC_SITE_URL}/admin/checkin?code=<qr_code>`
- **Admin → Check-In** (`/admin/checkin`):
  - Staff can type/paste the code manually, or
  - Scan with a phone camera — opening the encoded URL auto-fills the code via the `?code=` query param.
  - "Verify" looks up the registration and shows attendee details, payment status, and ticket info.
  - "Confirm Check-In" marks `checked_in = true` and timestamps it.

> **Note:** A live camera barcode scanner (e.g. `@zxing/browser` or the browser `BarcodeDetector` API) can be wired into `CheckInDashboard.tsx` — the integration point is marked with a `TODO`-style comment.

---

## 📧 Email Marketing

Every email is **branded** with the AYA logo, "As You Are Baguio" name, and one-line service description
(`src/lib/email/templates/EmailLayout.tsx`), sent via [Resend](https://resend.com).

### Setup

1. Create a free Resend account, verify your sending domain (e.g. `destinevents.biz`).
2. Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `"As You Are Baguio <hello@destinevents.biz>"`).
3. Set `NEXT_PUBLIC_COMPANY_LOGO_URL` to a hosted square logo image (Supabase Storage or `/public/images/`).
4. (Optional but recommended) set `CRON_SECRET` to any random string — Vercel will send it automatically to authorize the abandoned-cart cron.

> If `RESEND_API_KEY` is not set, emails are logged to `email_logs` with status `skipped` instead of failing — the app keeps working without email configured.

### Email types

| Email | Trigger | Template |
|---|---|---|
| **Registration confirmation** (+ QR ticket) | Sent immediately after a registration is created (free or paid) | `RegistrationConfirmationEmail.tsx` |
| **Payment confirmed** (+ QR ticket) | Sent when an admin marks a payment `paid` via `PATCH /api/payments` (also auto-confirms the registration) | `PaymentConfirmedEmail.tsx` |
| **Abandoned cart reminder** | Registrations `pending` for 2+ hours with no reminder yet — see `abandoned_registrations` view | `AbandonedCartEmail.tsx` |
| **Community update / newsletter** | Admin-composed, sent to a chosen segment | `CustomUpdateEmail.tsx` |

### Abandoned Cart Recovery 🌱

- **Automatic**: `vercel.json` schedules `/api/cron/abandoned-carts` every 6 hours. It queries the `abandoned_registrations` view (pending payment, 2+ hours old, no reminder sent) and emails each person a "your spot is waiting" reminder with the PayMongo "Pay Now" link.
- **Manual**: **Admin → Email Marketing** shows the live queue and a "Send Reminders Now" button (`/api/admin/send-abandoned-reminders`).
- To change the 2-hour window, edit the `interval '2 hours'` condition in `supabase/migrations/002_email_marketing.sql`.

### Admin → Email Marketing (`/admin/email`)

- **Abandoned Cart Queue** — live list + manual send trigger.
- **Compose Community Update** — write a subject + message (separate paragraphs with a blank line), optional CTA button, and pick an audience:
  - Newsletter subscribers
  - Networking opt-ins
  - All attendees
  - By archetype (Founder / Creative / Community Builder / Enabler)
  - By event (everyone confirmed for a specific event — handy for event reminders)
- **Recent Email Activity** — last 15 sends with status (sent / failed / skipped), pulled from `email_logs`.

### Running the migration

After `schema.sql` + `seed.sql`, also run:

```sql
-- supabase/migrations/002_email_marketing.sql
-- supabase/migrations/003_community_archetypes.sql
```

in the SQL Editor (in that order) to add `email_logs`, the `abandoned_registrations` view, and the F/C/CB/E `archetype` columns.

---

## 🧠 Community Archetypes (F / C / CB / E)

Every registration form includes an optional self-identification step:

| Code | Archetype | "Builder of…" | In conversation, anchors toward… |
|---|---|---|---|
| 🧠 F | **Founder** | the thing | "What are you building, and why?" |
| 🎨 C | **Creative** | meaning, story, experience | "How does this feel / look / land?" |
| 🤝 CB | **Community Builder** | connection between people | "Who else should be in this room?" |
| ⚙️ E | **Enabler** | infrastructure | "What's blocking this from happening?" |

This is stored on both `registrations.archetype` (per-event) and `attendees.archetype` (latest known, for CRM
segmentation) — see `src/lib/types.ts` → `ARCHETYPE_META` for the full descriptions used in the UI.

Use cases:
- **Builder's Circle facilitation** — instantly see the F/C/CB/E mix of attendees for "Collaboration Mapping" rounds.
- **Community CRM** (`/admin/attendees`) — filter and count attendees by archetype.
- **Email Marketing** (`/admin/email`) — send targeted updates to e.g. "all Creatives" about a design-focused event.

---

`/admin/dashboard` — metrics: total events, upcoming events, tickets sold, total revenue, total registrations, community attendees, sponsors, avg. revenue/event.

`/admin/events` — list all events with category, date, status, ticket tiers, registration counts. Actions: **View**, **Edit**, **Registrations**, **Duplicate**, **Delete**.

`/admin/events/new` and `/admin/events/[id]/edit`:
- Core event fields (title, slug, category, status, description, dates, venue, organizer, featured flag)
- Gallery image URLs (one per line — pair with Supabase Storage)
- Schedule & FAQs as structured JSON editors
- **Ticket Tiers manager** — add/edit/delete tiers with tier, price, capacity, sales window, status
- **Speakers manager** — add/edit/remove speakers/hosts

`/admin/events/[id]/registrations` — table of all registrations for an event with inline editors for registration status, payment status, and check-in toggle. CSV export.

`/admin/attendees` — Community CRM. Every unique email across all events, with business, industry, archetype (F/C/CB/E), events attended, and opt-in flags. Filter by archetype. CSV export (`/api/export/csv?type=attendees`).

`/admin/email` — Email Marketing: abandoned cart queue + manual send, compose & send community updates to segments, recent email activity log.

`/admin/sponsors` — sponsor list (event-specific or global), package, amount, status (lead/confirmed/paid/completed).

`/admin/checkin` — QR check-in dashboard (see above).

---

## 📁 Project Structure

```
aya-events-hub/
├── vercel.json              # Cron config (abandoned cart reminders)
├── supabase/
│   ├── schema.sql          # Full DB schema, RLS, triggers, views
│   ├── seed.sql             # Sample events, tickets, speakers, sponsors
│   └── migrations/
│       ├── 002_email_marketing.sql      # email_logs table + abandoned_registrations view
│       └── 003_community_archetypes.sql # F/C/CB/E archetype columns
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Home
│   │   ├── community/ emagazine/ sme-directory/  # Placeholders (merge w/ main landing page)
│   │   ├── events/
│   │   │   ├── page.tsx                      # Events Hub
│   │   │   ├── [slug]/page.tsx               # Event detail
│   │   │   ├── [slug]/register/page.tsx      # Ticket select + registration form
│   │   │   └── confirmation/[id]/page.tsx    # QR ticket + payment instructions
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   └── (authenticated)/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── events/ (list, new, [id]/edit, [id]/registrations)
│   │   │       ├── attendees/page.tsx        # Community CRM (with archetype filter)
│   │   │       ├── email/page.tsx            # Email Marketing dashboard
│   │   │       ├── sponsors/page.tsx
│   │   │       └── checkin/page.tsx
│   │   └── api/
│   │       ├── registrations/route.ts        # POST — create registration + QR + payment + confirmation email
│   │       ├── payments/route.ts             # PATCH — admin payment status update + payment-confirmed email
│   │       ├── checkin/route.ts              # POST — verify / check-in by QR code
│   │       ├── export/csv/route.ts           # GET — CSV export (attendees / registrations)
│   │       ├── cron/abandoned-carts/route.ts # GET — Vercel Cron: abandoned cart reminders
│   │       └── admin/
│   │           ├── send-update/route.ts             # POST — send community update to a segment
│   │           └── send-abandoned-reminders/route.ts # POST — manual abandoned cart trigger
│   ├── components/                           # Navbar, Footer, EventCard, TicketCard, ArchetypeSelector, etc.
│   ├── lib/
│   │   ├── types.ts                          # Shared TypeScript types (mirrors schema) + ARCHETYPE_META
│   │   ├── utils.ts                          # Formatting, ticket availability, CSV, slugs
│   │   ├── qrcode.ts                         # QR generation
│   │   ├── email/
│   │   │   ├── resend.ts                     # Resend client
│   │   │   ├── send.ts                       # Send + log helper functions
│   │   │   └── templates/                    # React Email templates (branded)
│   │   └── supabase/ (client.ts, server.ts, middleware.ts)
│   └── middleware.ts                         # Session refresh + /admin route protection
```

---

## ☁️ Deploy to Vercel

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com), click **Add New Project** → import the repo.
3. Add environment variables (from `.env.local`) in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel domain, e.g. `https://aya-events.vercel.app`)
   - `NEXT_PUBLIC_PAYMONGO_PAYMENT_LINK`
   - `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_COMPANY_LOGO_URL` (for branded emails)
   - `CRON_SECRET` (random string — secures the abandoned-cart cron route)
   - (Optional, for later) `PAYMONGO_SECRET_KEY`, `PAYMONGO_PUBLIC_KEY`, etc.
4. Deploy. Vercel will build with `npm run build` and serve via `next start` automatically.
5. Update `NEXT_PUBLIC_SITE_URL` to match your final domain — this is used to build the QR check-in URLs.

### Connecting to the existing AYA landing page

This Events Hub is designed to live at `/events` within the broader AYA Community site:

- If the main landing page (`aya-baguio-landing.html`) is deployed separately, point its **Events** nav link and "Get Tickets" CTAs to `https://<this-deployment>/events`.
- If/when both are merged into one Next.js project, copy the `community`, `emagazine`, and `sme-directory` sections from the static landing page into the placeholder routes already scaffolded here (`src/app/community`, `src/app/emagazine`, `src/app/sme-directory`), and update `src/components/Navbar.tsx` links if paths change.

---

## 🧩 Extending

- **Email confirmations**: wire up Resend, SendGrid, or Nodemailer in `src/app/api/registrations/route.ts` (marked with a `TODO`). Include the QR ticket via `generateQrSvg()`.
- **Image uploads**: use Supabase Storage for event cover images, gallery photos, and sponsor logos — store the public URL in the relevant `*_url` fields.
- **PayMongo checkout**: see "Payment Architecture" above.
- **Live QR scanning**: integrate `@zxing/browser` in `CheckInDashboard.tsx`.
- **"Send Updates" to attendees**: build a simple admin form that queries `attendees` (optionally filtered by `newsletter_opt_in` or event) and sends a bulk email via your provider of choice.

---

## 🌿 Brand Tokens (Tailwind)

| Token | Hex | Usage |
|---|---|---|
| `pine` / `pine-deep` / `pine-mid` / `pine-light` | `#2B3228` / `#1D2219` / `#3A4436` / `#4E5C49` | Primary brand greens |
| `fog` / `fog-2` / `fog-warm` | `#F0EDE6` / `#E8E4DC` / `#FAF8F4` | Backgrounds, light text on dark |
| `gold` / `gold-light` | `#C9A84C` / `#DEC270` | Accents, CTAs |
| `moss` | `#7A9B6A` | Success / confirmed states |
| `terra` | `#8B4A35` | Highlights, category tags |
| `ink` | `#1A1E18` | Body text |
| `muted` | `#6B7864` | Secondary text |

Fonts: **Fraunces** (display/headings), **DM Sans** (body), **DM Mono** (labels/mono).

---

🌱 *Built for the As You Are Baguio community — every ticket sold grows the ecosystem.*
