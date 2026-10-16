"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { usePricing } from "@/components/experiment/PricingContext";
import { EmailDiscountForm } from "@/components/marketing/EmailDiscountForm";
import { Eyebrow } from "@/components/ui/typography";
import { discountConfig } from "@/lib/config";
import {
  EMAIL_DISCOUNT_OPEN_EVENT,
  isEmailDiscountDismissed,
  markEmailDiscountDismissed,
} from "@/lib/email-discount-events";
import { cn } from "@/lib/utils";

/** Give the visitor a beat to read the hero before interrupting. */
const APPEAR_DELAY_MS = 4500;

/**
 * EmailDiscountModal — Super Early Bird email capture.
 *
 * Deliberately sparse: eyebrow with the price, headline, email field,
 * button. No body copy, no consent paragraph (that lives on the footer
 * form; the modal links to Privacy through the input's helper).
 *
 * Mounted once in `app/layout.tsx`; any `<EmailDiscountTeaser />` opens it
 * via the `gripfit:open-email-discount` event.
 */
export function EmailDiscountModal() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pricing = usePricing();

  useEffect(() => {
    if (!isEmailDiscountDismissed()) {
      timerRef.current = setTimeout(() => setOpen(true), APPEAR_DELAY_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    function handler() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setOpen(true);
    }
    document.addEventListener(EMAIL_DISCOUNT_OPEN_EVENT, handler);
    return () => document.removeEventListener(EMAIL_DISCOUNT_OPEN_EVENT, handler);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) markEmailDiscountDismissed("session");
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[60] bg-bg-deep/70 backdrop-blur-[2px]",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            "transition-opacity duration-200",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2",
            "overflow-hidden rounded-2xl border border-border-default bg-bg-elevated text-text-primary shadow-[var(--shadow-card-hover)]",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            "transition-[opacity,transform] duration-200 ease-out",
          )}
        >
          <Dialog.Close
            aria-label="Close"
            className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-accent-soft hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-4" strokeWidth={2} />
          </Dialog.Close>

          <div className="relative px-7 py-9 md:px-9 md:py-11">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-promo/70 to-transparent"
            />
            <Eyebrow promo className="mb-4">
              {pricing.superEarlyBird.label} · {pricing.superEarlyBird.formatted}
            </Eyebrow>
            <Dialog.Title className="font-display text-display-lg text-text-primary">
              {discountConfig.email.headline}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Enter your email to receive a {pricing.superEarlyBird.label} discount code for the
              Kickstarter campaign.
            </Dialog.Description>

            <EmailDiscountForm
              variant="modal"
              idPrefix="email-discount-modal"
              source="modal"
              className="mt-7"
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
