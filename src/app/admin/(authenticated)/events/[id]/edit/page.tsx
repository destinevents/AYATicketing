import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "../../EventForm";
import { TicketsManager } from "./TicketsManager";
import { SpeakersManager } from "./SpeakersManager";
import type { EventRecord, EventTicketRecord, EventSpeakerRecord } from "@/lib/types";

export const revalidate = 0;

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, event_tickets(*), event_speakers(*)")
    .eq("id", id)
    .single();

  if (!event) notFound();

  return (
    <div className="p-8">
      <Link href="/admin/events" className="mb-4 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted hover:text-pine">
        ← Back to Events
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-pine">{event.title}</h1>
          <p className="mt-1 font-mono text-xs text-muted">/{event.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/events/${event.id}/registrations`}
            className="rounded-sm border border-pine/15 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-pine transition-colors hover:bg-pine/5"
          >
            View Registrations →
          </Link>
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="rounded-sm border border-pine/15 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-pine transition-colors hover:bg-pine/5"
          >
            View Public Page →
          </Link>
        </div>
      </div>

      <div className="grid max-w-3xl gap-6">
        <EventForm mode="edit" initialEvent={event as EventRecord} />
        <TicketsManager eventId={event.id} tickets={(event.event_tickets ?? []) as EventTicketRecord[]} />
        <SpeakersManager eventId={event.id} speakers={(event.event_speakers ?? []) as EventSpeakerRecord[]} />
      </div>
    </div>
  );
}
