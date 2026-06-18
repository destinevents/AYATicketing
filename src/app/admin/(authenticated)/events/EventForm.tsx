"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { EventCategory, EventRecord, EventStatus } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface EventFormProps {
  mode: "create" | "edit";
  initialEvent?: EventRecord;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];
const STATUSES: EventStatus[] = ["draft", "published", "cancelled", "completed"];

function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ mode, initialEvent }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [slug, setSlug] = useState(initialEvent?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialEvent);
  const [subtitle, setSubtitle] = useState(initialEvent?.subtitle ?? "");
  const [description, setDescription] = useState(initialEvent?.description ?? "");
  const [category, setCategory] = useState<EventCategory>(initialEvent?.category ?? "other");
  const [status, setStatus] = useState<EventStatus>(initialEvent?.status ?? "draft");
  const [isFeatured, setIsFeatured] = useState(initialEvent?.is_featured ?? false);

  const [startDate, setStartDate] = useState(toLocalDateTimeInput(initialEvent?.start_date ?? null));
  const [endDate, setEndDate] = useState(toLocalDateTimeInput(initialEvent?.end_date ?? null));

  const [venueName, setVenueName] = useState(initialEvent?.venue_name ?? "");
  const [venueAddress, setVenueAddress] = useState(initialEvent?.venue_address ?? "");
  const [venueMapUrl, setVenueMapUrl] = useState(initialEvent?.venue_map_url ?? "");

  const [organizerName, setOrganizerName] = useState(
    initialEvent?.organizer_name ?? "AYA Community x Destine Events"
  );
  const [organizerContact, setOrganizerContact] = useState(initialEvent?.organizer_contact ?? "");

  const [galleryUrls, setGalleryUrls] = useState(
    (initialEvent?.gallery_image_urls ?? []).join("\n")
  );
  const [scheduleJson, setScheduleJson] = useState(
    JSON.stringify(initialEvent?.schedule ?? [], null, 2)
  );
  const [faqsJson, setFaqsJson] = useState(JSON.stringify(initialEvent?.faqs ?? [], null, 2));

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let parsedSchedule, parsedFaqs;
    try {
      parsedSchedule = scheduleJson.trim() ? JSON.parse(scheduleJson) : [];
      parsedFaqs = faqsJson.trim() ? JSON.parse(faqsJson) : [];
    } catch {
      setError("Schedule or FAQs JSON is invalid — please check the formatting.");
      setSaving(false);
      return;
    }

    const payload = {
      title,
      slug: slug || slugify(title),
      subtitle: subtitle || null,
      description: description || null,
      category,
      status,
      is_featured: isFeatured,
      start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      venue_name: venueName || null,
      venue_address: venueAddress || null,
      venue_map_url: venueMapUrl || null,
      organizer_name: organizerName || null,
      organizer_contact: organizerContact || null,
      gallery_image_urls: galleryUrls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      schedule: parsedSchedule,
      faqs: parsedFaqs,
    };

    const supabase = createClient();

    if (mode === "create") {
      const { data, error } = await supabase.from("events").insert(payload).select().single();
      setSaving(false);
      if (error || !data) {
        setError(error?.message ?? "Could not create event.");
        return;
      }
      router.push(`/admin/events/${data.id}/edit`);
      router.refresh();
    } else {
      const { error } = await supabase.from("events").update(payload).eq("id", initialEvent!.id);
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-terra/30 bg-terra/5 p-3 text-sm text-terra">{error}</div>
      )}

      {/* Basic info */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-4 font-display text-lg text-pine">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event Title *">
            <input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputClass}
              placeholder="RE:BLOOM 2026"
            />
          </Field>
          <Field label="Slug *">
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              className={`${inputClass} font-mono`}
              placeholder="rebloom-2026"
            />
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subtitle" full>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="Short tagline shown on event cards" />
          </Field>
          <Field label="Description" full>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[120px] resize-y`}
              placeholder="Full event description…"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-pine/30 accent-pine"
            />
            Feature this event on the Events Hub banner
          </label>
        </div>
      </div>

      {/* Dates & Venue */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-4 font-display text-lg text-pine">Date & Venue</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start Date & Time *">
            <input
              required
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="End Date & Time">
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Venue Name">
            <input value={venueName} onChange={(e) => setVenueName(e.target.value)} className={inputClass} placeholder="Location TBA" />
          </Field>
          <Field label="Venue Map URL">
            <input value={venueMapUrl} onChange={(e) => setVenueMapUrl(e.target.value)} className={inputClass} placeholder="https://maps.google.com/…" />
          </Field>
          <Field label="Venue Address" full>
            <input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} className={inputClass} placeholder="Baguio City, Benguet" />
          </Field>
        </div>
      </div>

      {/* Organizer */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-4 font-display text-lg text-pine">Organizer</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organizer Name">
            <input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Organizer Contact Email">
            <input value={organizerContact} onChange={(e) => setOrganizerContact(e.target.value)} className={inputClass} placeholder="jenncastro@destinevents.biz" />
          </Field>
        </div>
      </div>

      {/* Gallery */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-2 font-display text-lg text-pine">Photo Gallery</h3>
        <p className="mb-3 text-xs text-muted">One image URL per line (Supabase Storage public URLs recommended).</p>
        <textarea
          value={galleryUrls}
          onChange={(e) => setGalleryUrls(e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y font-mono text-xs`}
          placeholder={"https://your-project.supabase.co/storage/v1/object/public/events/photo1.jpg"}
        />
      </div>

      {/* Schedule */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-2 font-display text-lg text-pine">Schedule (JSON)</h3>
        <p className="mb-3 text-xs text-muted">
          Array of <code className="font-mono">{"{ time, title, description }"}</code> objects.
        </p>
        <textarea
          value={scheduleJson}
          onChange={(e) => setScheduleJson(e.target.value)}
          className={`${inputClass} min-h-[160px] resize-y font-mono text-xs`}
        />
      </div>

      {/* FAQs */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-2 font-display text-lg text-pine">FAQs (JSON)</h3>
        <p className="mb-3 text-xs text-muted">
          Array of <code className="font-mono">{"{ question, answer }"}</code> objects.
        </p>
        <textarea
          value={faqsJson}
          onChange={(e) => setFaqsJson(e.target.value)}
          className={`${inputClass} min-h-[120px] resize-y font-mono text-xs`}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-gold px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Event →" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-pine/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-mid";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
    </div>
  );
}
