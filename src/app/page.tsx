import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";
import { Navbar } from "@/components/Navbar";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: events }, { count: totalMembers }, { data: partners }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, slug, start_date, end_date, venue_name, category, cover_image_url, coming_soon, event_tickets(name, price, capacity, sold, status)")
      .eq("status", "published")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(3),
    supabase.from("attendees").select("*", { count: "exact", head: true }),
    supabase.from("partners").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  return (
    <>
      <Navbar />
      <LandingPage events={events ?? []} totalMembers={totalMembers ?? 0} partners={partners ?? []} />
    </>
  );
}
