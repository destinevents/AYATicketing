import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/paymongo";
import { z } from "zod";

const bodySchema = z.object({
  registration_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { registration_id } = bodySchema.parse(json);

    const supabase = createAdminClient();

    const { data: registration, error } = await supabase
      .from("registrations")
      .select("*, events(*), event_tickets(*)")
      .eq("id", registration_id)
      .single();

    if (error || !registration) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    const finalAmount = Number(registration.final_amount ?? registration.event_tickets?.price ?? 0);

    if (finalAmount === 0) {
      return NextResponse.json({ error: "No payment required." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const event = registration.events;
    const ticket = registration.event_tickets;

    const session = await createCheckoutSession({
      registrationId: registration.id,
      amountPhp: finalAmount,
      ticketName: ticket?.name ?? "Ticket",
      eventTitle: event?.title ?? "AYA Event",
      email: registration.email,
      name: registration.full_name,
      phone: registration.mobile_number,
      successUrl: `${siteUrl}/events/confirmation/${registration.id}`,
      cancelUrl: `${siteUrl}/events/${event?.slug ?? ""}`,
    });

    return NextResponse.json({ checkout_url: session.checkoutUrl });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
  }
}
