import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { expireCheckoutSession } from "@/lib/paymongo";

export async function POST(request: Request) {
  try {
    const { registration_id } = await request.json();
    if (!registration_id) {
      return NextResponse.json({ error: "Missing registration_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: payment } = await supabase
      .from("payments")
      .select("id, status, checkout_session_id")
      .eq("registration_id", registration_id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: "Payment cannot be cancelled — it is already " + payment.status + "." },
        { status: 409 }
      );
    }

    // Ask PayMongo to expire the checkout session so the link can't be paid
    if (payment.checkout_session_id) {
      await expireCheckoutSession(payment.checkout_session_id);
    }

    await supabase
      .from("payments")
      .update({ status: "cancelled" })
      .eq("id", payment.id);

    // Registration stays 'pending' — user can restart checkout from the confirmation page

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
