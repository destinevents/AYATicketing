import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const PINE_DEEP = "#1D2219";
const PINE = "#2B3228";
const FOG = "#F0EDE6";
const FOG_WARM = "#FAF8F4";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#DEC270";
const MUTED = "#6B7864";

const COMPANY_NAME = "As You Are Baguio";
const COMPANY_TAGLINE =
  "A community platform for Baguio's creators, entrepreneurs, and ecosystem builders.";
const COMPANY_LOGO_URL =
  process.env.NEXT_PUBLIC_COMPANY_LOGO_URL ||
  `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://aya-baguio.vercel.app"}/images/aya-logo.png`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aya-baguio.vercel.app";

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

/**
 * Branded wrapper for every AYA email — logo, company name, one-line
 * service description, and a consistent footer with unsubscribe-style note.
 * All templates (registration confirmation, payment confirmation,
 * abandoned cart, event reminders, newsletter / custom updates) should
 * use this as their outer shell.
 */
export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: FOG_WARM, fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "520px", margin: "0 auto", padding: "32px 24px" }}>
          {/* Header */}
          <Section style={{ backgroundColor: PINE_DEEP, borderRadius: "10px 10px 0 0", padding: "28px 28px 22px" }}>
            <Img
              src={COMPANY_LOGO_URL}
              alt={COMPANY_NAME}
              width="44"
              height="44"
              style={{ borderRadius: "50%", marginBottom: "12px" }}
            />
            <Text style={{ margin: 0, color: FOG, fontSize: "20px", fontWeight: 400, letterSpacing: "0.01em" }}>
              <span style={{ fontStyle: "italic", color: GOLD_LIGHT }}>As You Are</span> Baguio
            </Text>
            <Text style={{ margin: "4px 0 0", color: "rgba(240,237,230,0.6)", fontSize: "12px", lineHeight: "1.5" }}>
              {COMPANY_TAGLINE}
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: "#ffffff", padding: "32px 28px", borderRadius: "0 0 10px 10px", border: `1px solid ${FOG}`, borderTop: "none" }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ padding: "20px 8px", textAlign: "center" }}>
            <Text style={{ margin: 0, fontSize: "11px", color: MUTED, lineHeight: "1.6" }}>
              {COMPANY_NAME} · Baguio City, Philippines
              <br />
              Powered by{" "}
              <Link href="https://destinevents.biz" style={{ color: GOLD }}>
                Destine Events
              </Link>{" "}
              · Built by{" "}
              <Link href="https://disenyodigitals.com" style={{ color: GOLD }}>
                Disenyo Digitals
              </Link>
            </Text>
            <Hr style={{ borderColor: FOG, margin: "12px 0" }} />
            <Text style={{ margin: 0, fontSize: "10px", color: MUTED }}>
              You&apos;re receiving this because you registered for an AYA Community event or opted into
              community updates. <Link href={`${SITE_URL}/events`} style={{ color: MUTED, textDecoration: "underline" }}>Browse events</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const colors = { PINE_DEEP, PINE, FOG, FOG_WARM, GOLD, GOLD_LIGHT, MUTED };
export const COMPANY = { COMPANY_NAME, COMPANY_TAGLINE, COMPANY_LOGO_URL, SITE_URL };
