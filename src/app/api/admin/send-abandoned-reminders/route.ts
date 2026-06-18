import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendAbandonedCartEmail } from "@/lib/email/send";
import type { AbandonedRegistration } from "@/lib/types";

/**
 * POST /api/admin/send-abandoned-reminders
 * Admin-only — manually triggers the abandoned cart reminder send
 * (same logic as /api/cron/abandoned-carts, but auth-gated for the
 * "Send reminders now" button in Admin → Email Marketing).
 */
export async function POST() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: abandoned, error } = await admin.from("abandoned_registrations").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (abandoned ?? []) as AbandonedRegistration[];

  for (const row of rows) {
    await sendAbandonedCartEmail({
      registration_id: row.registration_id,
      full_name: row.full_name,
      email: row.email,
      event_title: row.event_title,
      event_slug: row.event_slug,
      event_start_date: row.event_start_date,
      ticket_name: row.ticket_name,
      ticket_price: row.ticket_price,
    });
  }

  return NextResponse.json({ checked: rows.length, sent: rows.length });
}
