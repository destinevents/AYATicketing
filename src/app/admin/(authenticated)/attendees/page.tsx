import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ARCHETYPE_META, type CommunityArchetype } from "@/lib/types";

export const revalidate = 0;

const ARCHETYPE_ORDER: CommunityArchetype[] = ["founder", "creative", "community_builder", "enabler"];

interface AttendeesPageProps {
  searchParams: Promise<{ archetype?: string; event?: string }>;
}

export default async function AttendeesPage({ searchParams }: AttendeesPageProps) {
  const { archetype: archetypeFilter, event: eventFilter } = await searchParams;
  const supabase = await createClient();

  // Fetch all events for the filter pills
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("start_date", { ascending: false });

  // If filtering by event, get the attendee IDs who registered for that event
  let filteredAttendeeIds: string[] | null = null;
  if (eventFilter) {
    const { data: regs } = await supabase
      .from("registrations")
      .select("attendee_id")
      .eq("event_id", eventFilter)
      .not("attendee_id", "is", null);
    filteredAttendeeIds = (regs ?? []).map((r) => r.attendee_id as string);
  }

  let query = supabase
    .from("attendees")
    .select("*, registrations(id, events(id, title), status)")
    .order("first_seen_at", { ascending: false });

  if (archetypeFilter) {
    query = query.eq("archetype", archetypeFilter);
  }
  if (filteredAttendeeIds !== null) {
    query = filteredAttendeeIds.length > 0
      ? query.in("id", filteredAttendeeIds)
      : query.eq("id", "00000000-0000-0000-0000-000000000000"); // no results
  }

  const { data: attendees } = await query;

  // Full counts (unfiltered) for archetype pills
  const { data: allAttendees } = await supabase
    .from("attendees")
    .select("archetype, newsletter_opt_in, networking_opt_in");

  const totalNewsletter = allAttendees?.filter((a) => a.newsletter_opt_in).length ?? 0;
  const totalNetworking = allAttendees?.filter((a) => a.networking_opt_in).length ?? 0;
  const archetypeCounts = ARCHETYPE_ORDER.reduce<Record<string, number>>((acc, key) => {
    acc[key] = allAttendees?.filter((a) => a.archetype === key).length ?? 0;
    return acc;
  }, {});

  // Build href helper that merges filters
  function filterHref(params: { archetype?: string | null; event?: string | null }) {
    const p = new URLSearchParams();
    const arch = params.archetype ?? archetypeFilter;
    const evt = params.event ?? eventFilter;
    if (arch) p.set("archetype", arch);
    if (evt) p.set("event", evt);
    return `/admin/attendees${p.toString() ? `?${p}` : ""}`;
  }

  const selectedEvent = events?.find((e) => e.id === eventFilter);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:items-center">
        <div>
          <h1 className="font-display text-3xl text-pine">Community CRM</h1>
          <p className="mt-1 text-sm text-muted">
            {allAttendees?.length ?? 0} unique attendees · {totalNewsletter} newsletter opt-ins · {totalNetworking} networking opt-ins
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/csv?type=attendees"
            className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
          >
            Export CRM (CSV)
          </a>
          <a
            href="/api/export/csv?type=registrations"
            className="rounded-sm border border-pine/15 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-pine transition-colors hover:bg-pine/5"
          >
            Export Registrations (CSV)
          </a>
        </div>
      </div>

      {/* Event filter */}
      <div className="mb-4">
        <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">Filter by event</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={filterHref({ event: null })}
            className={`rounded-full border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors ${
              !eventFilter ? "border-pine bg-pine text-fog" : "border-pine/15 text-muted hover:border-pine/30"
            }`}
          >
            All events
          </Link>
          {events?.map((evt) => (
            <Link
              key={evt.id}
              href={filterHref({ event: evt.id })}
              className={`rounded-full border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors ${
                eventFilter === evt.id
                  ? "border-gold bg-gold/15 text-terra"
                  : "border-pine/15 text-muted hover:border-gold/30"
              }`}
            >
              {evt.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Archetype filter */}
      <div className="mb-6">
        <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">Filter by archetype</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={filterHref({ archetype: null })}
            className={`rounded-full border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors ${
              !archetypeFilter ? "border-pine bg-pine text-fog" : "border-pine/15 text-muted hover:border-pine/30"
            }`}
          >
            All ({allAttendees?.length ?? 0})
          </Link>
          {ARCHETYPE_ORDER.map((key) => {
            const meta = ARCHETYPE_META[key];
            const active = archetypeFilter === key;
            return (
              <Link
                key={key}
                href={filterHref({ archetype: key })}
                className={`rounded-full border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors ${
                  active ? "border-gold bg-gold/15 text-terra" : "border-pine/15 text-muted hover:border-gold/30"
                }`}
                title={meta.tagline}
              >
                {meta.emoji} {meta.label} ({archetypeCounts[key] ?? 0})
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active filters summary */}
      {(eventFilter || archetypeFilter) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-gold/5 px-4 py-2 text-xs text-pine/70">
          <span>Showing:</span>
          {selectedEvent && <span className="font-medium">{selectedEvent.title}</span>}
          {selectedEvent && archetypeFilter && <span>·</span>}
          {archetypeFilter && <span className="font-medium capitalize">{archetypeFilter.replace("_", " ")}</span>}
          <span>— {attendees?.length ?? 0} attendee{attendees?.length !== 1 ? "s" : ""}</span>
          <Link href="/admin/attendees" className="ml-auto text-terra hover:underline">Clear filters</Link>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-pine/10 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-pine/10 bg-pine/[0.02] text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Industry</th>
              <th className="px-5 py-3">Archetype</th>
              <th className="px-5 py-3">Events Attended</th>
              <th className="px-5 py-3">Newsletter</th>
              <th className="px-5 py-3">Networking</th>
              <th className="px-5 py-3">First Seen</th>
            </tr>
          </thead>
          <tbody>
            {attendees?.map((attendee) => {
              const meta = attendee.archetype ? ARCHETYPE_META[attendee.archetype as CommunityArchetype] : null;
              return (
                <tr key={attendee.id} className="border-b border-pine/5 last:border-0">
                  <td className="px-5 py-3 font-display text-pine">{attendee.full_name}</td>
                  <td className="px-5 py-3 text-muted">{attendee.email}</td>
                  <td className="px-5 py-3 text-muted">{attendee.mobile_number ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{attendee.business_name ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{attendee.industry ?? "—"}</td>
                  <td className="px-5 py-3">
                    {meta ? (
                      <span className="rounded-full bg-gold/10 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-terra" title={meta.tagline}>
                        {meta.emoji} {meta.code}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {attendee.registrations?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {attendee.registrations.map((r: { id: string; events?: { title?: string } | null; status: string }) => (
                          <span key={r.id} className="rounded-full bg-pine/5 px-2 py-0.5 text-[0.65rem]">
                            {r.events?.title ?? "Event"}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {attendee.newsletter_opt_in ? <span className="text-moss">✓</span> : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    {attendee.networking_opt_in ? <span className="text-moss">✓</span> : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(attendee.first_seen_at, { month: "short", day: "numeric", year: "numeric" })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!attendees || attendees.length === 0) && (
          <div className="py-12 text-center text-sm text-muted">
            {eventFilter || archetypeFilter
              ? "No attendees match the selected filters."
              : "No attendees yet — they'll appear here automatically after registrations."}
          </div>
        )}
      </div>
    </div>
  );
}
