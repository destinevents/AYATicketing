import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { FeaturedBanner } from "@/components/FeaturedBanner";
import { SearchFilters } from "@/components/SearchFilters";
import type { EventCategory, EventRecord, EventTicketRecord } from "@/lib/types";

export const revalidate = 60; // refresh every minute

interface EventsPageProps {
  searchParams: Promise<{ q?: string; category?: string; time?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { q = "", category = "", time = "upcoming" } = await searchParams;
  const supabase = await createClient();

  const now = new Date().toISOString();

  let query = supabase
    .from("events")
    .select("*, event_tickets(*)")
    .in("status", ["published", "completed"]);

  if (time === "upcoming") {
    query = query.gte("start_date", now).order("start_date", { ascending: true });
  } else {
    query = query.lt("start_date", now).order("start_date", { ascending: false });
  }

  if (category) {
    query = query.eq("category", category as EventCategory);
  }

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: events } = await query;

  // Featured event (only relevant for upcoming view)
  const featured =
    time === "upcoming"
      ? events?.find((e) => e.is_featured) ?? events?.[0]
      : null;
  const restEvents = featured ? events?.filter((e) => e.id !== featured.id) : events;

  return (
    <>
      <Navbar />

      <main className="bg-fog-warm">
        {/* Hero */}
        <section className="bg-pine-deep px-6 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold-light">
              <span className="h-px w-7 bg-gold" />
              AYA Events Hub
            </div>
            <h1 className="max-w-2xl font-display text-4xl font-light leading-tight text-fog md:text-6xl">
              Where the <em className="italic text-gold-light">community</em> gathers
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog/60 md:text-base">
              From founder dinners to sustainability showcases — every AYA event in one place.
              Browse, register, and get your QR ticket instantly.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Featured banner */}
          {featured && (
            <div className="mb-12">
              <FeaturedBanner
                event={featured as EventRecord}
                tickets={(featured.event_tickets ?? []) as EventTicketRecord[]}
              />
            </div>
          )}

          {/* Filters */}
          <Suspense>
            <SearchFilters />
          </Suspense>

          {/* Section title */}
          <div className="mb-6 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted">
            {time === "upcoming" ? "Upcoming Events" : "Past Events"} · {restEvents?.length ?? 0}{" "}
            {restEvents?.length === 1 ? "event" : "events"}
          </div>

          {/* Past events — video recaps */}
          {time === "past" ? (
            <div>
              <div className="mb-8 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted">Event Recaps</div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  { id: "1536600577899891", label: "AYA Builder's Circle — June Session" },
                  { id: "3480520515446149", label: "AYA Event Recap" },
                ].map((video) => (
                  <div key={video.id} className="overflow-hidden rounded-xl border border-pine/10 bg-white shadow-sm">
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={`https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D${video.id}&show_text=false&width=640`}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        title={video.label}
                      />
                    </div>
                    <div className="px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">{video.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : restEvents && restEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event as EventRecord}
                  tickets={(event.event_tickets ?? []) as EventTicketRecord[]}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-pine/15 bg-white/50 py-16 text-center text-sm text-muted">
              No upcoming events match your search right now — check back soon! 🌿
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
