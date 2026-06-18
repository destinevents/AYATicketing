import QRCode from "qrcode";

/**
 * Generates a QR code as a base64 data URL for a given token.
 * The QR encodes a verification URL that the admin check-in
 * dashboard can scan and validate against `registrations.qr_code`.
 */
export async function generateQrDataUrl(qrCode: string): Promise<string> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://aya-baguio.vercel.app"}/admin/checkin?code=${encodeURIComponent(
    qrCode
  )}`;

  return QRCode.toDataURL(verifyUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: "#2B3228", // pine
      light: "#F0EDE6", // fog
    },
  });
}

/**
 * Generates a QR code as an SVG string — useful for emails
 * or printable tickets where a data URL is too heavy.
 */
export async function generateQrSvg(qrCode: string): Promise<string> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://aya-baguio.vercel.app"}/admin/checkin?code=${encodeURIComponent(
    qrCode
  )}`;

  return QRCode.toString(verifyUrl, {
    type: "svg",
    width: 300,
    margin: 2,
    color: {
      dark: "#2B3228",
      light: "#F0EDE6",
    },
  });
}
