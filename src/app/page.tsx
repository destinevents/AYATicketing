import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { HeroSection } from "@/components/HeroSection";
import { CreatorDirectory } from "@/components/CreatorDirectory";
import { SMEDirectory } from "@/components/SMEDirectory";
import { JoinSection } from "@/components/JoinSection";
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
      <HeroSection />
      <CreatorDirectory />
      <SMEDirectory />

      {/* ── eMagazine ── */}
      <section id="emag" className="bg-fog-warm px-8 py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-gold">
              <span className="h-px w-6 flex-shrink-0 bg-gold" /> AYA eMagazine
            </div>
            <h2 className="font-display text-pine" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.15 }}>
              Stories from the <em className="font-light italic text-terra">City of Pines</em>
            </h2>
            <p className="mt-3 max-w-[520px] text-[0.95rem] leading-[1.7] text-muted">
              The official AYA digital magazine — featuring creators, entrepreneurs, and the people behind Baguio&apos;s vibrant community. Published monthly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_340px]">
            {/* Flipbook */}
            <div>
              <div className="relative overflow-hidden rounded-lg border border-pine/[0.12] bg-fog-2" style={{ aspectRatio: "3/2" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-pine p-8 text-center">
                  <div className="mb-4 text-5xl opacity-50">📖</div>
                  <p className="max-w-[280px] text-[0.88rem] leading-[1.6] text-fog/55">
                    Your Heyzine eMagazine flipbook will appear here. Paste your embed code to activate.
                  </p>
                  <div className="mt-6 rounded bg-white/5 px-4 py-2.5 font-mono text-[0.65rem] tracking-[0.08em] text-gold-light">
                    Replace with your Heyzine iframe embed
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="#" className="rounded-sm bg-gold px-6 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light">
                  Read Latest Issue →
                </a>
                <a href="#" className="rounded-sm border border-pine/20 px-6 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted transition-colors hover:border-pine/40 hover:text-pine">
                  Download PDF
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <p className="mb-7 text-[0.88rem] leading-[1.75] text-muted">
                The AYA eMagazine spotlights Baguio&apos;s creators, SMEs, and stories that rarely make the mainstream press. Submissions open every month.
              </p>
              <div className="mb-8">
                <div className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted">Past Issues</div>
                {[
                  { emoji: "📖", title: "The Sip & Scale Launch Edition", date: "June 2026 · Vol. 1 Issue 1" },
                  { emoji: "📗", title: "Baguio Founders Spotlight", date: "Coming Soon · Vol. 1 Issue 2" },
                  { emoji: "📘", title: "Women Who Build Baguio", date: "Coming Soon · Vol. 1 Issue 3" },
                ].map((issue, i) => (
                  <div key={i} className="flex cursor-pointer items-center gap-3 border-b border-pine/[0.08] py-3 transition-all hover:pl-1.5">
                    <div className="flex h-9 w-[52px] flex-shrink-0 items-center justify-center rounded bg-pine text-base">{issue.emoji}</div>
                    <div>
                      <div className="text-[0.85rem] leading-[1.3] text-pine">{issue.title}</div>
                      <div className="mt-0.5 font-mono text-[0.7rem] text-muted">{issue.date}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-dashed border-pine/20 bg-fog-2 p-6">
                <h4 className="mb-2 font-display text-[1.05rem] font-normal text-pine">Have a story to tell?</h4>
                <p className="mb-4 text-[0.8rem] leading-[1.65] text-muted">
                  We feature Baguio creators, businesses, community events, and untold stories. Submissions are free and open to everyone in the AYA community.
                </p>
                <a href="#join" className="rounded-sm bg-gold px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light">
                  Submit Your Story
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Events ── */}
      <section id="events" className="bg-pine-deep px-8 py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-gold-light">
              <span className="h-px w-6 flex-shrink-0 bg-gold" /> Upcoming Events
            </div>
            <h2 className="font-display text-fog" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.15 }}>
              Where the <em className="font-light italic text-gold-light">Community Gathers</em>
            </h2>
            <p className="mt-3 max-w-[520px] text-[0.95rem] leading-[1.7] text-fog/60">
              AYA events brought to life by Destine Events. From intimate Builder&apos;s Circles to curated founder dinners — always intentional, always Baguio.
            </p>
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
            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] py-16 text-center text-[0.88rem] text-fog/40">
              No upcoming events right now — check back soon! 🌿
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="mb-4 text-[0.85rem] text-fog/45">
              Powered by <strong className="text-fog/65">Destine Events</strong> — Baguio&apos;s community experience engine
            </p>
            <Link
              href="/events"
              className="rounded-sm border border-fog/25 px-7 py-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-fog/60 transition-colors hover:border-fog/50 hover:text-fog"
            >
              View All Events →
            </Link>
          </div>
        </div>
      </section>

      <JoinSection />
      <Footer />
    </>
  );
}
