import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const querySchema = z.object({
  code: z.string().min(1),
  ticket_price: z.coerce.number().min(0),
  event_id: z.string().uuid().optional(),
});

/**
 * GET /api/promo?code=AYAMEMBER30&ticket_price=500&event_id=optional
 *
 * Validates a promo code and returns the discount amount.
 * Called in real-time from the registration form as the user types.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { code, ticket_price, event_id } = querySchema.parse({
      code: searchParams.get("code"),
      ticket_price: searchParams.get("ticket_price"),
      event_id: searchParams.get("event_id") ?? undefined,
    });

    const supabase = await createClient();

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !promo) {
      return NextResponse.json({ valid: false, error: "Invalid promo code." }, { status: 404 });
    }

    // Check event scope
    if (promo.event_id && promo.event_id !== event_id) {
      return NextResponse.json({ valid: false, error: "This code is not valid for this event." }, { status: 400 });
    }

    // Check usage limit
    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit." }, { status: 400 });
    }

    // Check validity window
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return NextResponse.json({ valid: false, error: "This promo code is not active yet." }, { status: 400 });
    }
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return NextResponse.json({ valid: false, error: "This promo code has expired." }, { status: 400 });
    }

    // Calculate discount
    let discount_amount = 0;
    if (promo.discount_type === "percentage") {
      discount_amount = Math.round((ticket_price * promo.discount_value) / 100);
    } else {
      discount_amount = Math.min(promo.discount_value, ticket_price);
    }
    const final_amount = Math.max(ticket_price - discount_amount, 0);

    return NextResponse.json({
      valid: true,
      promo_code_id: promo.id,
      code: promo.code,
      description: promo.description,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount_amount,
      final_amount,
      label: promo.discount_type === "percentage"
        ? `${promo.discount_value}% off`
        : `₱${promo.discount_value} off`,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ valid: false, error: "Missing required fields." }, { status: 400 });
    }
    return NextResponse.json({ valid: false, error: "Something went wrong." }, { status: 500 });
  }
}
