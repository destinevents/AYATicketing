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

interface ScheduleItem { time: string; title: string; description: string; }
interface FaqItem { question: string; answer: string; }

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

  // Gallery — stored as array of public URLs
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialEvent?.gallery_image_urls ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Schedule — structured rows
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    (initialEvent?.schedule as ScheduleItem[] | null) ?? []
  );

  // FAQs — structured rows
  const [faqs, setFaqs] = useState<FaqItem[]>(
    (initialEvent?.faqs as FaqItem[] | null) ?? []
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  /* ── Image upload ── */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("event-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        setUploadError(`Upload failed: ${upErr.message}. Make sure the "event-images" bucket exists in Supabase Storage with public access.`);
      } else {
        const { data } = supabase.storage.from("event-images").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }

    setGalleryImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(url: string) {
    setGalleryImages((prev) => prev.filter((u) => u !== url));
  }

  /* ── Schedule helpers ── */
  function addScheduleRow() {
    setSchedule((prev) => [...prev, { time: "", title: "", description: "" }]);
  }
  function updateScheduleRow(i: number, field: keyof ScheduleItem, value: string) {
    setSchedule((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }
  function removeScheduleRow(i: number) {
    setSchedule((prev) => prev.filter((_, idx) => idx !== i));
  }

  /* ── FAQ helpers ── */
  function addFaqRow() {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }
  function updateFaqRow(i: number, field: keyof FaqItem, value: string) {
    setFaqs((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }
  function removeFaqRow(i: number) {
    setFaqs((prev) => prev.filter((_, idx) => idx !== i));
  }

  /* ── Submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

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
      gallery_image_urls: galleryImages,
      schedule: schedule.filter((r) => r.time || r.title),
      faqs: faqs.filter((r) => r.question || r.answer),
    };

    const supabase = createClient();

    if (mode === "create") {
      const { data, error } = await supabase.from("events").insert(payload).select().single();
      setSaving(false);
      if (error || !data) { setError(error?.message ?? "Could not create event."); return; }
      router.push(`/admin/events/${data.id}/edit`);
      router.refresh();
    } else {
      const { error } = await supabase.from("events").update(payload).eq("id", initialEvent!.id);
      setSaving(false);
      if (error) { setError(error.message); return; }
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
            <input required value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} placeholder="RE:BLOOM 2026" />
          </Field>
          <Field label="Slug *">
            <input required value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} className={`${inputClass} font-mono`} placeholder="rebloom-2026" />
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputClass}>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </Field>
          <Field label="Subtitle" full>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="Short tagline shown on event cards" />
          </Field>
          <Field label="Description" full>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[120px] resize-y`} placeholder="Full event description…" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-pine/30 accent-pine" />
            Feature this event on the Events Hub banner
          </label>
        </div>
      </div>

      {/* Dates & Venue */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-4 font-display text-lg text-pine">Date & Venue</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start Date & Time *">
            <input required type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
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

      {/* Photo Gallery */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-1 font-display text-lg text-pine">Photo Gallery</h3>
        <p className="mb-4 text-xs text-muted">Upload photos for this event. They will appear in the gallery on the event page.</p>

        {/* Uploaded previews */}
        {galleryImages.length > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {galleryImages.map((url, i) => (
              <div key={i} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-24 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        <label className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-pine/20 p-5 transition-colors hover:border-pine/40 hover:bg-pine/[0.02] ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
          <span className="text-3xl">📷</span>
          <div>
            <div className="text-sm font-medium text-pine">{uploading ? "Uploading…" : "Click to upload photos"}</div>
            <div className="text-xs text-muted">JPG, PNG, WebP · Multiple files allowed</div>
          </div>
        </label>

        {uploadError && (
          <p className="mt-2 text-xs text-terra">{uploadError}</p>
        )}
      </div>

      {/* Schedule */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-pine">Event Schedule</h3>
            <p className="text-xs text-muted">The program timeline shown on the event page (e.g., Registration, Opening, Lunch, Closing).</p>
          </div>
          <button type="button" onClick={addScheduleRow} className="rounded-sm border border-pine/20 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-pine transition-colors hover:bg-pine/5">
            + Add Row
          </button>
        </div>
        {schedule.length === 0 && (
          <p className="text-center text-xs text-muted py-4">No schedule yet — click "Add Row" to build the program.</p>
        )}
        <div className="space-y-3">
          {schedule.map((row, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-pine/8 bg-fog-warm p-3 sm:grid-cols-[100px_1fr_1fr_auto]">
              <input value={row.time} onChange={(e) => updateScheduleRow(i, "time", e.target.value)} className={inputClass} placeholder="10:00 AM" />
              <input value={row.title} onChange={(e) => updateScheduleRow(i, "title", e.target.value)} className={inputClass} placeholder="Session title" />
              <input value={row.description} onChange={(e) => updateScheduleRow(i, "description", e.target.value)} className={inputClass} placeholder="Short description (optional)" />
              <button type="button" onClick={() => removeScheduleRow(i)} className="flex h-10 w-10 items-center justify-center rounded-md text-muted hover:bg-terra/10 hover:text-terra">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-pine">FAQs</h3>
            <p className="text-xs text-muted">Frequently asked questions shown on the event page (e.g., Who is this for? What&apos;s included?).</p>
          </div>
          <button type="button" onClick={addFaqRow} className="rounded-sm border border-pine/20 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-pine transition-colors hover:bg-pine/5">
            + Add FAQ
          </button>
        </div>
        {faqs.length === 0 && (
          <p className="text-center text-xs text-muted py-4">No FAQs yet — click "Add FAQ" to get started.</p>
        )}
        <div className="space-y-3">
          {faqs.map((row, i) => (
            <div key={i} className="rounded-lg border border-pine/8 bg-fog-warm p-3">
              <div className="mb-2 flex items-start gap-2">
                <input value={row.question} onChange={(e) => updateFaqRow(i, "question", e.target.value)} className={`${inputClass} flex-1`} placeholder="Question" />
                <button type="button" onClick={() => removeFaqRow(i)} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-muted hover:bg-terra/10 hover:text-terra">×</button>
              </div>
              <textarea value={row.answer} onChange={(e) => updateFaqRow(i, "answer", e.target.value)} className={`${inputClass} min-h-[60px] resize-y`} placeholder="Answer" />
            </div>
          ))}
        </div>
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
