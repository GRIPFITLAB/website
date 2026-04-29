"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { discountConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

import {
  initialEmailDiscountState,
  submitEmailDiscount,
  type EmailDiscountState,
} from "./email-discount-action";

const STORAGE_KEY = "gripfit:email-discount:dismissed-v1";
/** Wait this long before showing on first paint — give the visitor a
 *  beat to read the hero before we interrupt them. */
const APPEAR_DELAY_MS = 4500;

/**
 * EmailDiscountModal — first-visit pop-up offering an extra 15% off in exchange
 * for an email address.
 *
 * Behaviour:
 *   - Mounts on the home page only (see app/page.tsx).
 *   - Respects localStorage suppression: closing or submitting marks
 *     the visitor "seen" forever (until they clear storage).
 *   - Honours `prefers-reduced-motion` via the Base UI primitives'
 *     defaults — no custom transition.
 *   - Honeypot field is visually hidden but accessible to bots.
 */
export function EmailDiscountModal() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true); // start true → no flash
  const [state, formAction, pending] = useActionState<
    EmailDiscountState,
    FormData
  >(submitEmailDiscount, initialEmailDiscountState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed =
      window.localStorage.getItem(STORAGE_KEY) === "1" ||
      window.sessionStorage.getItem(STORAGE_KEY) === "1";
    setSeen(dismissed);
    if (!dismissed) {
      timerRef.current = setTimeout(() => setOpen(true), APPEAR_DELAY_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Once the visitor submits successfully, mark dismissed permanently.
  useEffect(() => {
    if (state.status === "success" && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }, [state.status]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && typeof window !== "undefined") {
      // Closing without submitting: suppress for the rest of the session
      // but allow a true bounce-back next visit. (localStorage on submit;
      // sessionStorage on close.)
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    }
  }

  if (seen) return null;

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            "transition-opacity duration-200",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2",
            "overflow-hidden rounded-2xl bg-bg-elevated text-text-primary shadow-[0_24px_60px_-16px_rgba(28,26,23,0.30)]",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            "transition-[opacity,transform] duration-200 ease-out",
          )}
        >
          <Dialog.Close
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-accent-soft hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-4" strokeWidth={2} />
          </Dialog.Close>

          <div className="relative px-7 py-9 md:px-9 md:py-11">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-promo/60 to-transparent"
            />

            <p className="text-eyebrow mb-4 text-promo">
              {discountConfig.email.label} · stacks on Kickstarter
            </p>
            <Dialog.Title className="font-display text-display-lg text-text-primary">
              {discountConfig.email.headline}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-[15px] leading-[1.6] text-text-secondary">
              {discountConfig.email.body}
            </Dialog.Description>

            {state.status === "success" ? (
              <p className="mt-7 rounded-xl border border-state-success/30 bg-state-success/10 px-4 py-3 text-sm leading-[1.55] text-state-success">
                {state.message}
              </p>
            ) : (
              <form action={formAction} className="mt-7 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email-discount-email">Email address</Label>
                  <Input
                    id="email-discount-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@domain.com"
                    aria-invalid={Boolean(fieldErrors?.email)}
                    aria-describedby={
                      fieldErrors?.email ? "email-discount-error" : undefined
                    }
                    required
                  />
                  {fieldErrors?.email && (
                    <p
                      id="email-discount-error"
                      className="text-xs text-destructive"
                    >
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Honeypot */}
                <div
                  aria-hidden
                  className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
                >
                  <label htmlFor="email-discount-website">
                    Don&apos;t fill this out if you&apos;re human
                  </label>
                  <input
                    id="email-discount-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

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
                  No spam. Unsubscribe anytime. We&apos;ll only email you
                  about pre-order updates.
                </p>
              </form>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
