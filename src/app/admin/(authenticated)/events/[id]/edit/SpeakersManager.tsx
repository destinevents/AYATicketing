"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EventSpeakerRecord } from "@/lib/types";

interface SpeakersManagerProps {
  eventId: string;
  speakers: EventSpeakerRecord[];
}

export function SpeakersManager({ eventId, speakers }: SpeakersManagerProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="rounded-xl border border-pine/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg text-pine">Speakers & Hosts</h3>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="rounded-sm border border-pine/15 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-pine transition-colors hover:bg-pine/5"
        >
          {showNew ? "Cancel" : "+ Add Speaker"}
        </button>
      </div>

      {showNew && (
        <SpeakerRow
          eventId={eventId}
          speaker={null}
          onDone={() => {
            setShowNew(false);
            router.refresh();
          }}
        />
      )}

      <div className="space-y-3">
        {speakers
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((speaker) => (
            <SpeakerRow key={speaker.id} eventId={eventId} speaker={speaker} onDone={() => router.refresh()} />
          ))}
        {speakers.length === 0 && !showNew && <p className="text-sm text-muted">No speakers added (optional).</p>}
      </div>
    </div>
  );
}

function SpeakerRow({
  eventId,
  speaker,
  onDone,
}: {
  eventId: string;
  speaker: EventSpeakerRecord | null;
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(!speaker);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(speaker?.name ?? "");
  const [title, setTitle] = useState(speaker?.title ?? "");
  const [bio, setBio] = useState(speaker?.bio ?? "");
  const [socialLink, setSocialLink] = useState(speaker?.social_link ?? "");
  const [sortOrder, setSortOrder] = useState(speaker?.sort_order?.toString() ?? "0");

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      event_id: eventId,
      name,
      title: title || null,
      bio: bio || null,
      social_link: socialLink || null,
      sort_order: Number(sortOrder),
    };

    if (speaker) {
      await supabase.from("event_speakers").update(payload).eq("id", speaker.id);
    } else {
      await supabase.from("event_speakers").insert(payload);
    }
    setSaving(false);
    setEditing(false);
    onDone();
  }

  async function handleDelete() {
    if (!speaker) return;
    if (!confirm(`Remove speaker "${speaker.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("event_speakers").delete().eq("id", speaker.id);
    onDone();
  }

  if (!editing && speaker) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-pine/10 p-3">
        <div>
          <div className="font-display text-sm text-pine">{speaker.name}</div>
          {speaker.title && <div className="font-mono text-[0.6rem] text-muted">{speaker.title}</div>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="rounded-sm border border-pine/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted hover:text-pine">
            Edit
          </button>
          <button onClick={handleDelete} className="rounded-sm border border-terra/20 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra hover:bg-terra/5">
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Monica Joy Fernandez" />
        </Field>
        <Field label="Title / Role">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Founder, As You Are Baguio" />
        </Field>
        <Field label="Social Link">
          <input value={socialLink} onChange={(e) => setSocialLink(e.target.value)} className={inputClass} placeholder="https://instagram.com/…" />
        </Field>
        <Field label="Sort Order">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Bio" full>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputClass} min-h-[70px] resize-y`} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="rounded-sm bg-pine px-4 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fog transition-colors hover:bg-pine-mid disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Speaker"}
        </button>
        {speaker && (
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
