"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { CommunityArchetype, EventTicketRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { PromoCodeInput } from "@/components/PromoCodeInput";

const registrationSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  business_name: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  mobile_number: z.string().min(7, "Please enter a valid mobile number"),
  industry: z.string().optional(),
  social_link: z.string().optional(),
  special_notes: z.string().optional(),
  newsletter_opt_in: z.boolean(),
  networking_opt_in: z.boolean(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  eventId: string;
  eventSlug: string;
  ticket: EventTicketRecord;
}

const INDUSTRY_OPTIONS = [
  "Food & Beverage",
  "Retail & Fashion",
  "Wellness & Beauty",
  "Tech & Digital",
  "Events & Hospitality",
  "Agriculture & Organic",
  "Creative Services",
  "Education",
  "Finance & Professional Services",
  "Other",
];

export function RegistrationForm({ eventId, eventSlug, ticket }: RegistrationFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<CommunityArchetype | null>(null);
  const [promoResult, setPromoResult] = useState<{
    promo_code_id?: string;
    discount_amount?: number;
    final_amount?: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      newsletter_opt_in: true,
      networking_opt_in: true,
    },
  });

  async function onSubmit(values: RegistrationFormValues) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          ticket_id: ticket.id,
          archetype,
          promo_code_id: promoResult?.promo_code_id || null,
          discount_amount: promoResult?.discount_amount || 0,
          final_amount: promoResult?.final_amount ?? ticket.price,
          ...values,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      // Paid ticket with PayMongo checkout → redirect to hosted payment page
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      router.push(`/events/confirmation/${data.registration.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Selected ticket recap */}
      <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
        <div className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-terra">Selected Ticket</div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-display text-lg text-pine">{ticket.name}</span>
          <div className="text-right">
            {promoResult?.discount_amount ? (
              <>
                <span className="mr-2 text-xs text-muted line-through">{formatCurrency(ticket.price)}</span>
                <span className="font-display text-lg text-pine">
                  {promoResult.final_amount === 0 ? "Free" : formatCurrency(promoResult.final_amount!)}
                </span>
              </>
            ) : (
              <span className="font-display text-lg text-pine">{formatCurrency(ticket.price)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="rounded-lg border border-pine/10 bg-white p-5">
        <h3 className="mb-4 font-display text-base text-pine">Order Information</h3>
        <div className="space-y-4">
          <Field label="Fullname *" error={errors.full_name?.message}>
            <input {...register("full_name")} className={inputClass} placeholder="Juan Dela Cruz" />
          </Field>
          <Field label="Email *" error={errors.email?.message}>
            <input {...register("email")} type="email" className={inputClass} placeholder="you@example.com" />
          </Field>
          <Field label="Phone number *" error={errors.mobile_number?.message}>
            <input {...register("mobile_number")} className={inputClass} placeholder="+63 9XX XXX XXXX" />
          </Field>
          <Field label="Please comment: Founder, Creative, Community Builder, or Enabler" error={undefined}>
            <select
              className={inputClass}
              value={archetype ?? ""}
              onChange={(e) => setArchetype((e.target.value as CommunityArchetype) || null)}
            >
              <option value="">Select your role…</option>
              <option value="founder">Founder</option>
              <option value="creative">Creative</option>
              <option value="community_builder">Community Builder</option>
              <option value="enabler">Enabler</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business / Organization" error={errors.business_name?.message}>
          <input {...register("business_name")} className={inputClass} placeholder="Optional" />
        </Field>
        <Field label="Industry" error={errors.industry?.message}>
          <select {...register("industry")} className={inputClass}>
            <option value="">Select industry…</option>
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Social Media Link" error={errors.social_link?.message}>
          <input {...register("social_link")} className={inputClass} placeholder="https://instagram.com/yourhandle" />
        </Field>
      </div>

      {ticket.price > 0 && (
        <PromoCodeInput
          ticketPrice={ticket.price}
          eventId={eventId}
          onApply={(r) => setPromoResult(r)}
        />
      )}

      <Field label="Special Notes" error={errors.special_notes?.message}>
        <textarea
          {...register("special_notes")}
          className={`${inputClass} min-h-[80px] resize-none`}
          placeholder="Dietary restrictions, accessibility needs, etc. (optional)"
        />
      </Field>

      {/* Community opt-ins */}
      <div className="space-y-3 rounded-lg border border-pine/10 bg-fog/40 p-4">
        <label className="flex items-start gap-3 text-sm text-ink/80">
          <input
            type="checkbox"
            {...register("newsletter_opt_in")}
            className="mt-0.5 h-4 w-4 rounded border-pine/30 text-pine accent-pine"
          />
          <span>Join the AYA Community Newsletter — get updates on future events, eMagazine issues, and SME features.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-ink/80">
          <input
            type="checkbox"
            {...register("networking_opt_in")}
            className="mt-0.5 h-4 w-4 rounded border-pine/30 text-pine accent-pine"
          />
          <span>Be included in future networking and business opportunities with the AYA community.</span>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-terra/30 bg-terra/5 p-3 text-sm text-terra">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-gold px-6 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Continue to Payment →"}
      </button>
      <p className="text-center text-[0.7rem] text-muted">
        By registering, you agree to receive a confirmation email and QR ticket for{" "}
        <span className="font-medium text-pine">{eventSlug.replace(/-/g, " ")}</span>.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-pine/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pine-mid";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-terra">{error}</p>}
    </div>
  );
}
