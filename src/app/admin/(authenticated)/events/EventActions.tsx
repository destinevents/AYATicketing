"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DuplicateEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    const supabase = createClient();

    // Fetch original event + tickets
    const { data: original } = await supabase
      .from("events")
      .select("*, event_tickets(*)")
      .eq("id", eventId)
      .single();

    if (!original) {
      setLoading(false);
      return;
    }

    const baseSlug = `${original.slug}-copy`;
    let slug = baseSlug;
    let suffix = 1;
    // Ensure unique slug
    while (true) {
      const { data: existing } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const { id, created_at, updated_at, event_tickets, ...rest } = original;

    const { data: newEvent, error } = await supabase
      .from("events")
      .insert({
        ...rest,
        title: `${original.title} (Copy)`,
        slug,
        status: "draft",
        is_featured: false,
      })
      .select()
      .single();

    if (error || !newEvent) {
      setLoading(false);
      alert("Could not duplicate event.");
      return;
    }

    // Duplicate tickets
    if (event_tickets && event_tickets.length > 0) {
      const newTickets = event_tickets.map((t: Record<string, unknown>) => {
        const { id: _tid, event_id: _eid, created_at: _ca, updated_at: _ua, sold, ...ticketRest } = t;
        return { ...ticketRest, event_id: newEvent.id, sold: 0 };
      });
      await supabase.from("event_tickets").insert(newTickets);
    }

    setLoading(false);
    router.push(`/admin/events/${newEvent.id}/edit`);
    router.refresh();
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="rounded-sm border border-pine/10 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted transition-colors hover:border-gold/40 hover:text-terra disabled:opacity-50"
    >
      {loading ? "…" : "Duplicate"}
    </button>
  );
}

export function DeleteEventButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${eventTitle}"? This will also delete its tickets, registrations, and sponsors. This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    setLoading(false);

    if (error) {
      alert("Could not delete event.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-sm border border-terra/20 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-terra transition-colors hover:border-terra/50 hover:bg-terra/5 disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
