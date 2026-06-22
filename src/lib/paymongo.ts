import crypto from "crypto";

const BASE_URL = "https://api.paymongo.com/v1";

function authHeader() {
  return "Basic " + Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");
}

export async function createCheckoutSession({
  registrationId,
  amountPhp,
  ticketName,
  eventTitle,
  email,
  name,
  phone,
  successUrl,
  cancelUrl,
}: {
  registrationId: string;
  amountPhp: number;
  ticketName: string;
  eventTitle: string;
  email: string;
  name: string;
  phone?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const res = await fetch(`${BASE_URL}/checkout_sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: { name, email, phone: phone || undefined },
          line_items: [
            {
              amount: Math.round(amountPhp * 100), // centavos
              currency: "PHP",
              name: `${ticketName} — ${eventTitle}`,
              quantity: 1,
            },
          ],
          payment_method_types: ["gcash", "paymaya", "card", "qrph"],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: { registration_id: registrationId },
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors?.[0]?.detail ?? "PayMongo checkout creation failed");
  }

  const json = await res.json();
  return {
    sessionId: json.data.id as string,
    checkoutUrl: json.data.attributes.checkout_url as string,
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string])
  );
  const timestamp = parts["t"];
  const liveSig = parts["li"];
  const testSig = parts["te"];
  if (!timestamp || (!liveSig && !testSig)) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return expected === liveSig || expected === testSig;
}
