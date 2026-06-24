import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { expireCheckoutSession } from "@/lib/paymongo";

/**
 * GET /api/cron/expire-payments
 *
 * Finds payments that have been 'pending' for more than 30 minutes and marks
 * them 'expired'. Also calls PayMongo to expire the checkout session so the
 * payment link can no longer be used.
 *
 * Called by Vercel Cron every 5 minutes (see vercel.json).
 * Protected by CRON_SECRET env var (same pattern as /api/cron/abandoned-carts).
 *
 * Registration status is left as 'pending' so users can restart checkout.
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

  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: stale, error } = await supabase
    .from("payments")
    .select("id, checkout_session_id")
    .eq("status", "pending")
    .lt("created_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let expired = 0;
  for (const payment of stale ?? []) {
    if (payment.checkout_session_id) {
      await expireCheckoutSession(payment.checkout_session_id);
    }
    await supabase
      .from("payments")
      .update({ status: "expired" })
      .eq("id", payment.id);
    expired++;
  }

  return NextResponse.json({ checked: stale?.length ?? 0, expired });
}
