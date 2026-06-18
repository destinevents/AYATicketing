"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AbandonedRegistration } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AbandonedCartPanel({ abandoned }: { abandoned: AbandonedRegistration[] }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/send-abandoned-reminders", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send reminders.");
      setResult(`Sent ${data.sent} reminder${data.sent === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Could not send reminders.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-pine/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-pine">Abandoned Cart Queue</h3>
          <p className="mt-1 text-xs text-muted">
            Registrations pending payment for 2+ hours with no reminder sent yet.
          </p>
        </div>
        <button
          onClick={handleSend}
          disabled={sending || abandoned.length === 0}
          className="rounded-sm bg-gold px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-50"
        >
          {sending ? "Sending…" : `Send Reminders (${abandoned.length})`}
        </button>
      </div>

      {result && <div className="mb-4 rounded-lg border border-moss/30 bg-moss/10 p-3 text-sm text-moss">{result}</div>}

      {abandoned.length === 0 ? (
        <p className="text-sm text-muted">No abandoned registrations right now — nice! 🌿</p>
      ) : (
        <div className="space-y-2">
          {abandoned.map((row) => (
            <div key={row.registration_id} className="flex items-center justify-between rounded-lg border border-pine/5 px-4 py-3">
              <div>
                <div className="font-display text-sm text-pine">{row.full_name}</div>
                <div className="text-xs text-muted">{row.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-pine">{row.event_title}</div>
                <div className="font-mono text-xs text-muted">
                  {row.ticket_name} · {formatCurrency(row.ticket_price)} · registered {formatDate(row.registered_at, { month: "short", day: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        💡 This also runs automatically on a schedule via Vercel Cron — see <code className="font-mono">vercel.json</code> and{" "}
        <code className="font-mono">/api/cron/abandoned-carts</code>.
      </p>
    </div>
  );
}
