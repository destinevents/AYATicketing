import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateQrToken } from "@/lib/utils";
import { sendRegistrationConfirmationEmail } from "@/lib/email/send";
import { createCheckoutSession } from "@/lib/paymongo";
import { z } from "zod";

const bodySchema = z.object({
  event_id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  full_name: z.string().min(2),
  business_name: z.string().optional(),
  email: z.string().email(),
  mobile_number: z.string().min(7),
  industry: z.string().optional(),
  social_link: z.string().optional(),
  special_notes: z.string().optional(),
  newsletter_opt_in: z.boolean().default(false),
  networking_opt_in: z.boolean().default(false),
  archetype: z.enum(["founder", "creative", "community_builder", "enabler"]).nullable().optional(),
  promo_code_id: z.string().uuid().optional().nullable(),
  discount_amount: z.number().min(0).default(0),
  final_amount: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);

    const supabase = createAdminClient();

    // 1. Verify ticket exists & has capacity
    const { data: ticket, error: ticketError } = await supabase
      .from("event_tickets")
      .select("*")
      .eq("id", body.ticket_id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    if (ticket.status === "hidden" || ticket.status === "closed") {
      return NextResponse.json({ error: "This ticket is no longer available." }, { status: 400 });
    }

    if (ticket.capacity > 0 && ticket.sold >= ticket.capacity) {
      return NextResponse.json({ error: "This ticket is sold out." }, { status: 400 });
    }

    // 2. Determine initial registration status
    //    Free tickets confirm instantly. Paid tickets stay "pending" until
    //    an admin verifies payment (GCash / Maya / Bank Transfer / PayMongo).
    const isFree = Number(ticket.price) === 0;
    const status = isFree ? "confirmed" : "pending";
    const qrCode = generateQrToken(isFree ? "AYA-FREE" : "AYA");

    // 3. Insert registration (trigger auto-upserts attendee CRM record)
    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert({
        event_id: body.event_id,
        ticket_id: body.ticket_id,
        full_name: body.full_name,
        business_name: body.business_name || null,
        email: body.email,
        mobile_number: body.mobile_number,
        industry: body.industry || null,
        social_link: body.social_link || null,
        special_notes: body.special_notes || null,
        newsletter_opt_in: body.newsletter_opt_in,
        networking_opt_in: body.networking_opt_in,
        archetype: body.archetype || null,
        promo_code_id: body.promo_code_id || null,
        discount_amount: body.discount_amount || 0,
        final_amount: body.final_amount ?? Number(ticket.price),
        status,
        qr_code: qrCode,
      })
      .select()
      .single();

    if (regError || !registration) {
      console.error(regError);
      return NextResponse.json({ error: "Could not create registration." }, { status: 500 });
    }

    // 4. Insert payment record
    const finalAmount = body.final_amount ?? Number(ticket.price);
    const isFreeAfterDiscount = finalAmount === 0;

    await supabase.from("payments").insert({
      registration_id: registration.id,
      amount: finalAmount,
      method: isFreeAfterDiscount ? "free" : "gcash",
      status: (isFree || isFreeAfterDiscount) ? "paid" : "pending",
      paid_at: (isFree || isFreeAfterDiscount) ? new Date().toISOString() : null,
    });

    // 5. Fetch event (needed for checkout title + confirmation email)
    const { data: event } = await supabase.from("events").select("*").eq("id", body.event_id).single();

    // 6. For paid tickets, create a dynamic PayMongo checkout session with the correct final amount.
    let checkoutUrl: string | null = null;
    if (!isFree && !isFreeAfterDiscount) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      try {
        const session = await createCheckoutSession({
          registrationId: registration.id,
          amountPhp: finalAmount,
          ticketName: ticket.name,
          eventTitle: event?.title ?? "AYA Event",
          email: body.email,
          name: body.full_name,
          phone: body.mobile_number,
          archetype: body.archetype ?? null,
          successUrl: `${siteUrl}/events/payment-success?registration_id=${registration.id}`,
          cancelUrl: `${siteUrl}/events/confirmation/${registration.id}?payment=cancelled`,
        });
        checkoutUrl = session.checkoutUrl;
      } catch {
        checkoutUrl = process.env.NEXT_PUBLIC_PAYMONGO_PAYMENT_LINK ?? null;
      }
    }

    // 7. Send registration confirmation email
    if (event) {
      await sendRegistrationConfirmationEmail(registration, event, ticket, status === "confirmed");
    }

    return NextResponse.json({ registration, checkout_url: checkoutUrl }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
