import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendPaymentConfirmedEmail } from "@/lib/email/send";
import { z } from "zod";

const bodySchema = z.object({
  payment_id: z.string().uuid(),
  status: z.enum(["pending", "paid", "cancelled", "refunded"]),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * PATCH /api/payments
 * Admin-only — updates a payment's status (Pending / Paid / Cancelled / Refunded).
 * Relies on RLS: only rows in `admin_users` can update `payments`.
 *
 * When status -> "paid": also confirms the linked registration (if it
 * was "pending") and sends the branded payment-confirmation email
 * (with QR ticket) via Resend.
 */
export async function PATCH(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: payment, error } = await supabase
      .from("payments")
      .update({
        status: body.status,
        reference_number: body.reference_number,
        notes: body.notes,
        paid_at: body.status === "paid" ? new Date().toISOString() : null,
        verified_by: user.user.id,
      })
      .eq("id", body.payment_id)
      .select()
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: error?.message ?? "Payment not found." }, { status: 500 });
    }

    // Sync registration status to match payment status
    const regStatusMap: Record<string, string> = {
      paid: "confirmed",
      pending: "pending",
      cancelled: "cancelled",
      refunded: "cancelled",
    };
    const newRegStatus = regStatusMap[body.status];

    if (newRegStatus) {
      const admin = createAdminClient();

      const { data: registration } = await admin
        .from("registrations")
        .select("*")
        .eq("id", payment.registration_id)
        .single();

      if (registration) {
        let updatedRegistration = registration;

        if (registration.status !== newRegStatus) {
          const { data: synced } = await admin
            .from("registrations")
            .update({ status: newRegStatus })
            .eq("id", registration.id)
            .select()
            .single();
          if (synced) updatedRegistration = synced;
        }

        // Send confirmation email only when paid
        if (body.status === "paid") {
          const [{ data: event }, { data: ticket }] = await Promise.all([
            admin.from("events").select("*").eq("id", updatedRegistration.event_id).single(),
            admin.from("event_tickets").select("*").eq("id", updatedRegistration.ticket_id).single(),
          ]);
          if (event && ticket) {
            await sendPaymentConfirmedEmail(updatedRegistration, event, ticket);
          }
        }
      }
    }

    return NextResponse.json({ payment });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
