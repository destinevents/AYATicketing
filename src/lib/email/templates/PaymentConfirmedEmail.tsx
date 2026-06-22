import { Heading, Hr, Img, Section, Text, Html, Head, Preview, Body, Container, Link } from "@react-email/components";

type Archetype = "founder" | "creative" | "community_builder" | "enabler" | null | undefined;

const ARCHETYPES = {
  founder: {
    label: "Founder",
    code: "F",
    tagline: "Builder of the thing.",
    question: "\"What are you building, and why?\"",
    emoji: "🧠",
    heroBg: "#111111",
    heroColor: "#F5ECE0",
    badgeBg: "#C9A84C",
    badgeColor: "#111111",
    accentColor: "#C9A84C",
  },
  creative: {
    label: "Creative",
    code: "C",
    tagline: "Builder of meaning, story & experience.",
    question: "\"How does this feel / look / land?\"",
    emoji: "🎨",
    heroBg: "#2C1008",
    heroColor: "#F5ECE0",
    badgeBg: "#8B3A1A",
    badgeColor: "#F5ECE0",
    accentColor: "#C4622D",
  },
  community_builder: {
    label: "Community Builder",
    code: "CB",
    tagline: "Builder of connection between people.",
    question: "\"Who else should be in this room?\"",
    emoji: "🤝",
    heroBg: "#1A2E1A",
    heroColor: "#E8F0E8",
    badgeBg: "#2E4A2E",
    badgeColor: "#7AAD6A",
    accentColor: "#7AAD6A",
  },
  enabler: {
    label: "Enabler",
    code: "E",
    tagline: "Builder of infrastructure.",
    question: "\"What's blocking this from happening?\"",
    emoji: "⚙️",
    heroBg: "#F0EBE0",
    heroColor: "#1A1E18",
    badgeBg: "#1A1E18",
    badgeColor: "#F0EBE0",
    accentColor: "#1A1E18",
  },
};

const DEFAULT = {
  label: "",
  code: "",
  tagline: "",
  question: "",
  emoji: "🌿",
  heroBg: "#1D2219",
  heroColor: "#F0EDE6",
  badgeBg: "#C9A84C",
  badgeColor: "#1D2219",
  accentColor: "#C9A84C",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://asyouarebaguio.com";
const GOLD = "#C9A84C";
const MUTED = "#6B7864";
const FOG = "#F0EDE6";

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
  archetype?: Archetype;
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
  archetype,
}: PaymentConfirmedEmailProps) {
  const a = (archetype && ARCHETYPES[archetype]) ?? DEFAULT;
  const firstName = fullName.split(" ")[0];

  return (
    <Html>
      <Head />
      <Preview>Your seat is confirmed — {eventTitle}</Preview>
      <Body style={{ backgroundColor: "#FAF8F4", fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "520px", margin: "0 auto", padding: "32px 24px" }}>

          {/* Archetype Hero */}
          <Section style={{ backgroundColor: a.heroBg, borderRadius: "10px 10px 0 0", padding: "32px 28px 28px", position: "relative" }}>
            {/* Badge */}
            {a.code && (
              <Text style={{
                margin: "0 0 24px",
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                backgroundColor: a.badgeBg,
                color: a.badgeColor,
                border: `1px solid ${a.badgeColor}`,
                fontFamily: "monospace",
              }}>
                {a.code} · {a.label}
              </Text>
            )}

            {/* Seat confirmed label */}
            <Text style={{ margin: "0 0 4px", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: a.accentColor, fontFamily: "monospace" }}>
              + Seat Confirmed +
            </Text>

            {/* Hero headline */}
            <Heading style={{ margin: "0 0 4px", fontSize: "42px", fontWeight: 300, color: a.heroColor, lineHeight: 1.1, fontStyle: "italic" }}>
              Your seat
            </Heading>
            <Heading style={{ margin: "0 0 16px", fontSize: "42px", fontWeight: 300, color: a.heroColor, lineHeight: 1.1, fontStyle: "italic" }}>
              is reserved.
            </Heading>

            <Text style={{ margin: "0 0 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: `${a.heroColor}99`, fontFamily: "monospace" }}>
              {eventTitle} · {eventDate}
            </Text>

            {/* Archetype card */}
            {a.tagline && (
              <Section style={{
                borderLeft: `3px solid ${a.accentColor}`,
                paddingLeft: "16px",
                marginTop: "8px",
              }}>
                <Text style={{ margin: "0 0 4px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: a.accentColor, fontFamily: "monospace" }}>
                  {a.code} · {a.label}
                </Text>
                <Text style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700, color: a.heroColor, lineHeight: 1.3 }}>
                  {a.emoji} {a.tagline}
                </Text>
                <Text style={{ margin: 0, fontSize: "13px", fontStyle: "italic", color: `${a.heroColor}CC` }}>
                  {a.question}
                </Text>
              </Section>
            )}
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: "#ffffff", padding: "32px 28px", border: `1px solid ${FOG}`, borderTop: "none" }}>

            <Text style={{ margin: "0 0 4px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD }}>
              Payment Confirmed
            </Text>
            <Heading style={{ margin: "0 0 16px", fontSize: "22px", color: "#1D2219", fontWeight: 400 }}>
              You&apos;re all set, {firstName}! 🌿
            </Heading>
            <Text style={{ fontSize: "14px", lineHeight: "1.7", color: "#1A1E18" }}>
              We&apos;ve verified your payment for <strong>{eventTitle}</strong>. Your QR ticket below is now fully confirmed — see you there!
            </Text>

            {/* QR Ticket */}
            <Section style={{ textAlign: "center", margin: "24px 0", padding: "20px", backgroundColor: FOG, borderRadius: "10px" }}>
              {qrCodeDataUrl ? (
                <Img src={qrCodeDataUrl} alt="QR Ticket" width="180" height="180" style={{ margin: "0 auto", borderRadius: "8px" }} />
              ) : (
                <Text style={{ margin: "0 0 8px", fontSize: "12px", color: MUTED }}>QR code loading…</Text>
              )}
              <Text style={{ margin: "10px 0 0", fontSize: "11px", fontFamily: "monospace", color: MUTED }}>{qrCodeToken}</Text>
              <Text style={{
                display: "inline-block",
                margin: "8px 0 0",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                backgroundColor: "rgba(122,155,106,0.15)",
                color: "#5C7A52",
              }}>
                Confirmed
              </Text>
            </Section>

            <Hr style={{ borderColor: FOG, margin: "20px 0" }} />

            {/* Event details */}
            <Row label="Event" value={eventTitle} />
            <Row label="Date" value={eventDate} />
            <Row label="Time" value={eventTime} />
            <Row label="Venue" value={venueName} />
            <Row label="Ticket" value={`${ticketName} · ${ticketPrice}`} />

            <Hr style={{ borderColor: FOG, margin: "24px 0" }} />

            <Text style={{ fontSize: "13px", lineHeight: "1.7", color: MUTED }}>
              Bring this QR code (digital or printed) for quick check-in at the venue. See you soon!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ borderRadius: "0 0 10px 10px", backgroundColor: "#1D2219", padding: "20px 28px", textAlign: "center" }}>
            <Text style={{ margin: "0 0 4px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,237,230,0.5)", fontFamily: "monospace" }}>
              ASYOUAREBAGUIO (AYA)
            </Text>
            <Text style={{ margin: "0 0 4px", fontSize: "11px", color: "rgba(240,237,230,0.5)", fontFamily: "monospace" }}>
              × DESTINE EVENTS
            </Text>
            <Text style={{ margin: 0, fontSize: "11px", color: GOLD, fontFamily: "monospace" }}>
              JENNCASTRO@DESTINEVENTS.BIZ
            </Text>
            <Hr style={{ borderColor: "rgba(240,237,230,0.1)", margin: "16px 0" }} />
            <Text style={{ margin: 0, fontSize: "10px", color: "rgba(240,237,230,0.3)" }}>
              You&apos;re receiving this because you registered for an AYA Community event.{" "}
              <Link href={`${SITE_URL}/events`} style={{ color: "rgba(240,237,230,0.4)", textDecoration: "underline" }}>Browse events</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ margin: "4px 0", fontSize: "13px", color: "#1A1E18" }}>
      <span style={{ display: "inline-block", width: "70px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, verticalAlign: "top" }}>
        {label}
      </span>{" "}
      {value}
    </Text>
  );
}
