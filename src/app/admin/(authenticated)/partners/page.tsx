import { createClient } from "@/lib/supabase/server";
import { PartnersList } from "./PartnersList";

export const revalidate = 0;

export default async function AdminPartnersPage() {
  const supabase = await createClient();
  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen bg-fog-warm p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-pine">Partners Directory</h1>
        <p className="mt-0.5 text-sm text-pine/40">
          Manage the SME & founding partner listings shown on the landing page.
        </p>
      </div>
      <PartnersList partners={partners ?? []} />
    </div>
  );
}
