import { Button, Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout, colors, COMPANY } from "./EmailLayout";

interface AbandonedCartEmailProps {
  fullName: string;
  eventTitle: string;
  eventDate: string;
  eventSlug: string;
  ticketName: string;
  ticketPrice: string;
  registrationId: string;
  paymongoLink?: string | null;
}

export function AbandonedCartEmail({
  fullName,
  eventTitle,
  eventDate,
  eventSlug,
  ticketName,
  ticketPrice,
  registrationId,
  paymongoLink,
}: AbandonedCartEmailProps) {
  return (
    <EmailLayout previewText={`Your spot for ${eventTitle} is waiting — complete your registration`}>
      <Text style={{ margin: "0 0 4px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: colors.GOLD }}>
        Your Spot Is Waiting
      </Text>
      <Heading style={{ margin: "0 0 16px", fontSize: "22px", color: colors.PINE, fontWeight: 400 }}>
        Hey {fullName.split(" ")[0]}, you&apos;re almost in! 🌱
      </Heading>

      <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#1A1E18" }}>
        We noticed you started registering for <strong>{eventTitle}</strong> on {eventDate}, but your payment
        hasn&apos;t come through yet — your slot for <strong>{ticketName}</strong> ({ticketPrice}) is being held,
        but it&apos;s first-come, first-served, so don&apos;t wait too long!
      </Text>

      {paymongoLink && (
        <Section style={{ margin: "20px 0" }}>
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
            Complete Payment via PayMongo →
          </Button>
        </Section>
      )}

      <Text style={{ fontSize: "12px", color: colors.MUTED, lineHeight: "1.7" }}>
        After paying, reply to this email with your proof of payment and registration ID{" "}
        <span style={{ fontFamily: "monospace" }}>{registrationId}</span> — we&apos;ll confirm your ticket
        within 24 hours.
      </Text>

      <Hr style={{ borderColor: colors.FOG, margin: "24px 0" }} />

      <Text style={{ fontSize: "13px", lineHeight: "1.7", color: "#1A1E18" }}>
        Changed your mind, or have questions about the event? Just reply — happy to help. 🌿
      </Text>

      <Button
        href={`${COMPANY.SITE_URL}/events/${eventSlug}`}
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
        View Event Details
      </Button>
    </EmailLayout>
  );
}
