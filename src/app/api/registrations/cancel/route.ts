import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { registration_id } = await request.json();
    if (!registration_id) {
      return NextResponse.json({ error: "Missing registration_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Cancel registration
    await supabase
      .from("registrations")
      .update({ status: "cancelled" })
      .eq("id", registration_id);

    // Cancel any pending payment too
    await supabase
      .from("payments")
      .update({ status: "cancelled" })
      .eq("registration_id", registration_id)
      .eq("status", "pending");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
