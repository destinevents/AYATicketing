"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABELS, type EventCategory } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentTime = searchParams.get("time") ?? "upcoming";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/events?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-45">
          🔍
        </span>
        <input
          type="text"
          defaultValue={currentSearch}
          placeholder="Search events…"
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full rounded-md border border-pine/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors focus:border-pine-mid"
        />
      </div>

      <select
        value={currentCategory}
        onChange={(e) => updateParam("category", e.target.value)}
        className="min-w-[160px] cursor-pointer rounded-md border border-pine/10 bg-white px-4 py-2.5 text-sm text-ink outline-none"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {CATEGORY_LABELS[cat]}
          </option>
        ))}
      </select>

      <div className="flex rounded-md border border-pine/10 bg-white p-1 text-sm">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => updateParam("time", t)}
            className={`rounded px-4 py-1.5 capitalize transition-colors ${
              currentTime === t
                ? "bg-pine text-fog"
                : "text-muted hover:text-pine"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
