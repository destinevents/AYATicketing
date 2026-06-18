"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SponsorRecord, SponsorStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SponsorsListProps {
  sponsors: SponsorRecord[];
  events: { id: string; title: string }[];
}

const STATUSES: SponsorStatus[] = ["lead", "confirmed", "paid", "completed"];

export function SponsorsList({ sponsors, events }: SponsorsListProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowNew((v) => !v)}
          className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
        >
          {showNew ? "Cancel" : "+ Add Sponsor"}
        </button>
      </div>

      {showNew && (
        <div className="mb-4">
          <SponsorRow
            sponsor={null}
            events={events}
            onDone={() => {
              setShowNew(false);
              router.refresh();
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        {sponsors.map((sponsor) => (
          <SponsorRow key={sponsor.id} sponsor={sponsor} events={events} onDone={() => router.refresh()} />
        ))}
        {sponsors.length === 0 && !showNew && (
          <div className="rounded-xl border border-dashed border-pine/15 bg-white/50 py-12 text-center text-sm text-muted">
            No sponsors yet — add one above.
          </div>
        )}
      </div>
    </div>
  );
}

function SponsorRow({
  sponsor,
  events,
  onDone,
}: {
  sponsor: SponsorRecord | null;
  events: { id: string; title: string }[];
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(!sponsor);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(sponsor?.name ?? "");
  const [eventId, setEventId] = useState(sponsor?.event_id ?? "");
  const [pkg, setPkg] = useState(sponsor?.package ?? "");
  const [amount, setAmount] = useState(sponsor?.amount?.toString() ?? "0");
  const [logoUrl, setLogoUrl] = useState(sponsor?.logo_url ?? "");
  const [website, setWebsite] = useState(sponsor?.website ?? "");
  const [status, setStatus] = useState<SponsorStatus>(sponsor?.status ?? "lead");

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name,
      event_id: eventId || null,
      package: pkg || null,
      amount: Number(amount),
      logo_url: logoUrl || null,
      website: website || null,
      status,
    };

    if (sponsor) {
      await supabase.from("sponsors").update(payload).eq("id", sponsor.id);
    } else {
      await supabase.from("sponsors").insert(payload);
    }
    setSaving(false);
    setEditing(false);
    onDone();
  }

  async function handleDelete() {
    if (!sponsor) return;
    if (!confirm(`Remove sponsor "${sponsor.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("sponsors").delete().eq("id", sponsor.id);
    onDone();
  }

  if (!editing && sponsor) {
    const event = events.find((e) => e.id === sponsor.event_id);
    return (
      <div className="flex items-center justify-between rounded-xl border border-pine/10 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-pine/5 text-base">✦</div>
          <div>
            <div className="font-display text-pine">{sponsor.name}</div>
            <div className="font-mono text-[0.6rem] text-muted">
              {sponsor.package ?? "—"} · {event ? event.title : "Global / Ecosystem"}
              {sponsor.amount > 0 && ` · ${formatCurrency(sponsor.amount)}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] ${
              sponsor.status === "paid" || sponsor.status === "completed"
                ? "bg-moss/15 text-moss"
                : sponsor.status === "confirmed"
                ? "bg-gold/15 text-terra"
                : "bg-pine/5 text-muted"
            }`}
          >
            {sponsor.status}
          </span>
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
    <div className="space-y-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Sponsor Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Company / Organization name" />
        </Field>
        <Field label="Linked Event (optional)">
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
            <option value="">Global / Ecosystem Sponsor</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Package">
          <input value={pkg} onChange={(e) => setPkg(e.target.value)} className={inputClass} placeholder="Gold Sponsor, In-Kind, etc." />
        </Field>
        <Field label="Amount (PHP)">
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Logo URL">
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} placeholder="https://…" />
        </Field>
        <Field label="Website">
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://…" />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as SponsorStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="rounded-sm bg-pine px-4 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fog transition-colors hover:bg-pine-mid disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Sponsor"}
        </button>
        {sponsor && (
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
    </div>
  );
}
