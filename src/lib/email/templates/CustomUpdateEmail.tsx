import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, colors, COMPANY } from "./EmailLayout";

interface CustomUpdateEmailProps {
  recipientName: string;
  subject: string;
  bodyParagraphs: string[]; // each string = one paragraph
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}

/**
 * Used for:
 * - Admin "Send Updates" to attendees / newsletter subscribers
 * - Event reminders (1-2 paragraphs, optional CTA to event page)
 * - General community announcements
 */
export function CustomUpdateEmail({
  recipientName,
  subject,
  bodyParagraphs,
  ctaLabel,
  ctaUrl,
}: CustomUpdateEmailProps) {
  return (
    <EmailLayout previewText={subject}>
      <Text style={{ margin: "0 0 4px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: colors.GOLD }}>
        AYA Community Update
      </Text>
      <Heading style={{ margin: "0 0 16px", fontSize: "22px", color: colors.PINE, fontWeight: 400 }}>
        {subject}
      </Heading>

      <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#1A1E18" }}>
        Hi {recipientName.split(" ")[0]},
      </Text>

      {bodyParagraphs.map((p, i) => (
        <Text key={i} style={{ fontSize: "14px", lineHeight: "1.7", color: "#1A1E18" }}>
          {p}
        </Text>
      ))}

      {ctaLabel && ctaUrl && (
        <Section style={{ margin: "20px 0" }}>
          <Button
            href={ctaUrl}
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
            {ctaLabel}
          </Button>
        </Section>
      )}

      <Text style={{ fontSize: "13px", lineHeight: "1.7", color: colors.MUTED, marginTop: "20px" }}>
        With gratitude,
        <br />
        The {COMPANY.COMPANY_NAME} Team 🌿
      </Text>
    </EmailLayout>
  );
}
