"use client";

import { ARCHETYPE_META, type CommunityArchetype } from "@/lib/types";

const ORDER: CommunityArchetype[] = ["founder", "creative", "community_builder", "enabler"];

interface ArchetypeSelectorProps {
  value: CommunityArchetype | null;
  onChange: (value: CommunityArchetype | null) => void;
}

/**
 * Lets a registrant self-identify as Founder / Creative / Community Builder /
 * Enabler. This powers community segmentation in the CRM and gives event
 * facilitators (e.g. Builder's Circle "Collaboration Mapping" rounds) a
 * quick sense of who's in the room.
 */
export function ArchetypeSelector({ value, onChange }: ArchetypeSelectorProps) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
        Which best describes you? <span className="text-muted/60">(optional)</span>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {ORDER.map((key) => {
          const meta = ARCHETYPE_META[key];
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(selected ? null : key)}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                selected
                  ? "border-gold bg-gold/10"
                  : "border-pine/10 bg-white hover:border-gold/30"
              }`}
            >
              <span className="text-lg leading-none">{meta.emoji}</span>
              <span>
                <span className="flex items-baseline gap-1.5">
                  <span className="font-display text-sm text-pine">{meta.label}</span>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra">{meta.code}</span>
                </span>
                <span className="mt-0.5 block text-xs text-muted">{meta.tagline}</span>
              </span>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          <span className="font-medium text-pine">{ARCHETYPE_META[value].emoji} {ARCHETYPE_META[value].label}:</span>{" "}
          {ARCHETYPE_META[value].description}
        </p>
      )}
    </div>
  );
}
