import { Resend } from "resend";

let _resend: Resend | null = null;

/**
 * Lazily-initialized Resend client. Returns null if RESEND_API_KEY
 * isn't configured yet — callers should handle this gracefully
 * (log + skip) so the app works before email is set up.
 */
export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "As You Are Baguio <hello@disenyodigitals.com>";
