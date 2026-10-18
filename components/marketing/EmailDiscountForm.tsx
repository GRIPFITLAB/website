"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { useExperiment } from "@/components/experiment/PricingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { discountConfig, emailLockButtonLabel } from "@/lib/config";
import { markEmailDiscountDismissed } from "@/lib/email-discount-events";
import { routes } from "@/lib/routes";
import { newEventId, trackLead } from "@/lib/tracking/meta-pixel";
import { cn } from "@/lib/utils";

import { submitEmailDiscount } from "./email-discount-action";
import { initialEmailDiscountState, type EmailDiscountState } from "./email-discount-schema";

/**
 * EmailDiscountForm — the one email-capture form, rendered in three places
 * (modal, footer, /kickstarter). All three call the same Server Action.
 *
 * Tracking: a browser-generated `event_id` rides along in the form so the
 * server's Conversions API `Lead` and the Pixel's `Lead` (fired here on
 * success) deduplicate to one conversion in Meta.
 *
 * On success it sets the shared localStorage flag so the auto-popup stops.
 */
export type EmailDiscountFormVariant = "footer" | "modal";

export interface EmailDiscountFormProps {
  variant?: EmailDiscountFormVariant;
  className?: string;
  /** Unique prefix for input ids when several instances share a page. */
  idPrefix?: string;
  /** Recorded on the lead: which surface submitted. */
  source: "modal" | "footer" | "kickstarter";
  /** Show the single no-spam / unsubscribe line under the field. */
  showConsent?: boolean;
}

export function EmailDiscountForm({
  variant = "modal",
  className,
  idPrefix,
  source,
  showConsent = false,
}: EmailDiscountFormProps) {
  const [state, formAction, pending] = useActionState<EmailDiscountState, FormData>(
    submitEmailDiscount,
    initialEmailDiscountState,
  );
  const { pricing, experimentId } = useExperiment();
  // Stable per mount; generated client-side so the Pixel and CAPI share it.
  const [eventId] = useState<string>(() => newEventId());
  const trackedRef = useRef<string | null>(null);

  const prefix = idPrefix ?? variant;
  const emailId = `${prefix}-email`;
  const errorId = `${prefix}-email-error`;
  const honeypotId = `${prefix}-website`;

  useEffect(() => {
    if (state.status !== "success") return;
    markEmailDiscountDismissed("local");
    // Fire the browser-side Lead once per successful submit, with the same
    // id the server used for CAPI.
    const id = state.eventId ?? eventId;
    if (trackedRef.current !== id) {
      trackedRef.current = id;
      trackLead(
        {
          price_arm: pricing.armId,
          assigned_price: pricing.kickstarter.amount,
          experiment_id: experimentId ?? undefined,
          currency: "USD",
          value: pricing.superEarlyBird.amount,
          content_name: source,
        },
        id,
      );
    }
  }, [state, pricing, experimentId, source, eventId]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <p
        className={cn(
          "rounded-xl border border-state-success/30 bg-state-success/10 px-4 py-3 text-sm leading-[1.55] text-state-success",
          className,
        )}
        role="status"
      >
        {state.message}
      </p>
    );
  }

  const consent = showConsent ? (
    <p className="text-[11px] leading-[1.5] text-text-tertiary">
      {discountConfig.email.consentCopy}{" "}
      <Link href={routes.privacy.href} className="underline underline-offset-2 hover:text-text-secondary">
        Privacy
      </Link>
      .
    </p>
  ) : null;

  const hidden = (
    <>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="source" value={source} />
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={honeypotId}>Don&apos;t fill this out if you&apos;re human</label>
        <input id={honeypotId} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );

  const errors = (
    <>
      {fieldErrors?.email && (
        <p id={errorId} className="text-xs text-destructive">
          {fieldErrors.email}
        </p>
      )}
      {state.status === "error" && !fieldErrors?.email && (
        <p className="text-xs text-destructive" role="alert">
          {state.message}
        </p>
      )}
    </>
  );

  if (variant === "footer") {
    return (
      <form action={formAction} className={cn("relative flex flex-col gap-3", className)} noValidate>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Label htmlFor={emailId} className="sr-only">
            Email address
          </Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@domain.com"
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby={fieldErrors?.email ? errorId : undefined}
            required
            className="h-12 flex-1 rounded-full bg-bg-raised px-5"
          />
          <Button type="submit" variant="promo" size="lg" disabled={pending} className="sm:w-auto">
            {pending ? "Locking in…" : emailLockButtonLabel(pricing)}
          </Button>
        </div>
        {errors}
        {consent}
        {hidden}
      </form>
    );
  }

  return (
    <form action={formAction} className={cn("relative flex flex-col gap-4", className)} noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor={emailId} className="sr-only">
          Email address
        </Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@domain.com"
          aria-invalid={Boolean(fieldErrors?.email)}
          aria-describedby={fieldErrors?.email ? errorId : undefined}
          required
          className="h-12 rounded-full bg-bg-raised px-5"
        />
        {errors}
      </div>
      {hidden}
      <Button type="submit" variant="promo" size="lg" disabled={pending} className="w-full">
        {pending ? "Locking in…" : emailLockButtonLabel(pricing)}
      </Button>
      {consent ? <div className="text-center">{consent}</div> : null}
    </form>
  );
}
