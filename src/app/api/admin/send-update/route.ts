import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendCustomUpdateEmail } from "@/lib/email/send";
import { z } from "zod";

const bodySchema = z.object({
  subject: z.string().min(3),
  body_paragraphs: z.array(z.string().min(1)).min(1),
  cta_label: z.string().optional(),
  cta_url: z.string().optional(),
  segment: z.enum(["newsletter", "networking", "all", "archetype", "event"]),
  archetype: z.enum(["founder", "creative", "community_builder", "enabler"]).optional(),
  event_id: z.string().uuid().optional(),
});

/**
 * POST /api/admin/send-update
 * Admin-only — composes and sends a branded "Community Update" email
 * to a segment of the Community CRM (attendees table).
 *
 * Segments:
 *  - "newsletter"  → attendees with newsletter_opt_in = true
 *  - "networking"  → attendees with networking_opt_in = true
 *  - "all"         → every attendee
 *  - "archetype"   → attendees with a specific archetype (F/C/CB/E)
 *  - "event"       → everyone registered for a specific event
 */
export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const admin = createAdminClient();

    let recipients: { id: string; full_name: string; email: string }[] = [];

    if (body.segment === "event") {
      if (!body.event_id) {
        return NextResponse.json({ error: "event_id is required for the 'event' segment." }, { status: 400 });
      }
      const { data } = await admin
        .from("registrations")
        .select("attendee_id, full_name, email, attendees(id, full_name, email)")
        .eq("event_id", body.event_id)
        .eq("status", "confirmed");

      const seen = new Set<string>();
      for (const r of data ?? []) {
        if (seen.has(r.email)) continue;
        seen.add(r.email);
        recipients.push({ id: r.attendee_id ?? r.email, full_name: r.full_name, email: r.email });
      }
    } else {
      let query = admin.from("attendees").select("id, full_name, email, archetype, newsletter_opt_in, networking_opt_in");

      if (body.segment === "newsletter") query = query.eq("newsletter_opt_in", true);
      if (body.segment === "networking") query = query.eq("networking_opt_in", true);
      if (body.segment === "archetype") {
        if (!body.archetype) {
          return NextResponse.json({ error: "archetype is required for the 'archetype' segment." }, { status: 400 });
        }
        query = query.eq("archetype", body.archetype);
      }

      const { data } = await query;
      recipients = (data ?? []).map((a) => ({ id: a.id, full_name: a.full_name, email: a.email }));
    }

    if (recipients.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, total: 0, message: "No recipients matched this segment." });
    }

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const result = await sendCustomUpdateEmail({
        attendee_id: recipient.id,
        recipient_name: recipient.full_name,
        recipient_email: recipient.email,
        subject: body.subject,
        body_paragraphs: body.body_paragraphs,
        cta_label: body.cta_label || null,
        cta_url: body.cta_url || null,
      });

      if (result.status === "sent") sent += 1;
      else failed += 1;
    }

    return NextResponse.json({ sent, failed, total: recipients.length });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
