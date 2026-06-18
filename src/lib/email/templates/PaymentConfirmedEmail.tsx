import { Button, Heading, Hr, Img, Section, Text } from "@react-email/components";
import { EmailLayout, colors, COMPANY } from "./EmailLayout";

interface PaymentConfirmedEmailProps {
  fullName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  ticketName: string;
  ticketPrice: string;
  qrCodeDataUrl: string;
  qrCodeToken: string;
}

export function PaymentConfirmedEmail({
  fullName,
  eventTitle,
  eventDate,
  eventTime,
  venueName,
  ticketName,
  ticketPrice,
  qrCodeDataUrl,
  qrCodeToken,
}: PaymentConfirmedEmailProps) {
  return (
    <EmailLayout previewText={`Payment confirmed — your ${eventTitle} ticket is ready!`}>
      <Text style={{ margin: "0 0 4px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: colors.GOLD }}>
        Payment Confirmed
      </Text>
      <Heading style={{ margin: "0 0 16px", fontSize: "22px", color: colors.PINE, fontWeight: 400 }}>
        You&apos;re all set, {fullName.split(" ")[0]}! 🌿
      </Heading>

      <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#1A1E18" }}>
        We&apos;ve verified your payment for <strong>{eventTitle}</strong>. Your QR ticket below is now fully
        confirmed — see you there!
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
            backgroundColor: "rgba(122,155,106,0.15)",
            color: "#5C7A52",
          }}
        >
          Confirmed
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

      <Hr style={{ borderColor: colors.FOG, margin: "24px 0" }} />

      <Text style={{ fontSize: "13px", lineHeight: "1.7", color: colors.MUTED }}>
        Bring this QR code (digital or printed) for quick check-in. See you soon!
      </Text>

      <Button
        href={`${COMPANY.SITE_URL}/events`}
        style={{
          marginTop: "12px",
          backgroundColor: colors.GOLD,
          color: colors.PINE_DEEP,
          fontSize: "12px",
          fontWeight: 600,
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
