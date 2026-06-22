import Link from "next/link";
import { EventForm } from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Link href="/admin/events" className="mb-4 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted hover:text-pine">
        ← Back to Events
      </Link>
      <h1 className="mb-2 font-display text-3xl text-pine">Create New Event</h1>
      <p className="mb-6 text-sm text-muted">
        After creating the event, you&apos;ll be able to add ticket tiers, speakers, and sponsors.
      </p>
      <div className="max-w-3xl">
        <EventForm mode="create" />
      </div>
    </div>
  );
}
