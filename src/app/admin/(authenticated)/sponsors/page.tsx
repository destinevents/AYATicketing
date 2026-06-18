import { createClient } from "@/lib/supabase/server";
import { SponsorsList } from "./SponsorsList";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 0;

export default async function SponsorsPage() {
  const supabase = await createClient();

  const [{ data: sponsors }, { data: events }] = await Promise.all([
    supabase.from("sponsors").select("*").order("sort_order", { ascending: true }),
    supabase.from("events").select("id, title").order("start_date", { ascending: false }),
  ]);

  const totalAmount = (sponsors ?? []).reduce((sum, s) => sum + Number(s.amount), 0);
  const confirmedCount = (sponsors ?? []).filter((s) => s.status !== "lead").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-pine">Sponsors</h1>
        <p className="mt-1 text-sm text-muted">
          {sponsors?.length ?? 0} total · {confirmedCount} confirmed+ · {formatCurrency(totalAmount)} tracked value
        </p>
      </div>

      <SponsorsList sponsors={sponsors ?? []} events={events ?? []} />
    </div>
  );
}
