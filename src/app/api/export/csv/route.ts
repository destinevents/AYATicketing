import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/utils";

/**
 * GET /api/export/csv?type=attendees|registrations&event_id=optional
 *
 * type=attendees      → exports the Community CRM (attendees table)
 * type=registrations  → exports registrations for a specific event
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "attendees";
  const eventId = searchParams.get("event_id");

  const supabase = await createClient();

  if (type === "attendees") {
    const { data, error } = await supabase
      .from("attendees")
      .select("full_name, email, mobile_number, business_name, industry, archetype, social_link, newsletter_opt_in, networking_opt_in, first_seen_at")
      .order("first_seen_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const csv = toCsv(data ?? []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="aya-community-crm-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (type === "registrations") {
    let query = supabase
      .from("registrations")
      .select(
        "full_name, email, mobile_number, business_name, industry, archetype, social_link, status, checked_in, created_at, events(title), event_tickets(name, price)"
      )
      .order("created_at", { ascending: false });

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (data ?? []).map((r) => ({
      full_name: r.full_name,
      email: r.email,
      mobile_number: r.mobile_number,
      business_name: r.business_name,
      industry: r.industry,
      archetype: r.archetype,
      social_link: r.social_link,
      event: r.events?.[0]?.title ?? "",
      ticket: r.event_tickets?.[0]?.name ?? "",
      price: r.event_tickets?.[0]?.price ?? "",
      status: r.status,
      checked_in: r.checked_in,
      created_at: r.created_at,
    }));

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="aya-registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid export type." }, { status: 400 });
}
