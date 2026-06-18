import { Button, Heading, Hr, Img, Section, Text } from "@react-email/components";
import { EmailLayout, colors, COMPANY } from "./EmailLayout";

interface RegistrationConfirmationEmailProps {
  fullName: string;
  eventTitle: string;
  eventDate: string; // pre-formatted, e.g. "June 28, 2026"
  eventTime: string; // pre-formatted, e.g. "3:00 PM – 5:00 PM"
  venueName: string;
  ticketName: string;
  ticketPrice: string; // pre-formatted, e.g. "₱500" or "Free"
  qrCodeDataUrl: string; // base64 data URL
  qrCodeToken: string;
  registrationId: string;
  isPaid: boolean;
  paymongoLink?: string | null;
}

export function RegistrationConfirmationEmail({
  fullName,
  eventTitle,
  eventDate,
  eventTime,
  venueName,
  ticketName,
  ticketPrice,
  qrCodeDataUrl,
  qrCodeToken,
  registrationId,
  isPaid,
  paymongoLink,
}: RegistrationConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`Your AYA ticket for ${eventTitle} is ready`}>
      <Text style={{ margin: "0 0 4px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: colors.GOLD }}>
        {isPaid ? "You're confirmed!" : "Registration received"}
      </Text>
      <Heading style={{ margin: "0 0 16px", fontSize: "22px", color: colors.PINE, fontWeight: 400 }}>
        Hi {fullName.split(" ")[0]}, see you at {eventTitle}! 🌿
      </Heading>

      <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#1A1E18" }}>
        {isPaid
          ? "Your registration is confirmed. Your QR ticket is below — save this email or screenshot the code for check-in."
          : "We've received your registration. Your QR ticket is below, but it will be marked confirmed once your payment is verified."}
      </Text>

      <Section style={{ textAlign: "center", margin: "24px 0", padding: "20px", backgroundColor: colors.FOG, borderRadius: "10px" }}>
        <Img src={qrCodeDataUrl} alt="QR Ticket" width="180" height="180" style={{ margin: "0 auto", borderRadius: "8px" }} />
        <Text style={{ margin: "10px 0 0", fontSize: "11px", fontFamily: "monospace", color: colors.MUTED }}>{qrCodeToken}</Text>
        <Text
          style={{
            display: "inline-block",
            margin: "8px 0 0",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            backgroundColor: isPaid ? "rgba(122,155,106,0.15)" : "rgba(201,168,76,0.15)",
            color: isPaid ? "#5C7A52" : "#8B4A35",
          }}
        >
          {isPaid ? "Confirmed" : "Pending Payment"}
        </Text>
      </Section>

      <Hr style={{ borderColor: colors.FOG, margin: "20px 0" }} />

      <Section>
        <Row label="Event" value={eventTitle} />
        <Row label="Date" value={eventDate} />
        <Row label="Time" value={eventTime} />
        <Row label="Venue" value={venueName} />
        <Row label="Ticket" value={`${ticketName} · ${ticketPrice}`} />
      </Section>

      {!isPaid && paymongoLink && (
        <Section style={{ margin: "24px 0 0" }}>
          <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#1A1E18" }}>
            To confirm your slot, complete payment via PayMongo (card, GCash, or Maya):
          </Text>
          <Button
            href={paymongoLink}
            style={{
              backgroundColor: colors.GOLD,
              color: colors.PINE_DEEP,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "14px 28px",
              borderRadius: "4px",
              textDecoration: "none",
              display: "block",
              textAlign: "center",
            }}
          >
            Pay Now via PayMongo →
          </Button>
          <Text style={{ fontSize: "11px", color: colors.MUTED, marginTop: "10px" }}>
            After paying, reply to this email with your proof of payment and registration ID{" "}
            <span style={{ fontFamily: "monospace" }}>{registrationId}</span> so we can confirm your ticket.
          </Text>
        </Section>
      )}

      <Hr style={{ borderColor: colors.FOG, margin: "24px 0" }} />

      <Text style={{ fontSize: "13px", lineHeight: "1.7", color: colors.MUTED }}>
        Questions about this event? Just reply to this email — we&apos;re a small team and read everything. 🌱
      </Text>

      <Button
        href={`${COMPANY.SITE_URL}/events`}
        style={{
          marginTop: "12px",
          backgroundColor: "transparent",
          border: `1px solid ${colors.PINE}`,
          color: colors.PINE,
          fontSize: "12px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "12px 24px",
          borderRadius: "4px",
          textDecoration: "none",
          display: "block",
          textAlign: "center",
        }}
      >
        Browse More AYA Events
      </Button>
    </EmailLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ margin: "4px 0", fontSize: "13px", color: "#1A1E18" }}>
      <span style={{ display: "inline-block", width: "70px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: colors.MUTED, verticalAlign: "top" }}>
        {label}
      </span>{" "}
      {value}
    </Text>
  );
}
