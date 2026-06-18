import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/paymongo";
import { sendPaymentConfirmedEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paymongo-signature") ?? "";
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[PayMongo webhook] PAYMONGO_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn("[PayMongo webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.data?.attributes?.type;

  if (eventType !== "checkout_session.payment.paid") {
    return NextResponse.json({ received: true });
  }

  const metadata = event.data?.attributes?.data?.attributes?.metadata;
  const registrationId = metadata?.registration_id;

  if (!registrationId) {
    console.error("[PayMongo webhook] No registration_id in metadata");
    return NextResponse.json({ error: "Missing registration_id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: registration } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", registrationId)
    .single();

  if (!registration) {
    console.error("[PayMongo webhook] Registration not found:", registrationId);
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  // Confirm registration
  const { data: confirmed } = await supabase
    .from("registrations")
    .update({ status: "confirmed" })
    .eq("id", registrationId)
    .select()
    .single();

  // Mark payment as paid
  const paymongoPaymentId = event.data?.attributes?.data?.attributes?.payments?.[0]?.id ?? null;
  await supabase
    .from("payments")
    .update({
      status: "paid",
      method: "paymongo",
      reference_number: paymongoPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("registration_id", registrationId);

  // Send confirmation email with QR ticket
  if (confirmed) {
    const [{ data: eventData }, { data: ticket }] = await Promise.all([
      supabase.from("events").select("*").eq("id", registration.event_id).single(),
      supabase.from("event_tickets").select("*").eq("id", registration.ticket_id).single(),
    ]);

    if (eventData && ticket) {
      await sendPaymentConfirmedEmail(confirmed, eventData, ticket);
    }
  }

  console.log("[PayMongo webhook] Confirmed registration:", registrationId);
  return NextResponse.json({ received: true });
}
