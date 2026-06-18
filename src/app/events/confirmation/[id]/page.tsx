import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { generateQrDataUrl } from "@/lib/qrcode";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: registration } = await supabase
    .from("registrations")
    .select("*, events(*), event_tickets(*), payments(*)")
    .eq("id", id)
    .single();

  if (!registration) notFound();

  const event = registration.events;
  const ticket = registration.event_tickets;
  const payment = registration.payments?.[0];

  const isPaid = payment?.status === "paid";
  const isFree = Number(ticket?.price ?? 0) === 0;

  const paymongoLink = process.env.NEXT_PUBLIC_PAYMONGO_PAYMENT_LINK || null;

  const qrDataUrl = registration.qr_code ? await generateQrDataUrl(registration.qr_code) : null;

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] bg-fog-warm px-6 py-12 md:py-16">
        <div className="mx-auto max-w-lg">
          {/* Status banner */}
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl">{isPaid || isFree ? "🌿" : "📩"}</div>
            <h1 className="font-display text-3xl text-pine">
              {isPaid || isFree ? "You're all set!" : "Almost there!"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {isPaid || isFree
                ? "Your registration is confirmed. Save your QR ticket below."
                : "Your registration is recorded — complete payment to confirm your slot."}
            </p>
          </div>

          {/* QR Ticket */}
          {qrDataUrl && (
            <div className="mb-6 rounded-xl border border-pine/10 bg-white p-6 text-center">
              <div className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-terra">
                {event?.title}
              </div>
              <h2 className="mb-4 font-display text-xl text-pine">{registration.full_name}</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR Ticket" className="mx-auto h-48 w-48 rounded-lg" />
              <p className="mt-3 font-mono text-[0.6rem] text-muted">{registration.qr_code}</p>
              <p
                className={`mt-3 inline-block rounded-full px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] ${
                  isPaid || isFree ? "bg-moss/15 text-moss" : "bg-gold/15 text-terra"
                }`}
              >
                {isPaid || isFree ? "Confirmed" : "Pending Payment"}
              </p>
            </div>
          )}

          {/* Event details */}
          {event && (
            <div className="mb-6 rounded-xl border border-pine/10 bg-white p-5">
              <h3 className="mb-3 font-display text-lg text-pine">Event Details</h3>
              <div className="space-y-1.5 text-sm text-ink/80">
                <div>📅 {formatDate(event.start_date)}</div>
                <div>🕐 {formatTime(event.start_date)}{event.end_date && ` – ${formatTime(event.end_date)}`}</div>
                <div>📍 {event.venue_name ?? "Venue TBA"}</div>
                <div className="flex items-baseline gap-2">
                  🎟️ {ticket?.name}
                  {registration.discount_amount > 0 ? (
                    <>
                      <span className="text-xs text-muted line-through">{formatCurrency(ticket?.price ?? 0)}</span>
                      <span className="font-medium text-moss">{formatCurrency(registration.final_amount ?? 0)}</span>
                      <span className="rounded-full bg-moss/10 px-2 py-0.5 font-mono text-[0.55rem] text-moss">
                        {formatCurrency(registration.discount_amount)} saved
                      </span>
                    </>
                  ) : (
                    <span>· {formatCurrency(ticket?.price ?? 0)}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment instructions */}
          {!isPaid && !isFree && (
            <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 p-5">
              <h3 className="mb-2 font-display text-lg text-pine">Complete Your Payment</h3>
              <p className="mb-4 text-sm text-ink/80">
                Pay <strong>{formatCurrency(registration.final_amount ?? payment?.amount ?? 0)}</strong> to confirm your slot. The fastest way is
                via our PayMongo checkout (card, GCash, Maya, or bank transfer all accepted there):
              </p>

              {paymongoLink && (
                <a
                  href={paymongoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-4 block w-full rounded-sm bg-gold px-6 py-3.5 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light"
                >
                  Pay Now via PayMongo →
                </a>
              )}

              <details className="group">
                <summary className="cursor-pointer list-none font-mono text-[0.6rem] uppercase tracking-[0.12em] text-terra">
                  <span className="mr-1 inline-block transition-transform group-open:rotate-90">›</span>
                  Or pay manually via GCash / Maya / Bank Transfer
                </summary>
                <ul className="mt-3 space-y-2 text-sm text-ink/80">
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-xs text-terra">GCash</span> — send to{" "}
                    <span className="font-medium">0917-XXX-XXXX</span> (AYA Community / Destine Events)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-xs text-terra">Maya</span> — send to{" "}
                    <span className="font-medium">0917-XXX-XXXX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-xs text-terra">Bank Transfer</span> — BPI Acct.{" "}
                    <span className="font-medium">XXXX-XXXX-XX</span>
                  </li>
                </ul>
              </details>

              <p className="mt-3 text-xs text-muted">
                After paying, send your proof of payment + reference number to{" "}
                <a href={`mailto:${event?.organizer_contact ?? "jenncastro@destinevents.biz"}`} className="text-terra underline">
                  {event?.organizer_contact ?? "jenncastro@destinevents.biz"}
                </a>{" "}
                — include your name and registration ID: <span className="font-mono">{registration.id}</span>.
              </p>
              <p className="mt-2 text-xs text-muted">
                <em>
                  Once payment is verified, our team will mark your registration as Paid and your QR ticket above
                  will be confirmed automatically.
                </em>
              </p>
            </div>
          )}

          {/* Community confirmation */}
          <div className="mb-6 rounded-xl border border-pine/10 bg-pine/[0.03] p-5 text-sm text-ink/80">
            {registration.newsletter_opt_in && (
              <p className="mb-1">✓ You&apos;re subscribed to the AYA Community Newsletter.</p>
            )}
            {registration.networking_opt_in && (
              <p>✓ You&apos;ll be included in future networking & business opportunities.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/events"
              className="flex-1 rounded-sm border border-pine/15 px-6 py-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-pine transition-colors hover:bg-pine/5"
            >
              Browse More Events
            </Link>
            {event && (
              <Link
                href={`/events/${event.slug}`}
                className="flex-1 rounded-sm bg-pine px-6 py-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-fog transition-colors hover:bg-pine-mid"
              >
                Back to Event
              </Link>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            A confirmation email with your QR ticket has been sent to{" "}
            <span className="font-medium">{registration.email}</span>.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
