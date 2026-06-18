"use client";

import { useState } from "react";

export function PayNowButton({ registrationId }: { registrationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: registrationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");
      window.location.href = data.checkout_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mb-4">
      <button
        onClick={handleClick}
        disabled={loading}
        className="block w-full rounded-sm bg-gold px-6 py-3.5 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Pay Now via PayMongo →"}
      </button>
      {error && <p className="mt-2 text-xs text-terra">{error}</p>}
    </div>
  );
}
