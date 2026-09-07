"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { discountConfig } from "@/lib/config";
import { markEmailDiscountDismissed } from "@/lib/email-discount-events";
import { cn } from "@/lib/utils";

import {
  initialEmailDiscountState,
  submitEmailDiscount,
  type EmailDiscountState,
} from "./email-discount-action";

/**
 * EmailDiscountForm — reusable client form that wraps the
 * `submitEmailDiscount` Server Action with Zod validation, an a11y-safe
 * honeypot, and progress / error / success UI.
 *
 * Rendered in two places:
 *   - `EmailDiscountModal` (variant="modal")  — vertical layout inside the
 *     first-visit pop-up.
 *   - `Footer`              (variant="footer") — horizontal email + button
 *     row anchored at #email-discount on every page.
 *
 * On a successful submit it sets the shared
 * `EMAIL_DISCOUNT_DISMISSED_KEY` so the auto-popup modal stops nagging
 * a visitor who already gave us an email anywhere on the site.
 *
 * Multiple instances may render on the same page (footer + modal at
 * once). Each instance uses its own React state but shares the same
 * Server Action, so a submit in one form does NOT propagate the success
 * UI to the other; the localStorage flag is the only shared state.
 * Pass a unique `idPrefix` per render to keep input ids unique.
 */
export type EmailDiscountFormVariant = "footer" | "modal";

export interface EmailDiscountFormProps {
  variant?: EmailDiscountFormVariant;
  className?: string;
  /** Namespace prefix for the email input id + honeypot id. Required
   *  when more than one instance is mounted on the same page so that
   *  `<label for>` references stay unique. */
  idPrefix?: string;
}

export function EmailDiscountForm({
  variant = "modal",
  className,
  idPrefix,
}: EmailDiscountFormProps) {
  const [state, formAction, pending] = useActionState<
    EmailDiscountState,
    FormData
  >(submitEmailDiscount, initialEmailDiscountState);

  const prefix = idPrefix ?? variant;
  const emailId = `${prefix}-email`;
  const errorId = `${prefix}-email-error`;
  const honeypotId = `${prefix}-website`;

  useEffect(() => {
    if (state.status === "success") markEmailDiscountDismissed("local");
  }, [state.status]);

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

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

  // ── Honeypot block (shared by both variants) ─────────────────────
  const honeypot = (
    <div
      aria-hidden
      className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
    >
      <label htmlFor={honeypotId}>
        Don&apos;t fill this out if you&apos;re human
      </label>
      <input
        id={honeypotId}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );

  if (variant === "footer") {
    return (
      <form
        action={formAction}
        className={cn("relative flex flex-col gap-3", className)}
        noValidate
      >
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
            className="h-11 flex-1"
          />
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-11 bg-promo px-6 text-xs font-semibold uppercase tracking-[0.08em] text-promo-foreground hover:bg-promo-bright sm:w-auto"
          >
            {pending ? "Sending…" : "Send my code"}
          </Button>
        </div>
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
        {honeypot}
      </form>
    );
  }

  // ── Modal variant — vertical layout ──────────────────────────────
  return (
    <form
      action={formAction}
      className={cn("relative flex flex-col gap-4", className)}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={emailId}>Email address</Label>
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
        />
        {fieldErrors?.email && (
          <p id={errorId} className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {honeypot}

      {state.status === "error" && !fieldErrors?.email && (
        <p className="text-xs text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 w-full bg-promo px-8 text-sm font-semibold uppercase tracking-[0.08em] text-promo-foreground hover:bg-promo-bright"
      >
        {pending
          ? "Sending…"
          : `Send my ${discountConfig.email.percentOff * 100}% code`}
      </Button>

      <p className="text-center text-[11px] leading-[1.5] text-text-tertiary">
        No spam. Unsubscribe anytime. We&apos;ll only email you about
        pre-order updates.
      </p>
    </form>
  );
}
