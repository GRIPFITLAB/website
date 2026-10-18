"use client";

import { ArrowRight } from "lucide-react";

import { usePricing } from "@/components/experiment/PricingContext";
import { openEmailDiscountModal } from "@/lib/email-discount-events";
import { cn } from "@/lib/utils";

/**
 * EmailDiscountTeaser — small inline button next to every campaign CTA.
 * Opens the `<EmailDiscountModal />` (mounted once in the layout) via the
 * shared custom-event channel.
 *
 * Label quotes the visitor's Super Early Bird price, so it stays in step
 * with the pricing display beside it.
 */
export interface EmailDiscountTeaserProps {
  className?: string;
  /** `default` body-weight; `compact` eyebrow style. */
  variant?: "default" | "compact";
  /** Runs before the modal opens — e.g. to close a containing Sheet. */
  onClick?: () => void;
}

export function EmailDiscountTeaser({
  className,
  variant = "default",
  onClick,
}: EmailDiscountTeaserProps) {
  const pricing = usePricing();
  const isCompact = variant === "compact";

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        openEmailDiscountModal();
      }}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md text-promo transition-colors",
        "hover:text-promo-bright focus-visible:text-promo-bright",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promo/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isCompact ? "text-[11px] font-semibold uppercase tracking-[0.10em]" : "text-[13px] font-medium",
        className,
      )}
    >
      <span aria-hidden className="inline-block size-1.5 rounded-full bg-promo" />
      <span>
        Lock in {pricing.superEarlyBird.formatted} with your email
      </span>
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
    </button>
  );
}
