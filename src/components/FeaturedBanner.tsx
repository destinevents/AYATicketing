import Link from "next/link";
import type { EventRecord, EventTicketRecord } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";

interface FeaturedBannerProps {
  event: EventRecord;
  tickets?: EventTicketRecord[];
}

export function FeaturedBanner({ event, tickets = [] }: FeaturedBannerProps) {
  const lowestPrice = tickets.length
    ? Math.min(...tickets.filter((t) => t.status !== "hidden").map((t) => t.price))
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-pine-deep">
      {/* watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 select-none whitespace-nowrap font-display text-[14rem] italic leading-none text-white/[0.03]"
      >
        AYA
      </div>

      <div className="relative z-10 grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
        <div>
          <div className="mb-4 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold-light">
            <span className="h-px w-6 bg-gold" />
            Featured Event
          </div>
          <span className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-gold-light">
            {CATEGORY_LABELS[event.category]}
          </span>
          <h2 className="mb-3 font-display text-3xl font-light leading-tight text-fog md:text-5xl">
            {event.title}
          </h2>
          {event.subtitle && (
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-fog/60 md:text-base">
              {event.subtitle}
            </p>
          )}
          {(event as any).coming_soon ? (
            <div className="mb-6 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-gold-light">
                Coming Soon — watch for this space
              </span>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fog/70">
                <span className="flex items-center gap-2">
                  📅 {formatDate(event.start_date, { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-2">🕐 {formatTime(event.start_date)}</span>
                <span className="flex items-center gap-2">📍 {event.venue_name ?? "Venue TBA"}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/events/${event.slug}`}
                  className="rounded-sm bg-gold px-7 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light"
                >
                  View Details
                </Link>
                <Link
                  href={`/events/${event.slug}/register`}
                  className="rounded-sm border border-fog/25 px-7 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-fog/75 transition-colors hover:border-fog/60 hover:text-fog"
                >
                  Get Tickets {lowestPrice !== null && `· ${lowestPrice === 0 ? "Free" : `from ${formatCurrency(lowestPrice)}`}`}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
