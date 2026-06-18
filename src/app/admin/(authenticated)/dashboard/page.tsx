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
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("start_date", new Date().toISOString()),
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed"),
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

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-pine">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">AYA Events Hub overview</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
        >
          + New Event
        </Link>
      </div>

      {/* Metrics grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Total Events" value={totalEvents ?? 0} icon="📅" />
        <MetricCard label="Upcoming Events" value={upcomingEvents ?? 0} icon="🌱" />
        <MetricCard label="Tickets Sold" value={confirmedRegistrations ?? 0} icon="🎟️" />
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon="💰" />
        <MetricCard label="Total Registrations" value={totalRegistrations ?? 0} icon="📝" />
        <MetricCard label="Community Attendees" value={totalAttendees ?? 0} icon="👥" />
        <MetricCard label="Sponsors" value={totalSponsors ?? 0} icon="🤝" />
        <MetricCard
          label="Avg. Revenue / Event"
          value={formatCurrency(totalEvents ? totalRevenue / totalEvents : 0)}
          icon="📈"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming events */}
        <div className="rounded-xl border border-pine/10 bg-white p-5">
          <h2 className="mb-4 font-display text-lg text-pine">Upcoming Events</h2>
          {upcoming && upcoming.length > 0 ? (
            <div className="space-y-2">
              {upcoming.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}/edit`}
                  className="flex items-center justify-between rounded-lg border border-pine/5 px-4 py-3 transition-colors hover:border-gold/30 hover:bg-gold/5"
                >
                  <div>
                    <div className="font-display text-sm text-pine">{event.title}</div>
                    <div className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
                      {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]} ·{" "}
                      {formatDate(event.start_date, { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] ${
                      event.status === "published"
                        ? "bg-moss/15 text-moss"
                        : "bg-pine/5 text-muted"
                    }`}
                  >
                    {event.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No upcoming events yet.</p>
          )}
        </div>

        {/* Revenue by event */}
        <div className="rounded-xl border border-pine/10 bg-white p-5">
          <h2 className="mb-4 font-display text-lg text-pine">Revenue by Event</h2>
          {revenueSummary && revenueSummary.length > 0 ? (
            <div className="space-y-2">
              {revenueSummary.map((row) => (
                <div
                  key={row.event_id}
                  className="flex items-center justify-between rounded-lg border border-pine/5 px-4 py-3"
                >
                  <div>
                    <div className="font-display text-sm text-pine">{row.title}</div>
                    <div className="font-mono text-[0.6rem] text-muted">
                      {row.confirmed_registrations} confirmed · {row.checked_in_count} checked in
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-sm text-pine">{formatCurrency(row.revenue_paid)}</div>
                    {row.revenue_pending > 0 && (
                      <div className="font-mono text-[0.55rem] text-gold">
                        +{formatCurrency(row.revenue_pending)} pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No revenue data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
