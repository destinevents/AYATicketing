"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PromoCodeRecord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PromoCodesListProps {
  codes: PromoCodeRecord[];
  events: { id: string; title: string }[];
}

export function PromoCodesList({ codes, events }: PromoCodesListProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowNew((v) => !v)}
          className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
        >
          {showNew ? "Cancel" : "+ New Promo Code"}
        </button>
      </div>

      {showNew && (
        <div className="mb-6">
          <PromoCodeRow
            code={null}
            events={events}
            onDone={() => { setShowNew(false); router.refresh(); }}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-pine/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pine/10 bg-pine/[0.02] text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Scope</th>
              <th className="px-5 py-3">Uses</th>
              <th className="px-5 py-3">Valid Until</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => {
              const event = events.find((e) => e.id === code.event_id);
              return (
                <tr key={code.id} className="border-b border-pine/5 last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-mono text-sm font-medium text-pine">{code.code}</div>
                    {code.description && <div className="text-xs text-muted">{code.description}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-gold/15 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-terra">
                      {code.discount_type === "percentage"
                        ? `${code.discount_value}% off`
                        : `${formatCurrency(code.discount_value)} off`}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted">
                    {event ? event.title : "All Events"}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">
                    {code.used_count}{code.max_uses ? ` / ${code.max_uses}` : " / ∞"}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted">
                    {code.valid_until ? formatDate(code.valid_until, { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton code={code} onDone={() => router.refresh()} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DeleteCodeButton code={code} onDone={() => router.refresh()} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            No promo codes yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleActiveButton({ code, onDone }: { code: PromoCodeRecord; onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("promo_codes").update({ is_active: !code.is_active }).eq("id", code.id);
    setLoading(false);
    onDone();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] transition-colors ${
        code.is_active
          ? "bg-moss/15 text-moss hover:bg-moss/25"
          : "bg-pine/5 text-muted hover:bg-pine/10"
      }`}
    >
      {loading ? "…" : code.is_active ? "Active" : "Inactive"}
    </button>
  );
}

function DeleteCodeButton({ code, onDone }: { code: PromoCodeRecord; onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete promo code "${code.code}"? This cannot be undone.`)) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("promo_codes").delete().eq("id", code.id);
    setLoading(false);
    onDone();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-sm border border-terra/20 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra transition-colors hover:bg-terra/5 disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}

function PromoCodeRow({
  code,
  events,
  onDone,
}: {
  code: PromoCodeRecord | null;
  events: { id: string; title: string }[];
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [codeVal, setCodeVal] = useState(code?.code ?? "");
  const [description, setDescription] = useState(code?.description ?? "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(code?.discount_type ?? "percentage");
  const [discountValue, setDiscountValue] = useState(code?.discount_value?.toString() ?? "30");
  const [eventId, setEventId] = useState(code?.event_id ?? "");
  const [maxUses, setMaxUses] = useState(code?.max_uses?.toString() ?? "");
  const [validUntil, setValidUntil] = useState(
    code?.valid_until ? new Date(code.valid_until).toISOString().slice(0, 10) : ""
  );

  async function handleSave() {
    if (!codeVal.trim() || !discountValue) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      code: codeVal.toUpperCase().trim(),
      description: description || null,
      discount_type: discountType,
      discount_value: Number(discountValue),
      event_id: eventId || null,
      max_uses: maxUses ? Number(maxUses) : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      is_active: true,
    };

    if (code) {
      await supabase.from("promo_codes").update(payload).eq("id", code.id);
    } else {
      await supabase.from("promo_codes").insert(payload);
    }
    setSaving(false);
    onDone();
  }

  return (
    <div className="space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Code (e.g. AYAMEMBER30)">
          <input
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
            className={inputClass + " font-mono tracking-[0.08em]"}
            placeholder="AYAMEMBER30"
          />
        </Field>
        <Field label="Internal Description">
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="AYA Community Member 30% Discount" />
        </Field>
        <Field label="Discount Type">
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")} className={inputClass}>
            <option value="percentage">Percentage (% off)</option>
            <option value="fixed">Fixed Amount (₱ off)</option>
          </select>
        </Field>
        <Field label={discountType === "percentage" ? "Discount %" : "Discount Amount (₱)"}>
          <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className={inputClass} placeholder="30" />
        </Field>
        <Field label="Linked Event (blank = all events)">
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            <option value="">All Events</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </Field>
        <Field label="Max Uses (blank = unlimited)">
          <input type="number" min="0" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={inputClass} placeholder="Unlimited" />
        </Field>
        <Field label="Valid Until (blank = never expires)">
          <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <button
        onClick={handleSave}
        disabled={saving || !codeVal.trim() || !discountValue}
        className="rounded-sm bg-gold px-6 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Promo Code"}
      </button>
    </div>
  );
}

const inputClass = "w-full rounded-md border border-pine/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-pine-mid";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
    </div>
  );
}
