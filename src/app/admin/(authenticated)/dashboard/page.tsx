import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

/* ─── Mini chart components (pure SVG, server-renderable) ─── */

function BarChart({
  data,
  total,
  sold,
}: {
  data: { label: string; count: number }[];
  total: number;
  sold: number;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const maxIdx = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);
  const yTicks = [max, Math.round((max * 2) / 3), Math.round(max / 3), 0];

  return (
    <div
      style={{
        background: "#1D2219",
        border: "1px solid rgba(240,237,230,0.07)",
        borderRadius: "14px",
        padding: "26px 28px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-fraunces), Fraunces, serif",
          fontSize: "19px",
          color: "#F0EDE6",
          fontWeight: 400,
          margin: "0 0 4px",
        }}
      >
        Registrations this week
      </p>
      <p
        style={{
          fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
          fontSize: "12.5px",
          color: "rgba(240,237,230,0.4)",
          margin: "0 0 22px",
        }}
      >
        {total} total · {sold} tickets sold
      </p>

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        {/* Y-axis labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "142px",
            flexShrink: 0,
            width: "24px",
          }}
        >
          {yTicks.map((v) => (
            <span
              key={v}
              style={{
                fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                fontSize: "11px",
                color: "rgba(240,237,230,0.35)",
                textAlign: "right",
                display: "block",
                lineHeight: 1,
              }}
            >
              {v}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ flex: 1 }}>
          <div style={{ position: "relative", height: "142px" }}>
            {/* Grid lines */}
            {[0, 33, 66, 100].map((pct) => (
              <div
                key={pct}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${pct}%`,
                  height: "1px",
                  background: "rgba(240,237,230,0.08)",
                }}
              />
            ))}
            {/* Bars */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: "100%",
                gap: "18px",
              }}
            >
              {data.map((d, i) => {
                const pct = d.count > 0 ? Math.max((d.count / max) * 100, 3) : 0;
                const isPeak = i === maxIdx && d.count > 0;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "38px",
                        height: `${pct}%`,
                        background: isPeak ? "#8FB079" : "#6B8A5A",
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day labels */}
          <div style={{ display: "flex", gap: "18px", marginTop: "8px" }}>
            {data.map((d, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                  fontSize: "10.5px",
                  color: "rgba(240,237,230,0.4)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {d.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? value / total : 0;
  const r = 40;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-[130px] flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e0d8" strokeWidth={14} />
      {value > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#3D5A40"
          strokeWidth={14}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={17} fontWeight="600" fill="#1D2219" fontFamily="Georgia, serif">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function FunnelBar({
  label,
  value,
  max,
  color = "pine",
}: {
  label: string;
  value: number;
  max: number;
  color?: "pine" | "gold";
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm text-pine/70">{label}</span>
        <span className="font-mono text-sm font-semibold text-pine">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-pine/10">
        <div
          className={`h-full rounded-full ${color === "gold" ? "bg-amber-400/70" : "bg-pine/70"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    { count: totalEvents },
    { count: upcomingEvents },
    { count: totalRegistrations },
    { count: confirmedRegistrations },
    { count: totalAttendees },
    { count: totalSponsors },
    { count: checkedInCount },
    { data: paidPayments },
    { data: pendingPayments },
    { data: revenueSummary },
    { data: weeklyRegs },
    { count: cancelledThisWeek },
    { count: expiredThisWeek },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("start_date", now.toISOString()),
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("attendees").select("*", { count: "exact", head: true }),
    supabase.from("sponsors").select("*", { count: "exact", head: true }),
    supabase.from("registrations").select("*", { count: "exact", head: true }).eq("checked_in", true),
    supabase.from("payments").select("amount").eq("status", "paid"),
    supabase.from("payments").select("amount").eq("status", "pending"),
    supabase.from("event_revenue_summary").select("*"),
    supabase.from("registrations").select("created_at").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "cancelled").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "expired").gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  const totalRevenue = (paidPayments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = (pendingPayments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const avgRevenue = (totalEvents ?? 0) > 0 ? totalRevenue / (totalEvents ?? 1) : 0;

  // Build last-7-days chart data
  const daySlots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
  const regByDay: Record<string, number> = {};
  (weeklyRegs ?? []).forEach((r) => {
    const day = new Date(r.created_at).toISOString().slice(0, 10);
    regByDay[day] = (regByDay[day] ?? 0) + 1;
  });
  const chartData = daySlots.map(({ key, label }) => ({ label, count: regByDay[key] ?? 0 }));

  return (
    <div className="min-h-screen bg-fog-warm p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-pine">Dashboard</h1>
          <p className="mt-0.5 text-sm text-pine/40">AYA Events Hub overview</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-pine px-5 py-2.5 text-sm font-medium text-fog transition-colors hover:bg-pine-mid"
        >
          <span>□</span> New event
        </Link>
      </div>

      {/* Row 1: bar chart + at a glance */}
      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Bar chart */}
        <BarChart
          data={chartData}
          total={totalRegistrations ?? 0}
          sold={confirmedRegistrations ?? 0}
        />

        {/* At a glance */}
        <div className="rounded-2xl border border-pine/8 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-pine">At a glance</h2>
          <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <div className="font-display text-2xl font-semibold text-pine">{totalEvents ?? 0}</div>
              <div className="text-xs text-pine/40">Events</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-pine">{upcomingEvents ?? 0}</div>
              <div className="text-xs text-pine/40">Upcoming</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-pine">{totalAttendees ?? 0}</div>
              <div className="text-xs text-pine/40">Community</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-pine">{totalSponsors ?? 0}</div>
              <div className="text-xs text-pine/40">Sponsors</div>
            </div>
          </div>
          {((cancelledThisWeek ?? 0) + (expiredThisWeek ?? 0)) > 0 && (
            <div className="mb-4 rounded-lg border border-terra/20 bg-terra/5 px-3 py-2 text-xs text-terra/80">
              <span className="font-medium">{(cancelledThisWeek ?? 0) + (expiredThisWeek ?? 0)}</span> cancelled / expired this week
              {(expiredThisWeek ?? 0) > 0 && (
                <span className="ml-1 text-slate-400">({expiredThisWeek} timed out)</span>
              )}
            </div>
          )}
          <div className="border-t border-pine/8 pt-4">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-xs text-pine/50">Total revenue</span>
              <span className="font-display text-xl font-bold text-pine">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-pine/40">{formatCurrency(avgRevenue)} avg / event</span>
              {totalPending > 0 && (
                <span className="font-mono text-xs font-medium text-amber-500">
                  +{formatCurrency(totalPending)} pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: funnel + donut */}
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        {/* Attendee funnel */}
        <div className="rounded-2xl border border-pine/8 bg-white p-6">
          <h2 className="mb-6 font-display text-lg font-semibold text-pine">Attendee funnel</h2>
          <div className="space-y-5">
            <FunnelBar label="Registrations" value={totalRegistrations ?? 0} max={totalRegistrations ?? 1} color="pine" />
            <FunnelBar label="Tickets sold" value={confirmedRegistrations ?? 0} max={totalRegistrations ?? 1} color="pine" />
            <FunnelBar label="Confirmed" value={confirmedRegistrations ?? 0} max={totalRegistrations ?? 1} color="gold" />
            <FunnelBar label="Checked in" value={checkedInCount ?? 0} max={totalRegistrations ?? 1} color="gold" />
          </div>
        </div>

        {/* Check-in rate */}
        <div className="rounded-2xl border border-pine/8 bg-white p-6">
          <h2 className="mb-6 font-display text-lg font-semibold text-pine">Check-in rate</h2>
          <div className="flex items-center gap-8">
            <DonutChart value={checkedInCount ?? 0} total={confirmedRegistrations ?? 0} />
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-sm bg-pine/75" />
                <div>
                  <div className="text-sm font-medium text-pine">Checked in</div>
                  <div className="text-xs text-pine/40">· {checkedInCount ?? 0}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-sm bg-pine/15" />
                <div>
                  <div className="text-sm font-medium text-pine/50">Awaiting</div>
                  <div className="text-xs text-pine/40">
                    · {Math.max((confirmedRegistrations ?? 0) - (checkedInCount ?? 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Revenue by event */}
      <div className="rounded-2xl border border-pine/8 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-pine">Revenue by event</h2>
          <Link href="/admin/events" className="text-xs text-pine/40 transition-colors hover:text-pine">
            View all
          </Link>
        </div>
        {revenueSummary && revenueSummary.length > 0 ? (
          <div className="divide-y divide-pine/5">
            {revenueSummary.map((row) => (
              <div key={row.event_id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <div className="font-medium text-pine">{row.title}</div>
                  <div className="mt-0.5 text-xs text-pine/40">
                    {row.confirmed_registrations} confirmed · {row.checked_in_count} checked in
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-base font-semibold text-pine">
                    {formatCurrency(row.revenue_paid)}
                  </div>
                  {row.revenue_pending > 0 && (
                    <div className="text-xs font-medium text-amber-500">
                      +{formatCurrency(row.revenue_pending)} pending
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-pine/40">No revenue data yet.</p>
        )}
      </div>
    </div>
  );
}
