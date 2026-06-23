import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  join_type: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, join_type } = schema.parse(body);

    const supabase = createAdminClient();

    await supabase.from("community_leads").upsert(
      {
        full_name,
        email,
        join_type: join_type || null,
        joined_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
