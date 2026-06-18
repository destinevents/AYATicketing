"use client";

import { useState, useRef } from "react";
import { formatCurrency } from "@/lib/utils";

interface PromoResult {
  valid: boolean;
  promo_code_id?: string;
  code?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  final_amount?: number;
  label?: string;
  error?: string;
}

interface PromoCodeInputProps {
  ticketPrice: number;
  eventId: string;
  onApply: (result: PromoResult | null) => void;
}

export function PromoCodeInput({ ticketPrice, eventId, onApply }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PromoResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function validateCode(value: string) {
    if (!value.trim()) {
      setResult(null);
      onApply(null);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(
        `/api/promo?code=${encodeURIComponent(value.trim())}&ticket_price=${ticketPrice}&event_id=${eventId}`
      );
      const data: PromoResult = await res.json();
      setResult(data);
      onApply(data.valid ? data : null);
    } catch {
      setResult({ valid: false, error: "Could not validate code." });
      onApply(null);
    } finally {
      setChecking(false);
    }
  }

  function handleChange(value: string) {
    setCode(value.toUpperCase());
    setResult(null);
    onApply(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => validateCode(value), 700);
    }
  }

  function handleClear() {
    setCode("");
    setResult(null);
    onApply(null);
  }

  return (
    <div>
      <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
        Community Member Code <span className="text-muted/60">(optional)</span>
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="e.g. AYAMEMBER30"
            maxLength={32}
            className={`w-full rounded-md border px-4 py-2.5 font-mono text-sm tracking-[0.06em] text-ink outline-none transition-colors ${
              result?.valid
                ? "border-moss bg-moss/5"
                : result && !result.valid
                ? "border-terra/40 bg-terra/5"
                : "border-pine/15 bg-white focus:border-pine-mid"
            }`}
          />
          {checking && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[0.55rem] text-muted animate-pulse">
              checking…
            </span>
          )}
          {result?.valid && !checking && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-moss">✓</span>
          )}
        </div>
        {code && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-pine/15 px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted transition-colors hover:border-pine/30 hover:text-pine"
          >
            Clear
          </button>
        )}
      </div>

      {/* Valid discount display */}
      {result?.valid && result.discount_amount !== undefined && (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-moss/25 bg-moss/8 px-4 py-3">
          <div>
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-moss">
              ✓ {result.label} applied
            </div>
            {result.description && (
              <div className="mt-0.5 text-xs text-muted">{result.description}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted line-through">{formatCurrency(ticketPrice)}</div>
            <div className="font-display text-lg font-medium text-pine">
              {result.final_amount === 0 ? "Free" : formatCurrency(result.final_amount!)}
            </div>
            <div className="font-mono text-[0.55rem] text-moss">
              saving {formatCurrency(result.discount_amount)}
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {result && !result.valid && !checking && (
        <p className="mt-1.5 text-xs text-terra">{result.error}</p>
      )}

      {/* Helper hint */}
      {!result && !checking && !code && (
        <p className="mt-1 text-[0.68rem] text-muted">
          AYA Community members get 30% off. Enter your code above.
        </p>
      )}
    </div>
  );
}
