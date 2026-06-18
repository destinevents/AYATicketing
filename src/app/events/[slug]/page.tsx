import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TicketCard } from "@/components/TicketCard";
import { CATEGORY_LABELS, type EventTicketRecord, type EventSpeakerRecord, type SponsorRecord } from "@/lib/types";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";

export const revalidate = 60;

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  "sip-and-scale": "from-[#1D2A1D] to-[#3A6A3A]",
  rebloom: "from-[#3A2228] to-[#8B5A5A]",
  "founder-session": "from-[#1D2A3A] to-[#2D5A8E]",
  workshop: "from-[#2E3A1A] to-[#7A9B3A]",
  "partner-event": "from-[#2A1D38] to-[#6B4A8E]",
  other: "from-[#2B3228] to-[#4E5C49]",
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, event_tickets(*), event_speakers(*), sponsors(*)")
    .eq("slug", slug)
    .in("status", ["published", "completed"])
    .single();

  if (!event) notFound();

  const tickets = ((event.event_tickets ?? []) as EventTicketRecord[]).sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const speakers = (event.event_speakers ?? []) as EventSpeakerRecord[];
  const sponsors = (event.sponsors ?? []) as SponsorRecord[];
  const gradient = CATEGORY_GRADIENTS[event.category] ?? CATEGORY_GRADIENTS.other;

  const lowestPrice = tickets.length
    ? Math.min(...tickets.filter((t) => t.status !== "hidden").map((t) => t.price))
    : null;

  return (
    <>
      <Navbar />

      <main className="bg-fog-warm">
        {/* ── Hero ── */}
        <section className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-6 py-16 text-fog md:py-24`}>
          <div className="mx-auto max-w-4xl">
            <Link
              href="/events"
              className="mb-6 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-fog/60 transition-colors hover:text-fog"
            >
              ← Back to Events
            </Link>
            <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-gold-light">
              {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]}
            </span>
            <h1 className="mb-4 font-display text-4xl font-light leading-tight md:text-6xl">{event.title}</h1>
            {event.subtitle && (
              <p className="max-w-2xl text-base leading-relaxed text-fog/70 md:text-lg">{event.subtitle}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-fog/45">Date</div>
                <div className="mt-1">{formatDate(event.start_date)}</div>
              </div>
              <div>
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-fog/45">Time</div>
                <div className="mt-1">
                  {formatTime(event.start_date)}
                  {event.end_date && ` – ${formatTime(event.end_date)}`}
                </div>
              </div>
              <div>
                <div className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-fog/45">Venue</div>
                <div className="mt-1">{event.venue_name ?? "TBA"}</div>
              </div>
              {lowestPrice !== null && (
                <div>
                  <div className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-fog/45">Tickets</div>
                  <div className="mt-1">{lowestPrice === 0 ? "Free" : `From ${formatCurrency(lowestPrice)}`}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-12 md:grid-cols-[1fr_360px] md:py-16">
          {/* Main column */}
          <div className="space-y-12">
            {/* Description */}
            {event.description && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-pine">
                  About <em className="italic text-terra">this event</em>
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80 md:text-base">
                  {event.description}
                </p>
              </section>
            )}

            {/* Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-pine">
                  Event <em className="italic text-terra">Schedule</em>
                </h2>
                <div className="space-y-3">
                  {event.schedule.map((item: { time: string; title: string; description?: string }, i: number) => (
                    <div key={i} className="flex gap-4 rounded-lg border border-pine/10 bg-white p-4">
                      <div className="w-20 flex-shrink-0 font-mono text-xs font-medium text-gold">
                        {item.time}
                      </div>
                      <div>
                        <div className="font-display text-base text-pine">{item.title}</div>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Venue */}
            <section>
              <h2 className="mb-4 font-display text-2xl text-pine">
                Venue <em className="italic text-terra">Information</em>
              </h2>
              <div className="rounded-lg border border-pine/10 bg-white p-5">
                <div className="font-display text-lg text-pine">{event.venue_name ?? "Venue TBA"}</div>
                {event.venue_address && <p className="mt-1 text-sm text-muted">{event.venue_address}</p>}
                {event.venue_map_url && (
                  <a
                    href={event.venue_map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-terra hover:text-terra/70"
                  >
                    View on Map →
                  </a>
                )}
              </div>
            </section>

            {/* Speakers */}
            {speakers.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-pine">
                  Speakers & <em className="italic text-terra">Hosts</em>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {speakers.map((sp) => (
                    <div key={sp.id} className="flex gap-4 rounded-lg border border-pine/10 bg-white p-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-pine/10 text-2xl">
                        👤
                      </div>
                      <div>
                        <div className="font-display text-base text-pine">{sp.name}</div>
                        {sp.title && <div className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">{sp.title}</div>}
                        {sp.bio && <p className="mt-1.5 text-xs leading-relaxed text-muted">{sp.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sponsors */}
            {sponsors.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-pine">
                  Our <em className="italic text-terra">Sponsors</em>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {sponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="flex items-center gap-3 rounded-lg border border-pine/10 bg-white px-5 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-pine/5 text-base">
                        ✦
                      </div>
                      <div>
                        <div className="font-display text-sm text-pine">{sponsor.name}</div>
                        {sponsor.package && (
                          <div className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">
                            {sponsor.package}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {event.gallery_image_urls && event.gallery_image_urls.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-pine">
                  Photo <em className="italic text-terra">Gallery</em>
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {event.gallery_image_urls.map((url: string, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`${event.title} photo ${i + 1}`}
                      className="aspect-square rounded-lg object-cover"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FAQs */}
            {event.faqs && event.faqs.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl text-pine">
                  Frequently Asked <em className="italic text-terra">Questions</em>
                </h2>
                <div className="space-y-3">
                  {event.faqs.map((faq: { question: string; answer: string }, i: number) => (
                    <details key={i} className="group rounded-lg border border-pine/10 bg-white p-4">
                      <summary className="cursor-pointer list-none font-display text-base text-pine">
                        <span className="mr-2 inline-block text-gold transition-transform group-open:rotate-90">
                          ›
                        </span>
                        {faq.question}
                      </summary>
                      <p className="mt-2 pl-5 text-sm leading-relaxed text-muted">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: Tickets + Organizer */}
          <aside className="space-y-6">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-xl border border-pine/10 bg-white p-5">
                <h3 className="mb-4 font-display text-lg text-pine">Tickets</h3>
                {tickets.filter((t) => t.status !== "hidden").length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} eventSlug={event.slug} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Tickets aren&apos;t available yet — check back soon.</p>
                )}
              </div>

              <div className="rounded-xl border border-pine/10 bg-white p-5">
                <h3 className="mb-2 font-display text-lg text-pine">Organizer</h3>
                <p className="text-sm text-ink/80">{event.organizer_name}</p>
                {event.organizer_contact && (
                  <a
                    href={`mailto:${event.organizer_contact}`}
                    className="mt-2 inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-terra hover:text-terra/70"
                  >
                    {event.organizer_contact}
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
