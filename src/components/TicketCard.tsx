import Link from "next/link";
import type { EventTicketRecord } from "@/lib/types";
import { TICKET_TIER_LABELS } from "@/lib/types";
import { formatCurrency, getTicketAvailability } from "@/lib/utils";

interface TicketCardProps {
  ticket: EventTicketRecord;
  eventSlug: string;
}

export function TicketCard({ ticket, eventSlug }: TicketCardProps) {
  if (ticket.status === "hidden") return null;

  const avail = getTicketAvailability(ticket);
  const canRegister = avail.isOnSale;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${
        canRegister
          ? "border-pine/10 bg-white hover:border-gold/40"
          : "border-pine/5 bg-pine/[0.02] opacity-70"
      }`}
    >
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-terra">
            {TICKET_TIER_LABELS[ticket.tier]}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.1em] ${
              avail.isOnSale
                ? "bg-moss/15 text-moss"
                : avail.isSoldOut
                ? "bg-terra/10 text-terra"
                : "bg-pine/5 text-muted"
            }`}
          >
            {avail.statusLabel}
          </span>
        </div>
        <h4 className="font-display text-base text-pine">{ticket.name}</h4>
        {ticket.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{ticket.description}</p>
        )}
        {!avail.isUnlimited && avail.remaining !== null && avail.isOnSale && (
          <p className="mt-1 font-mono text-[0.6rem] text-muted">
            {avail.remaining} {avail.remaining === 1 ? "slot" : "slots"} remaining
          </p>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <span className="font-display text-lg text-pine">{formatCurrency(ticket.price)}</span>
        {canRegister ? (
          <Link
            href={`/events/${eventSlug}/register?ticket=${ticket.id}`}
            className="whitespace-nowrap rounded-sm bg-pine px-4 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fog transition-colors hover:bg-pine-mid"
          >
            Select
          </Link>
        ) : (
          <span className="whitespace-nowrap rounded-sm border border-pine/10 px-4 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted">
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
}
