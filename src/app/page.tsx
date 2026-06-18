import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { createClient } from "@/lib/supabase/server";
import type { EventRecord, EventTicketRecord } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*, event_tickets(*)")
    .eq("status", "published")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(3);

  return (
    <>
      <Navbar />

      {/* ── Home / Hero ── */}
      <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-pine-deep px-6 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 select-none whitespace-nowrap font-display text-[14rem] italic leading-none text-white/[0.03]"
        >
          AYA
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold-light">
            <span className="h-px w-7 bg-gold" />
            Baguio City, Philippines · 600+ Members
            <span className="h-px w-7 bg-gold" />
          </div>
          <h1 className="mb-4 font-display text-5xl font-light leading-tight text-fog md:text-7xl">
            <em className="italic text-gold-light">As You Are</em>
            <br />
            Baguio
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-fog/60 md:text-base">
            A community platform for Baguio&apos;s creators, entrepreneurs, and ecosystem builders.
            Browse Sip &amp; Scale, RE:BLOOM, Founder Sessions, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#events"
              className="rounded-sm bg-gold px-8 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light"
            >
              Browse Events
            </a>
            <a
              href="#community"
              className="rounded-sm border border-fog/25 px-8 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-fog/75 transition-colors hover:border-fog/60 hover:text-fog"
            >
              Explore
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#community"
          aria-label="Scroll down"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-fog/30 transition-colors hover:text-fog/60"
        >
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em]">Scroll</span>
          <svg className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </section>

      {/* ── Community ── */}
      <section id="community" className="min-h-[60vh] bg-fog-warm px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold">
            <span className="h-px w-7 bg-gold" />
            Community
            <span className="h-px w-7 bg-gold" />
          </div>
          <h2 className="mb-4 font-display text-4xl font-light leading-tight text-pine md:text-5xl">
            Baguio&apos;s <em className="italic text-terra">Creative Voices</em>
          </h2>
          <p className="text-sm leading-relaxed text-muted md:text-base">
            The Creator Directory and full community profiles live on the main AYA landing page.
            This section will be merged into the Events Hub as the platforms are unified.
          </p>
        </div>
      </section>

      {/* ── eMagazine ── */}
      <section id="emagazine" className="min-h-[60vh] bg-pine-deep px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold-light">
            <span className="h-px w-7 bg-gold" />
            AYA eMagazine
            <span className="h-px w-7 bg-gold" />
          </div>
          <h2 className="mb-4 font-display text-4xl font-light leading-tight text-fog md:text-5xl">
            Stories from the <em className="italic text-gold-light">City of Pines</em>
          </h2>
          <p className="text-sm leading-relaxed text-fog/50 md:text-base">
            The Heyzine eMagazine flipbook embed and past issues archive live on the main AYA landing page.
            This section will be merged into the Events Hub as the platforms are unified.
          </p>
        </div>
      </section>

      {/* ── SME Directory ── */}
      <section id="sme-directory" className="min-h-[60vh] bg-fog-warm px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold">
            <span className="h-px w-7 bg-gold" />
            SME Directory
            <span className="h-px w-7 bg-gold" />
          </div>
          <h2 className="mb-4 font-display text-4xl font-light leading-tight text-pine md:text-5xl">
            Baguio&apos;s <em className="italic text-terra">Local Businesses</em>
          </h2>
          <p className="text-sm leading-relaxed text-muted md:text-base">
            The SME Directory (Founding Partners + open slots) lives on the main AYA landing page.
            This section will be merged into the Events Hub — with Supabase-backed listings.
          </p>
        </div>
      </section>

      {/* ── Events ── */}
      <section id="events" className="bg-fog-warm px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-pine/60">
            <span className="h-px w-7 bg-pine/30" />
            Upcoming Events
          </div>
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="font-display text-3xl font-light text-pine-deep md:text-5xl">
              Where the <em className="italic text-gold">community</em> gathers
            </h2>
            <Link
              href="/events"
              className="hidden shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-pine/50 underline decoration-pine/20 transition-colors hover:text-pine hover:decoration-pine/40 md:block"
            >
              View all →
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event as EventRecord}
                  tickets={(event.event_tickets ?? []) as EventTicketRecord[]}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-pine/15 bg-white/50 py-16 text-center text-sm text-muted">
              No upcoming events right now — check back soon! 🌿
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/events"
              className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-pine/50 underline decoration-pine/20 transition-colors hover:text-pine"
            >
              View all events →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
