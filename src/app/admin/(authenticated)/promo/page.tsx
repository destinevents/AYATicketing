import { createClient } from "@/lib/supabase/server";
import { PromoCodesList } from "./PromoCodesList";

export const revalidate = 0;

export default async function PromoCodesPage() {
  const supabase = await createClient();

  const [{ data: codes }, { data: events }] = await Promise.all([
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("id, title").order("start_date", { ascending: false }),
  ]);

  const totalUsed = (codes ?? []).reduce((sum, c) => sum + (c.used_count ?? 0), 0);
  const activeCodes = (codes ?? []).filter((c) => c.is_active).length;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-pine">Promo Codes</h1>
        <p className="mt-1 text-sm text-muted">
          {codes?.length ?? 0} codes · {activeCodes} active · {totalUsed} total uses
        </p>
      </div>

      {/* Community member code highlight */}
      <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 p-5">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌿</div>
          <div>
            <div className="font-display text-base text-pine">AYA Community Member Code</div>
            <div className="mt-0.5 font-mono text-sm font-medium tracking-[0.08em] text-terra">AYAMEMBER30</div>
            <div className="mt-1 text-xs text-muted">30% off · All events · Unlimited uses · Never expires. Share this with verified AYA community members.</div>
          </div>
        </div>
      </div>

      <PromoCodesList codes={codes ?? []} events={events ?? []} />
    </div>
  );
}
