"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CheckInResult {
  registration?: {
    id: string;
    full_name: string;
    email: string;
    mobile_number: string;
    business_name: string | null;
    status: string;
    checked_in: boolean;
    checked_in_at: string | null;
    events?: { title: string; slug: string; start_date: string };
    event_tickets?: { name: string; price: number };
    payments?: { status: string }[];
  };
  error?: string;
  warning?: string;
  success?: boolean;
}

export function CheckInDashboard() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill code from ?code= query param (from QR redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get("code");
    if (queryCode) {
      setCode(queryCode);
      void verifyCode(queryCode);
    }
    inputRef.current?.focus();
  }, []);

  async function verifyCode(qrCode: string, action: "verify" | "checkin" = "verify") {
    if (!qrCode.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: qrCode.trim(), action }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    await verifyCode(code, "verify");
  }

  async function handleConfirmCheckIn() {
    await verifyCode(code, "checkin");
  }

  function reset() {
    setCode("");
    setResult(null);
    inputRef.current?.focus();
  }

  const reg = result?.registration;
  const paymentStatus = reg?.payments?.[0]?.status;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Scanner / manual entry */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-2 font-display text-lg text-pine">Scan or Enter Ticket Code</h3>
        <p className="mb-4 text-xs text-muted">
          Scan the attendee&apos;s QR ticket with your device camera (opens the URL with{" "}
          <code className="font-mono">?code=</code>), or type the code manually below.
        </p>

        <form onSubmit={handleManualSubmit} className="mb-4 flex gap-2">
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AYA-XXXXXXXX-XXXXXXXX"
            className="flex-1 rounded-md border border-pine/15 bg-white px-4 py-2.5 font-mono text-sm text-ink outline-none focus:border-pine-mid"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-sm bg-pine px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fog transition-colors hover:bg-pine-mid disabled:opacity-60"
          >
            {loading ? "…" : "Verify"}
          </button>
        </form>

        <button
          onClick={() => setScannerActive((v) => !v)}
          className="w-full rounded-sm border border-pine/15 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-pine transition-colors hover:bg-pine/5"
        >
          {scannerActive ? "Hide Camera" : "📷 Open Camera Scanner"}
        </button>

        {scannerActive && (
          <div className="mt-4 rounded-lg border border-dashed border-pine/15 bg-pine/[0.02] p-6 text-center text-sm text-muted">
            Camera scanning requires a barcode-detection library (e.g.{" "}
            <code className="font-mono text-xs">@zxing/browser</code> or the browser{" "}
            <code className="font-mono text-xs">BarcodeDetector</code> API). Wire up your
            preferred scanner here — it should call{" "}
            <code className="font-mono text-xs">verifyCode(scannedText)</code> on detection.
            For now, attendees can show their QR and staff can type the code manually, or staff
            phones can scan the QR with their native camera app (which opens the{" "}
            <code className="font-mono text-xs">?code=</code> URL directly into this page).
          </div>
        )}
      </div>

      {/* Result panel */}
      <div className="rounded-xl border border-pine/10 bg-white p-5">
        <h3 className="mb-4 font-display text-lg text-pine">Attendee Details</h3>

        {!result && <p className="text-sm text-muted">Scan or enter a code to verify an attendee.</p>}

        {result?.error && (
          <div className="rounded-lg border border-terra/30 bg-terra/5 p-4 text-sm text-terra">{result.error}</div>
        )}

        {reg && (
          <div className="space-y-4">
            {result?.warning && (
              <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm text-terra">{result.warning}</div>
            )}
            {result?.success && (
              <div className="rounded-lg border border-moss/30 bg-moss/10 p-3 text-sm text-moss">✓ Checked in successfully!</div>
            )}

            <div>
              <div className="font-display text-xl text-pine">{reg.full_name}</div>
              <div className="text-sm text-muted">{reg.email} · {reg.mobile_number}</div>
              {reg.business_name && <div className="text-sm text-muted">{reg.business_name}</div>}
            </div>

            {reg.events && (
              <div className="rounded-lg bg-pine/[0.03] p-3 text-sm">
                <div className="font-display text-pine">{reg.events.title}</div>
                <div className="text-xs text-muted">{formatDate(reg.events.start_date)}</div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-pine/5 px-3 py-1 font-mono uppercase tracking-[0.08em] text-muted">
                {reg.event_tickets?.name ?? "—"} · {formatCurrency(reg.event_tickets?.price ?? 0)}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-mono uppercase tracking-[0.08em] ${
                  reg.status === "confirmed" ? "bg-moss/15 text-moss" : "bg-gold/15 text-terra"
                }`}
              >
                {reg.status}
              </span>
              {paymentStatus && (
                <span
                  className={`rounded-full px-3 py-1 font-mono uppercase tracking-[0.08em] ${
                    paymentStatus === "paid" ? "bg-moss/15 text-moss" : "bg-terra/10 text-terra"
                  }`}
                >
                  Payment: {paymentStatus}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 font-mono uppercase tracking-[0.08em] ${
                  reg.checked_in ? "bg-moss/15 text-moss" : "bg-pine/5 text-muted"
                }`}
              >
                {reg.checked_in ? `Checked in${reg.checked_in_at ? ` · ${formatDate(reg.checked_in_at)}` : ""}` : "Not checked in"}
              </span>
            </div>

            {reg.status === "confirmed" && !reg.checked_in && (
              <button
                onClick={handleConfirmCheckIn}
                disabled={loading}
                className="w-full rounded-sm bg-gold px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-60"
              >
                {loading ? "…" : "✓ Confirm Check-In"}
              </button>
            )}

            {reg.status !== "confirmed" && (
              <p className="text-xs text-terra">
                ⚠ Registration status is &quot;{reg.status}&quot; — verify payment before checking in.
              </p>
            )}

            <button onClick={reset} className="w-full rounded-sm border border-pine/15 px-6 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-pine hover:bg-pine/5">
              Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
