"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EventTicketRecord, TicketStatus, TicketTier } from "@/lib/types";
import { TICKET_TIER_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const TIERS = Object.keys(TICKET_TIER_LABELS) as TicketTier[];
const STATUSES: TicketStatus[] = ["available", "sold_out", "closed", "hidden"];

interface TicketsManagerProps {
  eventId: string;
  tickets: EventTicketRecord[];
}

function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TicketsManager({ eventId, tickets }: TicketsManagerProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="rounded-xl border border-pine/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg text-pine">Ticket Tiers</h3>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="rounded-sm border border-pine/15 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-pine transition-colors hover:bg-pine/5"
        >
          {showNew ? "Cancel" : "+ Add Ticket"}
        </button>
      </div>

      {showNew && (
        <TicketRow
          eventId={eventId}
          ticket={null}
          onDone={() => {
            setShowNew(false);
            router.refresh();
          }}
        />
      )}

      <div className="space-y-3">
        {tickets
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((ticket) => (
            <TicketRow key={ticket.id} eventId={eventId} ticket={ticket} onDone={() => router.refresh()} />
          ))}
        {tickets.length === 0 && !showNew && (
          <p className="text-sm text-muted">No ticket tiers yet — add one above.</p>
        )}
      </div>
    </div>
  );
}

function TicketRow({
  eventId,
  ticket,
  onDone,
}: {
  eventId: string;
  ticket: EventTicketRecord | null;
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(!ticket);
  const [saving, setSaving] = useState(false);

  const [tier, setTier] = useState<TicketTier>(ticket?.tier ?? "regular");
  const [name, setName] = useState(ticket?.name ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [price, setPrice] = useState(ticket?.price?.toString() ?? "0");
  const [capacity, setCapacity] = useState(ticket?.capacity?.toString() ?? "0");
  const [salesStart, setSalesStart] = useState(toLocalDateTimeInput(ticket?.sales_start ?? null));
  const [salesEnd, setSalesEnd] = useState(toLocalDateTimeInput(ticket?.sales_end ?? null));
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? "available");
  const [sortOrder, setSortOrder] = useState(ticket?.sort_order?.toString() ?? "0");

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      event_id: eventId,
      tier,
      name,
      description: description || null,
      price: Number(price),
      capacity: Number(capacity),
      sales_start: salesStart ? new Date(salesStart).toISOString() : null,
      sales_end: salesEnd ? new Date(salesEnd).toISOString() : null,
      status,
      sort_order: Number(sortOrder),
    };

    if (ticket) {
      await supabase.from("event_tickets").update(payload).eq("id", ticket.id);
    } else {
      await supabase.from("event_tickets").insert(payload);
    }
    setSaving(false);
    setEditing(false);
    onDone();
  }

  async function handleDelete() {
    if (!ticket) return;
    if (!confirm(`Delete ticket "${ticket.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("event_tickets").delete().eq("id", ticket.id);
    onDone();
  }

  if (!editing && ticket) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-pine/10 p-3">
        <div>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra">{TICKET_TIER_LABELS[ticket.tier]}</span>
          <div className="font-display text-sm text-pine">{ticket.name}</div>
          <div className="font-mono text-[0.6rem] text-muted">
            {formatCurrency(ticket.price)} · {ticket.capacity === 0 ? "Unlimited" : `${ticket.sold}/${ticket.capacity} sold`} · {ticket.status}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="rounded-sm border border-pine/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted hover:text-pine">
            Edit
          </button>
          <button onClick={handleDelete} className="rounded-sm border border-terra/20 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra hover:bg-terra/5">
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tier">
          <select value={tier} onChange={(e) => setTier(e.target.value as TicketTier)} className={inputClass}>
            {TIERS.map((t) => (
              <option key={t} value={t}>{TICKET_TIER_LABELS[t]}</option>
            ))}
          </select>
        </Field>
        <Field label="Display Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Early Bird" />
        </Field>
        <Field label="Price (PHP)">
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Capacity (0 = unlimited)">
          <input type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputClass} />
          {ticket && ticket.capacity > 0 && (
            <p className="mt-1 font-mono text-[0.58rem] text-muted">
              {ticket.sold} / {ticket.capacity} sold
              {ticket.sold >= ticket.capacity && (
                <span className="ml-1 text-terra"> — increase capacity to open more slots</span>
              )}
            </p>
          )}
        </Field>
        <Field label="Sales Start">
          <input type="datetime-local" value={salesStart} onChange={(e) => setSalesStart(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Sales End">
          <input type="datetime-local" value={salesEnd} onChange={(e) => setSalesEnd(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Sort Order">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Description" full>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="What's included with this ticket" />
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="rounded-sm bg-pine px-4 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fog transition-colors hover:bg-pine-mid disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Ticket"}
        </button>
        {ticket && (
          <button onClick={() => setEditing(false)} className="rounded-sm border border-pine/15 px-4 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-pine hover:bg-pine/5">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-pine/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-pine-mid";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
    </div>
  );
}
