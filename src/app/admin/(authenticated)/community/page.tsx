import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

const JOIN_TYPE_LABELS: Record<string, string> = {
  creator: "Creator",
  sme: "SME",
  community: "Community",
};

export default async function AdminCommunityPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("community_leads")
    .select("*")
    .order("joined_at", { ascending: false });

  const total = leads?.length ?? 0;
  const byType = (leads ?? []).reduce<Record<string, number>>((acc, l) => {
    const t = l.join_type ?? "community";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-fog-warm p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-pine">Community Leads</h1>
        <p className="mt-0.5 text-sm text-pine/40">
          People who joined through the landing page form.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={total} />
        <StatCard label="Creators" value={byType["creator"] ?? 0} />
        <StatCard label="SMEs" value={byType["sme"] ?? 0} />
        <StatCard label="Community" value={byType["community"] ?? 0} />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-pine/8 bg-white">
        {(leads ?? []).length === 0 ? (
          <div className="py-20 text-center text-sm text-muted">
            No community leads yet. They&apos;ll appear here when someone fills in the join form.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pine/8 bg-pine/[0.02]">
                  <th className="px-5 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Name</th>
                  <th className="px-5 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Email</th>
                  <th className="px-5 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Type</th>
                  <th className="px-5 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine/5">
                {(leads ?? []).map((lead) => (
                  <tr key={lead.id} className="hover:bg-pine/[0.015]">
                    <td className="px-5 py-3.5 font-medium text-pine">{lead.full_name}</td>
                    <td className="px-5 py-3.5 text-pine/70">{lead.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] ${
                        lead.join_type === "creator"
                          ? "bg-gold/15 text-terra"
                          : lead.join_type === "sme"
                          ? "bg-moss/15 text-moss"
                          : "bg-pine/8 text-muted"
                      }`}>
                        {JOIN_TYPE_LABELS[lead.join_type ?? "community"] ?? lead.join_type ?? "Community"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[0.72rem] text-pine/40">
                      {new Date(lead.joined_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-pine/8 bg-white p-4">
      <div className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-pine">{value}</div>
    </div>
  );
}
