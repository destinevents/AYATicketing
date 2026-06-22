import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface PaymentSuccessPageProps {
  searchParams: Promise<{ registration_id?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const { registration_id } = await searchParams;

  let registration = null;
  if (registration_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("registrations")
      .select("*, events(*), event_tickets(*)")
      .eq("id", registration_id)
      .single();
    registration = data;
  }

  const event = registration?.events;
  const ticket = registration?.event_tickets;

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] bg-fog-warm px-6 py-12 md:py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl">🌿</div>
            <h1 className="font-display text-3xl text-pine">Payment Received!</h1>
            <p className="mt-2 text-sm text-muted">
              Your seat is confirmed. Check your email for your QR ticket.
            </p>
          </div>

          {registration && (
            <div className="mb-6 rounded-xl border border-pine/10 bg-white p-5">
              <h2 className="mb-1 font-display text-xl text-pine">{registration.full_name}</h2>
              {event && (
                <div className="mt-3 space-y-1.5 text-sm text-ink/80">
                  <div className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-terra mb-2">
                    {event.title}
                  </div>
                  <div>📅 {formatDate(event.start_date)}</div>
                  <div>🕐 {formatTime(event.start_date)}{event.end_date && ` – ${formatTime(event.end_date)}`}</div>
                  <div>📍 {event.venue_name ?? "Venue TBA"}</div>
                  {ticket && (
                    <div>🎟️ {ticket.name} · {formatCurrency(registration.final_amount ?? ticket.price ?? 0)}</div>
                  )}
                </div>
              )}
              <div className="mt-4 inline-block rounded-full bg-moss/15 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-moss">
                Confirmed
              </div>
            </div>
          )}

          <div className="mb-6 rounded-xl border border-pine/10 bg-pine/[0.03] p-5 text-sm text-ink/80">
            <p className="mb-1 font-medium text-pine">What happens next?</p>
            <ul className="mt-2 space-y-1.5">
              <li>✓ A confirmation email with your QR ticket is on its way — it may take a few minutes.</li>
              <li>✓ Show your QR code at the venue entrance to check in.</li>
              {registration_id && (
                <li>
                  ✓ You can always view your ticket on your{" "}
                  <Link href={`/events/confirmation/${registration_id}`} className="text-terra underline">
                    confirmation page
                  </Link>
                  .
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {registration_id && (
              <Link
                href={`/events/confirmation/${registration_id}`}
                className="flex-1 rounded-sm bg-pine px-6 py-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-fog transition-colors hover:bg-pine-mid"
              >
                View My Ticket
              </Link>
            )}
            <Link
              href="/events"
              className="flex-1 rounded-sm border border-pine/15 px-6 py-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-pine transition-colors hover:bg-pine/5"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
