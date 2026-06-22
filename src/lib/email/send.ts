import { render } from "@react-email/render";
import { getResendClient, EMAIL_FROM } from "./resend";
import { createAdminClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { generateQrDataUrl } from "@/lib/qrcode";
import type { EmailType, EventRecord, EventTicketRecord, RegistrationRecord } from "@/lib/types";

import { RegistrationConfirmationEmail } from "./templates/RegistrationConfirmationEmail";
import { PaymentConfirmedEmail } from "./templates/PaymentConfirmedEmail";
import { AbandonedCartEmail } from "./templates/AbandonedCartEmail";
import { CustomUpdateEmail } from "./templates/CustomUpdateEmail";

const PAYMONGO_LINK = process.env.NEXT_PUBLIC_PAYMONGO_PAYMENT_LINK || null;

interface LogParams {
  registration_id?: string | null;
  attendee_id?: string | null;
  email_type: EmailType;
  recipient_email: string;
  subject: string;
}

async function logEmail(params: LogParams, result: { status: "sent" | "failed" | "skipped"; error?: string; messageId?: string }) {
  try {
    const supabase = createAdminClient();
    await supabase.from("email_logs").insert({
      registration_id: params.registration_id ?? null,
      attendee_id: params.attendee_id ?? null,
      email_type: params.email_type,
      recipient_email: params.recipient_email,
      subject: params.subject,
      status: result.status,
      error_message: result.error ?? null,
      provider_message_id: result.messageId ?? null,
    });
  } catch (e) {
    // Logging failures shouldn't break the calling flow
    console.error("Failed to write email_logs row:", e);
  }
}

/**
 * Sends the registration confirmation email (includes QR ticket).
 * Used right after a registration is created — works for both
 * free (auto-confirmed) and paid (pending) tickets.
 */
export async function sendRegistrationConfirmationEmail(
  registration: RegistrationRecord,
  event: EventRecord,
  ticket: EventTicketRecord,
  isPaid: boolean
) {
  const resend = getResendClient();
  const subject = isPaid
    ? `You're confirmed: ${event.title} 🌿`
    : `Registration received: ${event.title}`;

  if (!resend) {
    await logEmail(
      { registration_id: registration.id, attendee_id: registration.attendee_id, email_type: "registration_confirmation", recipient_email: registration.email, subject },
      { status: "skipped", error: "RESEND_API_KEY not configured" }
    );
    return;
  }

  const qrDataUrl = registration.qr_code ? await generateQrDataUrl(registration.qr_code) : "";

  const html = await render(
    RegistrationConfirmationEmail({
      fullName: registration.full_name,
      eventTitle: event.title,
      eventDate: formatDate(event.start_date),
      eventTime: `${formatTime(event.start_date)}${event.end_date ? ` – ${formatTime(event.end_date)}` : ""}`,
      venueName: event.venue_name ?? "Venue TBA",
      ticketName: ticket.name,
      ticketPrice: formatCurrency(ticket.price),
      qrCodeDataUrl: qrDataUrl,
      qrCodeToken: registration.qr_code ?? "",
      registrationId: registration.id,
      isPaid,
      paymongoLink: PAYMONGO_LINK,
    })
  );

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: registration.email,
      subject,
      html,
    });

    await logEmail(
      { registration_id: registration.id, attendee_id: registration.attendee_id, email_type: "registration_confirmation", recipient_email: registration.email, subject },
      error ? { status: "failed", error: error.message } : { status: "sent", messageId: data?.id }
    );
  } catch (e) {
    await logEmail(
      { registration_id: registration.id, attendee_id: registration.attendee_id, email_type: "registration_confirmation", recipient_email: registration.email, subject },
      { status: "failed", error: e instanceof Error ? e.message : "Unknown error" }
    );
  }
}

/**
 * Sends the payment-confirmed email — call this when an admin marks
 * a payment as "paid" (registration status becomes "confirmed").
 */
export async function sendPaymentConfirmedEmail(
  registration: RegistrationRecord,
  event: EventRecord,
  ticket: EventTicketRecord
) {
  const resend = getResendClient();
  const subject = `Payment confirmed: ${event.title} 🌿`;

  if (!resend) {
    await logEmail(
      { registration_id: registration.id, attendee_id: registration.attendee_id, email_type: "payment_confirmation", recipient_email: registration.email, subject },
      { status: "skipped", error: "RESEND_API_KEY not configured" }
    );
    return;
  }

  const qrDataUrl = registration.qr_code ? await generateQrDataUrl(registration.qr_code) : "";

  const html = await render(
    PaymentConfirmedEmail({
      fullName: registration.full_name,
      eventTitle: event.title,
      eventDate: formatDate(event.start_date),
      eventTime: `${formatTime(event.start_date)}${event.end_date ? ` – ${formatTime(event.end_date)}` : ""}`,
      venueName: event.venue_name ?? "Venue TBA",
      ticketName: ticket.name,
      ticketPrice: formatCurrency(ticket.price),
      qrCodeDataUrl: qrDataUrl,
      qrCodeToken: registration.qr_code ?? "",
      archetype: registration.archetype as "founder" | "creative" | "community_builder" | "enabler" | null,
    })
  );

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: registration.email,
      subject,
      html,
    });

    await logEmail(
      { registration_id: registration.id, attendee_id: registration.attendee_id, email_type: "payment_confirmation", recipient_email: registration.email, subject },
      error ? { status: "failed", error: error.message } : { status: "sent", messageId: data?.id }
    );
  } catch (e) {
    await logEmail(
      { registration_id: registration.id, attendee_id: registration.attendee_id, email_type: "payment_confirmation", recipient_email: registration.email, subject },
      { status: "failed", error: e instanceof Error ? e.message : "Unknown error" }
    );
  }
}

interface AbandonedCartParams {
  registration_id: string;
  full_name: string;
  email: string;
  event_title: string;
  event_slug: string;
  event_start_date: string;
  ticket_name: string;
  ticket_price: number;
}

/**
 * Sends an abandoned-cart reminder for a registration that's been
 * "pending" (unpaid) for 2+ hours. Called from the abandoned-carts
 * cron route — one row from the `abandoned_registrations` view.
 */
export async function sendAbandonedCartEmail(reg: AbandonedCartParams) {
  const resend = getResendClient();
  const subject = `Your spot for ${reg.event_title} is waiting 🌱`;

  if (!resend) {
    await logEmail(
      { registration_id: reg.registration_id, email_type: "abandoned_cart_reminder", recipient_email: reg.email, subject },
      { status: "skipped", error: "RESEND_API_KEY not configured" }
    );
    return;
  }

  const html = await render(
    AbandonedCartEmail({
      fullName: reg.full_name,
      eventTitle: reg.event_title,
      eventDate: formatDate(reg.event_start_date),
      eventSlug: reg.event_slug,
      ticketName: reg.ticket_name,
      ticketPrice: formatCurrency(reg.ticket_price),
      registrationId: reg.registration_id,
      paymongoLink: PAYMONGO_LINK,
    })
  );

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: reg.email,
      subject,
      html,
    });

    await logEmail(
      { registration_id: reg.registration_id, email_type: "abandoned_cart_reminder", recipient_email: reg.email, subject },
      error ? { status: "failed", error: error.message } : { status: "sent", messageId: data?.id }
    );
  } catch (e) {
    await logEmail(
      { registration_id: reg.registration_id, email_type: "abandoned_cart_reminder", recipient_email: reg.email, subject },
      { status: "failed", error: e instanceof Error ? e.message : "Unknown error" }
    );
  }
}

interface CustomUpdateParams {
  attendee_id?: string | null;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  body_paragraphs: string[];
  cta_label?: string | null;
  cta_url?: string | null;
  email_type?: EmailType; // defaults to "custom_update"
}

/**
 * Sends a custom community update / newsletter email to one recipient.
 * Used by the admin "Send Update" tool (bulk-calls this per recipient)
 * and can be reused for event reminders.
 */
export async function sendCustomUpdateEmail(params: CustomUpdateParams) {
  const resend = getResendClient();
  const emailType = params.email_type ?? "custom_update";

  if (!resend) {
    await logEmail(
      { attendee_id: params.attendee_id, email_type: emailType, recipient_email: params.recipient_email, subject: params.subject },
      { status: "skipped", error: "RESEND_API_KEY not configured" }
    );
    return { status: "skipped" as const };
  }

  const html = await render(
    CustomUpdateEmail({
      recipientName: params.recipient_name,
      subject: params.subject,
      bodyParagraphs: params.body_paragraphs,
      ctaLabel: params.cta_label,
      ctaUrl: params.cta_url,
    })
  );

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.recipient_email,
      subject: params.subject,
      html,
    });

    await logEmail(
      { attendee_id: params.attendee_id, email_type: emailType, recipient_email: params.recipient_email, subject: params.subject },
      error ? { status: "failed", error: error.message } : { status: "sent", messageId: data?.id }
    );

    return error ? { status: "failed" as const, error: error.message } : { status: "sent" as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await logEmail(
      { attendee_id: params.attendee_id, email_type: emailType, recipient_email: params.recipient_email, subject: params.subject },
      { status: "failed", error: message }
    );
    return { status: "failed" as const, error: message };
  }
}
