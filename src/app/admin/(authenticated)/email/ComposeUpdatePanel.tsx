"use client";

import { useState } from "react";
import { ARCHETYPE_META, type CommunityArchetype } from "@/lib/types";

type Segment = "newsletter" | "networking" | "all" | "archetype" | "event";

interface EventOption {
  id: string;
  title: string;
}

const ARCHETYPE_ORDER: CommunityArchetype[] = ["founder", "creative", "community_builder", "enabler"];

export function ComposeUpdatePanel({ events }: { events: EventOption[] }) {
  const [segment, setSegment] = useState<Segment>("newsletter");
  const [archetype, setArchetype] = useState<CommunityArchetype>("founder");
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number; message?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setError(null);
    setResult(null);

    const paragraphs = body
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/send-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body_paragraphs: paragraphs,
          cta_label: ctaLabel || undefined,
          cta_url: ctaUrl || undefined,
          segment,
          archetype: segment === "archetype" ? archetype : undefined,
          event_id: segment === "event" ? eventId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send update.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send update.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-pine/10 bg-white p-5">
      <h3 className="mb-4 font-display text-lg text-pine">Compose Community Update</h3>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">Audience</label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "newsletter", label: "Newsletter Subscribers" },
                { value: "networking", label: "Networking Opt-Ins" },
                { value: "all", label: "All Attendees" },
                { value: "archetype", label: "By Archetype" },
                { value: "event", label: "By Event" },
              ] as { value: Segment; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSegment(opt.value)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors ${
                  segment === opt.value ? "border-gold bg-gold/15 text-terra" : "border-pine/15 text-muted hover:border-gold/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {segment === "archetype" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ARCHETYPE_ORDER.map((key) => {
                const meta = ARCHETYPE_META[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setArchetype(key)}
                    className={`rounded-full border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors ${
                      archetype === key ? "border-gold bg-gold/15 text-terra" : "border-pine/15 text-muted hover:border-gold/30"
                    }`}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {segment === "event" && (
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="mt-3 w-full rounded-md border border-pine/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-pine-mid sm:w-auto"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          )}
        </div>

        <Field label="Subject">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="New AYA event just dropped! 🌿" />
        </Field>

        <Field label="Message (separate paragraphs with a blank line)">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${inputClass} min-h-[140px] resize-y`}
            placeholder={"Hi there!\n\nWe just opened registration for our next Builder's Circle session...\n\nSee you there!"}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CTA Button Label (optional)">
            <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputClass} placeholder="View Event Details" />
          </Field>
          <Field label="CTA Button URL (optional)">
            <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className={inputClass} placeholder="https://aya-baguio.vercel.app/events/..." />
          </Field>
        </div>

        {error && <div className="rounded-lg border border-terra/30 bg-terra/5 p-3 text-sm text-terra">{error}</div>}
        {result && (
          <div className="rounded-lg border border-moss/30 bg-moss/10 p-3 text-sm text-moss">
            {result.message ?? `Sent to ${result.sent} of ${result.total} recipients${result.failed ? ` (${result.failed} failed)` : ""}.`}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !subject || !body}
          className="rounded-sm bg-gold px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send Update"}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-pine/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-mid";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
    </div>
  );
}
