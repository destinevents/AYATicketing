import { createClient } from "@/lib/supabase/server";
import { AbandonedCartPanel } from "./AbandonedCartPanel";
import { ComposeUpdatePanel } from "./ComposeUpdatePanel";
import type { AbandonedRegistration, EmailLogRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function EmailMarketingPage() {
  const supabase = await createClient();

  const [{ data: abandoned }, { data: events }, { data: recentLogs }, { count: totalSent }] = await Promise.all([
    supabase.from("abandoned_registrations").select("*"),
    supabase.from("events").select("id, title").order("start_date", { ascending: false }),
    supabase.from("email_logs").select("*").order("sent_at", { ascending: false }).limit(15),
    supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "sent"),
  ]);

  const resendConfigured = !!process.env.RESEND_API_KEY;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-pine">Email Marketing</h1>
        <p className="mt-1 text-sm text-muted">
          Branded confirmations, abandoned cart recovery, and community updates — {totalSent ?? 0} emails sent total.
        </p>
      </div>

      {!resendConfigured && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-terra">
          ⚠ <strong>RESEND_API_KEY</strong> is not set — emails will be logged as &quot;skipped&quot; instead of
          sent. Add it to your environment variables to start sending. See README → Email Marketing.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AbandonedCartPanel abandoned={(abandoned ?? []) as AbandonedRegistration[]} />
        <ComposeUpdatePanel events={events ?? []} />
      </div>

      {/* Recent email activity */}
      <div className="mt-6 rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-4 font-display text-lg text-pine">Recent Email Activity</h3>
        {recentLogs && recentLogs.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-pine/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pine/10 bg-pine/[0.02] text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Recipient</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Sent</th>
                </tr>
              </thead>
              <tbody>
                {(recentLogs as EmailLogRecord[]).map((log) => (
                  <tr key={log.id} className="border-b border-pine/5 last:border-0">
                    <td className="px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
                      {log.email_type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-2 text-muted">{log.recipient_email}</td>
                    <td className="px-4 py-2 text-muted">{log.subject ?? "—"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.08em] ${
                          log.status === "sent"
                            ? "bg-moss/15 text-moss"
                            : log.status === "skipped"
                            ? "bg-pine/5 text-muted"
                            : "bg-terra/10 text-terra"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted">{formatDate(log.sent_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No emails sent yet.</p>
        )}
      </div>
    </div>
  );
}
