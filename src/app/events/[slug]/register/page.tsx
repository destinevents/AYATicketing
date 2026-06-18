import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegistrationForm } from "@/components/RegistrationForm";
import type { EventTicketRecord } from "@/lib/types";
import { TICKET_TIER_LABELS } from "@/lib/types";
import { formatCurrency, getTicketAvailability } from "@/lib/utils";

interface RegisterPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ticket?: string }>;
}

export default async function RegisterPage({ params, searchParams }: RegisterPageProps) {
  const { slug } = await params;
  const { ticket: ticketId } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, slug, title, event_tickets(*)")
    .eq("slug", slug)
    .in("status", ["published", "completed"])
    .single();

  if (!event) notFound();

  const tickets = ((event.event_tickets ?? []) as EventTicketRecord[])
    .filter((t) => t.status !== "hidden")
    .sort((a, b) => a.sort_order - b.sort_order);

  const selectedTicket = ticketId ? tickets.find((t) => t.id === ticketId) : undefined;

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] bg-fog-warm px-6 py-12 md:py-16">
        <div className="mx-auto max-w-lg">
          <Link
            href={`/events/${event.slug}`}
            className="mb-6 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted transition-colors hover:text-pine"
          >
            ← Back to {event.title}
          </Link>

          <div className="mb-2 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold">
            <span className="h-px w-6 bg-gold" />
            Registration
          </div>
          <h1 className="mb-6 font-display text-3xl text-pine">{event.title}</h1>

          {selectedTicket ? (
            <RegistrationForm eventId={event.id} eventSlug={event.slug} ticket={selectedTicket} />
          ) : (
            <>
              <p className="mb-5 text-sm text-muted">Choose a ticket to continue:</p>
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const avail = getTicketAvailability(ticket);
                  return (
                    <Link
                      key={ticket.id}
                      href={avail.isOnSale ? `/events/${event.slug}/register?ticket=${ticket.id}` : "#"}
                      className={`flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${
                        avail.isOnSale
                          ? "border-pine/10 bg-white hover:border-gold/40"
                          : "pointer-events-none border-pine/5 bg-pine/[0.02] opacity-60"
                      }`}
                    >
                      <div>
                        <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-terra">
                          {TICKET_TIER_LABELS[ticket.tier]}
                        </span>
                        <div className="font-display text-base text-pine">{ticket.name}</div>
                        <div className="font-mono text-[0.6rem] text-muted">{avail.statusLabel}</div>
                      </div>
                      <span className="font-display text-lg text-pine">{formatCurrency(ticket.price)}</span>
                    </Link>
                  );
                })}
                {tickets.length === 0 && (
                  <div className="rounded-lg border border-dashed border-pine/15 bg-white/50 py-10 text-center text-sm text-muted">
                    No tickets are available for this event yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
