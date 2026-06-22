import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/admin/MetricCard";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalEvents },
    { count: upcomingEvents },
    { count: totalRegistrations },
    { count: confirmedRegistrations },
    { count: totalAttendees },
    { count: totalSponsors },
    { data: payments },
    { data: revenueSummary },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("start_date", new Date().toISOString()),
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("attendees").select("*", { count: "exact", head: true }),
    supabase.from("sponsors").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount, status").eq("status", "paid"),
    supabase.from("event_revenue_summary").select("*"),
  ]);

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  const { data: upcoming } = await supabase
    .from("events")
    .select("*")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(5);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:items-center">
        <div>
          <p className="mb-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-pine/40">{dateLabel}</p>
          <h1 className="font-display text-3xl text-pine">{greeting}, Jenn 👋</h1>
          <p className="mt-1 text-sm text-pine/50">Here's what's happening with AYA Events Hub.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
        >
          + New Event
        </Link>
      </div>

      {/* Metrics grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Total Events"          value={totalEvents ?? 0}                                              icon="📅" accent="pine" />
        <MetricCard label="Upcoming Events"        value={upcomingEvents ?? 0}                                           icon="🌱" accent="moss" />
        <MetricCard label="Tickets Sold"           value={confirmedRegistrations ?? 0}                                   icon="🎟️" accent="terra" />
        <MetricCard label="Total Revenue"          value={formatCurrency(totalRevenue)}                                  icon="💰" accent="gold" />
        <MetricCard label="Total Registrations"   value={totalRegistrations ?? 0}                                       icon="📝" accent="lavender" />
        <MetricCard label="Community Attendees"   value={totalAttendees ?? 0}                                           icon="👥" accent="sky" />
        <MetricCard label="Sponsors"              value={totalSponsors ?? 0}                                            icon="🤝" accent="gold" />
        <MetricCard label="Avg. Revenue / Event"  value={formatCurrency(totalEvents ? totalRevenue / totalEvents : 0)}  icon="📈" accent="pine" />
      </div>

      {/* Bottom panels */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Upcoming events */}
        <div className="rounded-xl border border-pine/10 bg-white">
          <div className="flex items-center justify-between border-b border-pine/5 px-5 py-4">
            <h2 className="font-display text-base text-pine">Upcoming Events</h2>
            <Link href="/admin/events" className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-pine/40 transition-colors hover:text-pine">
              View all →
            </Link>
          </div>
          <div className="p-3">
            {upcoming && upcoming.length > 0 ? (
              <div className="space-y-1">
                {upcoming.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}/edit`}
                    className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-pine/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-pine/5 font-mono text-[0.55rem] font-medium uppercase text-pine/50">
                        {formatDate(event.start_date, { month: "short" })}
                        <br />
                        {formatDate(event.start_date, { day: "numeric" })}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-pine">{event.title}</div>
                        <div className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-pine/40">
                          {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]}
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.1em] ${
                      event.status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-pine/5 text-pine/40"
                    }`}>
                      {event.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm text-pine/40">No upcoming events yet.</div>
            )}
          </div>
        </div>

        {/* Revenue by event */}
        <div className="rounded-xl border border-pine/10 bg-white">
          <div className="flex items-center justify-between border-b border-pine/5 px-5 py-4">
            <h2 className="font-display text-base text-pine">Revenue by Event</h2>
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-pine/40">Confirmed paid</span>
          </div>
          <div className="p-3">
            {revenueSummary && revenueSummary.length > 0 ? (
              <div className="space-y-1">
                {revenueSummary.map((row) => (
                  <div key={row.event_id} className="flex items-center justify-between rounded-lg px-3 py-3">
                    <div>
                      <div className="text-sm font-medium text-pine">{row.title}</div>
                      <div className="font-mono text-[0.58rem] text-pine/40">
                        {row.confirmed_registrations} confirmed · {row.checked_in_count} checked in
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-sm text-pine">{formatCurrency(row.revenue_paid)}</div>
                      {row.revenue_pending > 0 && (
                        <div className="font-mono text-[0.52rem] text-amber-500">
                          +{formatCurrency(row.revenue_pending)} pending
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm text-pine/40">No revenue data yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
