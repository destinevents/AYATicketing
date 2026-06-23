import Link from "next/link";
import type { EventRecord, EventTicketRecord } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatDateShort, getMonthAbbrev, getDay, formatCurrency } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  "sip-and-scale": "☕",
  rebloom: "🌸",
  "founder-session": "💡",
  workshop: "🛠️",
  "partner-event": "🤝",
  other: "✦",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "sip-and-scale": "from-[#1D2A1D] to-[#3A6A3A]",
  rebloom: "from-[#3A2228] to-[#8B5A5A]",
  "founder-session": "from-[#1D2A3A] to-[#2D5A8E]",
  workshop: "from-[#2E3A1A] to-[#7A9B3A]",
  "partner-event": "from-[#2A1D38] to-[#6B4A8E]",
  other: "from-[#2B3228] to-[#4E5C49]",
};

interface EventCardProps {
  event: EventRecord;
  tickets?: EventTicketRecord[];
}

export function EventCard({ event, tickets = [] }: EventCardProps) {
  const lowestPrice = tickets.length
    ? Math.min(...tickets.filter((t) => t.status !== "hidden").map((t) => t.price))
    : null;

  const gradient = CATEGORY_GRADIENTS[event.category] ?? CATEGORY_GRADIENTS.other;
  const icon = CATEGORY_ICONS[event.category] ?? "✦";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block overflow-hidden rounded-xl border border-pine/10 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-pine/10"
    >
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${gradient} text-3xl`}>
        {icon}
        <div className="absolute right-3 top-3 rounded-md bg-gold px-2.5 py-1.5 text-center text-pine-deep">
          <div className="font-display text-lg leading-none">{getDay(event.start_date)}</div>
          <div className="font-mono text-[0.5rem] uppercase tracking-[0.14em] leading-none">
            {getMonthAbbrev(event.start_date)}
          </div>
        </div>
      </div>
      <div className="p-5">
        <span className="mb-2 inline-block rounded-full bg-gold/15 px-2.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-terra">
          {CATEGORY_LABELS[event.category]}
        </span>
        <h3 className="mb-1.5 font-display text-lg leading-tight text-pine">{event.title}</h3>
        {event.subtitle && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted">{event.subtitle}</p>
        )}
        {(event as any).coming_soon ? (
          <div className="mt-3 flex items-center gap-2 border-t border-pine/10 pt-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-terra">
              Coming Soon — watch for this space
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-t border-pine/10 pt-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                📍 {event.venue_name ?? "TBA"}
              </span>
              {lowestPrice !== null && (
                <span className="font-mono font-medium text-pine">
                  {lowestPrice === 0 ? "Free" : `From ${formatCurrency(lowestPrice)}`}
                </span>
              )}
            </div>
            <div className="mt-4">
              <span className="block w-full rounded-sm bg-gold py-2.5 text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-pine-deep transition-colors group-hover:bg-gold-light">
                Register Now →
              </span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-pine/10 bg-white">
      <div className="h-32 animate-pulse bg-pine/5" />
      <div className="space-y-2 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-pine/10" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-pine/10" />
        <div className="h-3 w-full animate-pulse rounded bg-pine/10" />
      </div>
    </div>
  );
}

export { formatDateShort };
