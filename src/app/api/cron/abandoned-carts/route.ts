import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendAbandonedCartEmail } from "@/lib/email/send";
import type { AbandonedRegistration } from "@/lib/types";

/**
 * GET /api/cron/abandoned-carts
 *
 * Finds registrations that are still "pending" (unpaid) 2+ hours after
 * creation and haven't received a reminder yet (see the
 * `abandoned_registrations` view in migrations/002_email_marketing.sql),
 * then sends each one a branded "your spot is waiting" email.
 *
 * Designed to be called by Vercel Cron (see vercel.json) — protected by
 * checking the `Authorization: Bearer <CRON_SECRET>` header that Vercel
 * automatically attaches when CRON_SECRET is set as an env var.
 *
 * Can also be triggered manually from Admin → Email Marketing
 * ("Send reminders now" button).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  const { data: abandoned, error } = await supabase
    .from("abandoned_registrations")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (abandoned ?? []) as AbandonedRegistration[];

  let sent = 0;
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
    sent += 1;
  }

  return NextResponse.json({ checked: rows.length, sent });
}
