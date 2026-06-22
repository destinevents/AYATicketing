import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistrationsTable } from "./RegistrationsTable";

export const revalidate = 0;

interface RegistrationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventRegistrationsPage({ params }: RegistrationsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("id, title, slug").eq("id", id).single();
  if (!event) notFound();

  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, event_tickets(name, price), payments(id, amount, method, status)")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Link href={`/admin/events/${id}/edit`} className="mb-4 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted hover:text-pine">
        ← Back to {event.title}
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:items-center">
        <div>
          <h1 className="font-display text-3xl text-pine">Registrations</h1>
          <p className="mt-1 text-sm text-muted">{event.title} · {registrations?.length ?? 0} total</p>
        </div>
        <a
          href={`/api/export/csv?type=registrations&event_id=${id}`}
          className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid"
        >
          Export CSV
        </a>
      </div>

      <RegistrationsTable registrations={(registrations ?? []) as never} />
    </div>
  );
}
