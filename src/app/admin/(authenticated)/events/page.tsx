import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DuplicateEventButton, DeleteEventButton } from "./EventActions";

export const revalidate = 0;

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*, event_tickets(*), registrations(id)")
    .order("start_date", { ascending: false });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8 sm:flex-nowrap sm:items-center">
        <div>
          <h1 className="font-display text-3xl text-pine">Events</h1>
          <p className="mt-1 text-sm text-muted">Create, edit, duplicate, and manage all AYA events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
        >
          + New Event
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-pine/10 bg-white">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-pine/10 bg-pine/[0.02] text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Tickets</th>
              <th className="px-5 py-3">Registrations</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((event) => {
              const tickets = event.event_tickets ?? [];
              const lowest = tickets.length
                ? Math.min(...tickets.map((t: { price: number }) => t.price))
                : null;
              return (
                <tr key={event.id} className="border-b border-pine/5 last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-display text-pine">{event.title}</div>
                    <div className="font-mono text-[0.6rem] text-muted">/{event.slug}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-gold/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra">
                      {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(event.start_date, { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] ${
                        event.status === "published"
                          ? "bg-moss/15 text-moss"
                          : event.status === "draft"
                          ? "bg-pine/5 text-muted"
                          : "bg-terra/10 text-terra"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {tickets.length} tier{tickets.length !== 1 ? "s" : ""}
                    {lowest !== null && (
                      <span className="ml-1 text-xs">({lowest === 0 ? "Free" : `from ${formatCurrency(lowest)}`})</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted">{event.registrations?.length ?? 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/events/${event.slug}`}
                        target="_blank"
                        className="rounded-sm border border-pine/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted transition-colors hover:border-pine/30 hover:text-pine"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/registrations`}
                        className="rounded-sm border border-pine/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted transition-colors hover:border-pine/30 hover:text-pine"
                      >
                        Registrations
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="rounded-sm border border-pine/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted transition-colors hover:border-pine/30 hover:text-pine"
                      >
                        Edit
                      </Link>
                      <DuplicateEventButton eventId={event.id} />
                      <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!events || events.length === 0) && (
          <div className="py-12 text-center text-sm text-muted">No events yet — create your first one!</div>
        )}
      </div>
    </div>
  );
}
