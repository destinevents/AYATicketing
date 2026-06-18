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
    .limit(9);

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-fog-warm px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-pine/60">
            <span className="h-px w-7 bg-pine/30" />
            Baguio City, Philippines
          </div>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-light text-pine-deep md:text-6xl">
                <em className="italic text-gold">As You Are</em> Baguio
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                Events for Baguio&apos;s founders, creatives, community builders &amp; enablers.
              </p>
            </div>
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
            <div className="rounded-xl border border-dashed border-pine/15 bg-white/50 py-24 text-center text-sm text-muted">
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
