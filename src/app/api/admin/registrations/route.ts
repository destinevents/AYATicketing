import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const { registration_id, status } = await request.json();
    if (!registration_id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("registrations")
      .update({ status })
      .eq("id", registration_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
