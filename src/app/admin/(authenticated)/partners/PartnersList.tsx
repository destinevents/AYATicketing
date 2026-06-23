"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PartnerRecord } from "@/lib/types";

const CATEGORIES = [
  { value: "tech", label: "Tech & Digital" },
  { value: "food", label: "Food & Beverage" },
  { value: "agri", label: "Agriculture & Organic" },
  { value: "events", label: "Events & Hospitality" },
  { value: "education", label: "Education" },
  { value: "creative", label: "Creative Services" },
  { value: "retail", label: "Retail & Fashion" },
  { value: "wellness", label: "Wellness & Beauty" },
];

interface PartnersListProps {
  partners: PartnerRecord[];
}

export function PartnersList({ partners }: PartnersListProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowNew((v) => !v)}
          className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
        >
          {showNew ? "Cancel" : "+ Add Partner"}
        </button>
      </div>

      {showNew && (
        <div className="mb-4">
          <PartnerRow
            partner={null}
            onDone={() => {
              setShowNew(false);
              router.refresh();
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        {partners.map((partner) => (
          <PartnerRow key={partner.id} partner={partner} onDone={() => router.refresh()} />
        ))}
        {partners.length === 0 && !showNew && (
          <div className="rounded-xl border border-dashed border-pine/15 bg-white/50 py-16 text-center">
            <p className="text-sm text-muted">No partners yet.</p>
            <p className="mt-1 text-xs text-pine/30">
              Run the SQL migration in Supabase first, then add partners here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PartnerRow({
  partner,
  onDone,
}: {
  partner: PartnerRecord | null;
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(!partner);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(partner?.name ?? "");
  const [category, setCategory] = useState(partner?.category ?? "");
  const [location, setLocation] = useState(partner?.location ?? "");
  const [locationLabel, setLocationLabel] = useState(partner?.location_label ?? "");
  const [logo, setLogo] = useState(partner?.logo ?? "✦");
  const [description, setDescription] = useState(partner?.description ?? "");
  const [tagsRaw, setTagsRaw] = useState((partner?.tags ?? []).join(", "));
  const [website, setWebsite] = useState(partner?.website ?? "#");
  const [isActive, setIsActive] = useState(partner?.is_active ?? true);
  const [isPlaceholder, setIsPlaceholder] = useState(partner?.is_placeholder ?? false);
  const [sortOrder, setSortOrder] = useState(partner?.sort_order ?? 0);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name,
      category,
      location: location.toLowerCase(),
      location_label: locationLabel,
      logo,
      description,
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      website: website || "#",
      is_active: isActive,
      is_placeholder: isPlaceholder,
      sort_order: Number(sortOrder),
    };

    if (partner) {
      await supabase.from("partners").update(payload).eq("id", partner.id);
    } else {
      await supabase.from("partners").insert(payload);
    }
    setSaving(false);
    setEditing(false);
    onDone();
  }

  async function handleDelete() {
    if (!partner) return;
    if (!confirm(`Remove "${partner.name}" from the directory?`)) return;
    const supabase = createClient();
    await supabase.from("partners").delete().eq("id", partner.id);
    onDone();
  }

  async function toggleActive() {
    if (!partner) return;
    const supabase = createClient();
    await supabase.from("partners").update({ is_active: !partner.is_active }).eq("id", partner.id);
    onDone();
  }

  if (!editing && partner) {
    const catLabel = CATEGORIES.find((c) => c.value === partner.category)?.label ?? partner.category;
    return (
      <div className={`flex items-center justify-between rounded-xl border bg-white p-4 ${partner.is_active ? "border-pine/10" : "border-pine/5 opacity-50"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-pine/5 text-lg">
            {partner.logo}
          </div>
          <div>
            <div className="font-display text-pine">{partner.name}</div>
            <div className="font-mono text-[0.6rem] text-muted">
              {catLabel} · {partner.location_label}
              {partner.is_placeholder && " · Open Slot"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleActive}
            className={`rounded-full px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] ${
              partner.is_active ? "bg-moss/15 text-moss" : "bg-pine/5 text-muted"
            }`}
          >
            {partner.is_active ? "Visible" : "Hidden"}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded-sm border border-pine/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted hover:text-pine"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="rounded-sm border border-terra/20 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra hover:bg-terra/5"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Business Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Claver's Food Products" />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Logo / Emoji">
          <input value={logo} onChange={(e) => setLogo(e.target.value)} className={inputClass} placeholder="✦ or 🎪" maxLength={4} />
        </Field>
        <Field label="Location (for filter)">
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="e.g. baguio city / la trinidad" />
        </Field>
        <Field label="Location Label (displayed)">
          <input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} className={inputClass} placeholder="e.g. Session Road, Baguio City" />
        </Field>
        <Field label="Website URL">
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://…  or  #" />
        </Field>
        <Field label="Tags (comma-separated)">
          <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} className={inputClass} placeholder="Food Products, Local, Benguet" />
        </Field>
        <Field label="Sort Order">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputClass} min={0} />
        </Field>
        <Field label="Status">
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Show on landing page
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={isPlaceholder} onChange={(e) => setIsPlaceholder(e.target.checked)} />
              Open slot (placeholder card)
            </label>
          </div>
        </Field>
      </div>
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          rows={3}
          placeholder="Short description shown on the card…"
        />
      </Field>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="rounded-sm bg-pine px-4 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fog transition-colors hover:bg-pine-mid disabled:opacity-60"
        >
          {saving ? "Saving…" : partner ? "Save Changes" : "Add Partner"}
        </button>
        {partner && (
          <button
            onClick={() => setEditing(false)}
            className="rounded-sm border border-pine/15 px-4 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-pine hover:bg-pine/5"
          >
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
