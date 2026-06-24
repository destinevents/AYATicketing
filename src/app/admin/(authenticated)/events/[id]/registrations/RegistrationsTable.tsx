"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CommunityArchetype, PaymentStatus, RegistrationStatus } from "@/lib/types"; // RegistrationStatus used in RegStatusBadge
import { ARCHETYPE_META } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RegistrationRow {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  business_name: string | null;
  status: RegistrationStatus;
  checked_in: boolean;
  created_at: string;
  archetype: CommunityArchetype | null;
  event_tickets: { name: string; price: number } | null;
  payments: { id: string; amount: number; method: string; status: PaymentStatus }[];
}

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "cancelled", "refunded", "expired"];

function RegStatusBadge({ status }: { status: RegistrationStatus }) {
  const styles: Record<RegistrationStatus, string> = {
    confirmed: "border-moss/30 bg-moss/10 text-moss",
    pending: "border-gold/30 bg-gold/10 text-terra",
    cancelled: "border-terra/20 bg-terra/5 text-terra",
    waitlisted: "border-pine/20 bg-pine/5 text-muted",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] ${styles[status] ?? "border-pine/10 text-muted"}`}>
      {status}
    </span>
  );
}

const PAY_STATUS_STYLES: Record<string, string> = {
  paid:      "border-moss/30 bg-moss/10 text-moss",
  pending:   "border-gold/30 bg-gold/10 text-terra",
  cancelled: "border-terra/20 bg-terra/5 text-terra",
  refunded:  "border-pine/20 bg-pine/5 text-muted",
  expired:   "border-slate-300 bg-slate-50 text-slate-500",
};

const FILTER_OPTIONS: Array<{ label: string; value: PaymentStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "Refunded", value: "refunded" },
];

export function RegistrationsTable({ registrations }: { registrations: RegistrationRow[] }) {
  const [payFilter, setPayFilter] = useState<PaymentStatus | "all">("all");

  const visible = payFilter === "all"
    ? registrations
    : registrations.filter((r) => (r.payments?.[0]?.status ?? "pending") === payFilter);

  return (
    <div>
      {/* Payment status filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">Filter by payment:</span>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPayFilter(opt.value)}
            className={`rounded-full border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] transition-colors ${
              payFilter === opt.value
                ? "border-pine bg-pine text-fog"
                : "border-pine/15 text-muted hover:border-pine/30 hover:text-pine"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

    <div className="overflow-x-auto rounded-xl border border-pine/10 bg-white">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-pine/10 bg-pine/[0.02] text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
            <th className="px-5 py-3">Attendee</th>
            <th className="px-5 py-3">Archetype</th>
            <th className="px-5 py-3">Ticket</th>
            <th className="px-5 py-3">Registration</th>
            <th className="px-5 py-3">Payment</th>
            <th className="px-5 py-3">Check-In</th>
            <th className="px-5 py-3">Registered</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <RegistrationRowItem key={r.id} reg={r} />
          ))}
        </tbody>
      </table>
      {visible.length === 0 && (
        <div className="py-12 text-center text-sm text-muted">
          {registrations.length === 0
            ? "No registrations yet for this event."
            : "No registrations match the selected payment status filter."}
        </div>
      )}
    </div>
    </div>
  );
}

function RegistrationRowItem({ reg }: { reg: RegistrationRow }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const payment = reg.payments?.[0];

  // Local state for instant UI updates (optimistic)
  const [regStatus, setRegStatus] = useState<RegistrationStatus>(reg.status);
  const [payStatus, setPayStatus] = useState<PaymentStatus>(payment?.status ?? "pending");

  const REG_STATUS_MAP: Record<PaymentStatus, RegistrationStatus> = {
    paid: "confirmed",
    pending: "pending",
    cancelled: "cancelled",
    refunded: "cancelled",
    expired: "cancelled",
  };

  async function updatePaymentStatus(status: PaymentStatus) {
    if (!payment) return;
    setUpdating(true);
    // Optimistically update UI immediately
    setPayStatus(status);
    setRegStatus(REG_STATUS_MAP[status]);
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: payment.id, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Could not update payment status.");
        // Revert on failure
        setPayStatus(payment.status);
        setRegStatus(reg.status);
        setUpdating(false);
        return;
      }
      // Also sync in DB via admin route (bypasses RLS)
      await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: reg.id, status: REG_STATUS_MAP[status] }),
      });
    } catch {
      alert("Could not update payment status.");
      setPayStatus(payment.status);
      setRegStatus(reg.status);
    }
    setUpdating(false);
    router.refresh();
  }

  async function toggleCheckIn() {
    setUpdating(true);
    const supabase = createClient();
    await supabase
      .from("registrations")
      .update({
        checked_in: !reg.checked_in,
        checked_in_at: !reg.checked_in ? new Date().toISOString() : null,
      })
      .eq("id", reg.id);
    setUpdating(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-pine/5 last:border-0">
      <td className="px-5 py-3">
        <div className="font-display text-pine">{reg.full_name}</div>
        <div className="text-xs text-muted">{reg.email}</div>
        <div className="text-xs text-muted">{reg.mobile_number}</div>
        {reg.business_name && <div className="text-xs text-muted">{reg.business_name}</div>}
      </td>
      <td className="px-5 py-3">
        {reg.archetype ? (
          <span
            className="rounded-full bg-gold/10 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-terra"
            title={ARCHETYPE_META[reg.archetype].tagline}
          >
            {ARCHETYPE_META[reg.archetype].emoji} {ARCHETYPE_META[reg.archetype].code}
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="px-5 py-3 text-muted">
        {reg.event_tickets?.name ?? "—"}
        <div className="font-mono text-xs">{formatCurrency(reg.event_tickets?.price ?? 0)}</div>
      </td>
      <td className="px-5 py-3">
        <RegStatusBadge status={regStatus} />
      </td>
      <td className="px-5 py-3">
        {payment ? (
          <select
            value={payStatus}
            disabled={updating}
            onChange={(e) => updatePaymentStatus(e.target.value as PaymentStatus)}
            className={`rounded-full border px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] outline-none ${PAY_STATUS_STYLES[payStatus] ?? "border-pine/10 text-muted"}`}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <span className="text-muted">—</span>
        )}
        {payment && <div className="mt-1 font-mono text-xs text-muted">{payment.method}</div>}
      </td>
      <td className="px-5 py-3">
        <button
          onClick={toggleCheckIn}
          disabled={updating}
          className={`rounded-full px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] transition-colors ${
            reg.checked_in ? "bg-moss/15 text-moss" : "bg-pine/5 text-muted hover:text-pine"
          }`}
        >
          {reg.checked_in ? "✓ Checked In" : "Not yet"}
        </button>
      </td>
      <td className="px-5 py-3 text-xs text-muted">{formatDate(reg.created_at, { month: "short", day: "numeric", year: "numeric" })}</td>
    </tr>
  );
}
