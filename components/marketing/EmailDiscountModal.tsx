"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { EmailDiscountForm } from "@/components/marketing/EmailDiscountForm";
import { discountConfig } from "@/lib/config";
import {
  EMAIL_DISCOUNT_OPEN_EVENT,
  isEmailDiscountDismissed,
  markEmailDiscountDismissed,
} from "@/lib/email-discount-events";
import { cn } from "@/lib/utils";

/** Wait this long before showing on first paint — give the visitor a
 *  beat to read the hero before we interrupt them. */
const APPEAR_DELAY_MS = 4500;

/**
 * EmailDiscountModal — first-visit pop-up (and on-demand opener) for
 * the extra-15%-off email-capture flow.
 *
 * Mounted once at the layout level (`app/layout.tsx`) so any
 * `<EmailDiscountTeaser />` button on any page can open it via the
 * shared `gripfit:open-email-discount` custom event.
 *
 * Behaviour:
 *   - First-visit auto-popup after `APPEAR_DELAY_MS` unless the
 *     visitor has already submitted (localStorage) or dismissed the
 *     pop-up earlier in this session (sessionStorage).
 *   - Programmatic open via `openEmailDiscountModal()` always works,
 *     even if previously dismissed — clicking a teaser is an explicit
 *     user action, not an interruption.
 *   - Closing without submitting suppresses for the rest of the session.
 *   - Submitting (here OR in the footer form) sets the localStorage
 *     flag so the auto-popup stops nagging on subsequent visits.
 */
export function EmailDiscountModal() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // First-visit auto-open
  useEffect(() => {
    if (!isEmailDiscountDismissed()) {
      timerRef.current = setTimeout(() => setOpen(true), APPEAR_DELAY_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Programmatic open from any teaser button anywhere in the tree.
  useEffect(() => {
    function handler() {
      // Cancel any pending first-visit timer so we don't double-open.
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setOpen(true);
    }
    document.addEventListener(EMAIL_DISCOUNT_OPEN_EVENT, handler);
    return () =>
      document.removeEventListener(EMAIL_DISCOUNT_OPEN_EVENT, handler);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Closing without submitting: suppress for the rest of the session
      // but allow a true bounce-back next visit. (The persistent
      // localStorage flag is written on submit by `<EmailDiscountForm />`.)
      markEmailDiscountDismissed("session");
    }
  }

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
          {/* Close button — `z-10` elevates it above the content div
              (both are positioned siblings; without an explicit z, the
              later DOM node paints on top and swallows the clicks). */}
          <Dialog.Close
            aria-label="Close"
            className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-accent-soft hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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

            <EmailDiscountForm
              variant="modal"
              idPrefix="email-discount-modal"
              className="mt-7"
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
