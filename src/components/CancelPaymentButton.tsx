"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelPaymentButton({ registrationId }: { registrationId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/payments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registration_id: registrationId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not cancel payment.");
      return;
    }
    router.push(`/events/confirmation/${registrationId}?payment=cancelled`);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="mt-3 w-full rounded-md border border-terra/30 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-terra/70 transition-colors hover:border-terra hover:text-terra"
      >
        Cancel payment
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-terra/30 bg-terra/5 p-4 text-center">
      <p className="mb-3 text-sm text-ink/80">
        Cancel this payment? Your registration stays saved — you can pay again any time.
      </p>
      {error && <p className="mb-2 text-xs text-terra">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-md border border-pine/15 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted hover:text-pine"
        >
          Keep it
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 rounded-md bg-terra/80 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white transition-colors hover:bg-terra disabled:opacity-60"
        >
          {loading ? "Cancelling…" : "Yes, cancel"}
        </button>
      </div>
    </div>
  );
}
