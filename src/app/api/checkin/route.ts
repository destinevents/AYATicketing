import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/checkin
 * Body: { qr_code: string, action?: "verify" | "checkin" }
 *
 * - "verify" (default): looks up the registration and returns attendee details
 *   without marking attendance.
 * - "checkin": marks the registration as checked in (idempotent).
 */
export async function POST(request: Request) {
  try {
    const { qr_code, action = "verify" } = await request.json();

    if (!qr_code || typeof qr_code !== "string") {
      return NextResponse.json({ error: "Missing QR code." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: registration, error } = await supabase
      .from("registrations")
      .select("*, events(title, slug, start_date), event_tickets(name, price), payments(status)")
      .eq("qr_code", qr_code)
      .single();

    if (error || !registration) {
      return NextResponse.json({ error: "Ticket not found. Please double-check the QR code." }, { status: 404 });
    }

    if (registration.status === "cancelled") {
      return NextResponse.json({ error: "This registration has been cancelled.", registration }, { status: 409 });
    }

    if (action === "checkin") {
      if (registration.checked_in) {
        return NextResponse.json({
          warning: "Already checked in.",
          registration,
          checked_in_at: registration.checked_in_at,
        });
      }

      const { data: updated, error: updateError } = await supabase
        .from("registrations")
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq("id", registration.id)
        .select("*, events(title, slug, start_date), event_tickets(name, price), payments(status)")
        .single();

      if (updateError) {
        return NextResponse.json({ error: "Could not update check-in status." }, { status: 500 });
      }

      return NextResponse.json({ success: true, registration: updated });
    }

    return NextResponse.json({ registration });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
