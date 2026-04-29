"use client";

import { ArrowRight } from "lucide-react";

import { discountConfig } from "@/lib/config";
import { openEmailDiscountModal } from "@/lib/email-discount-events";
import { cn } from "@/lib/utils";

/**
 * EmailDiscountTeaser — small inline button placed next to every
 * pricing / "Back the campaign" CTA on the site.
 *
 * Clicking opens the existing `<EmailDiscountModal />` (mounted once at
 * the layout level) via the shared custom-event channel — no Context
 * provider, no prop drilling, no re-renders elsewhere in the tree.
 *
 * The percent in the label is read from `discountConfig.email`, so it
 * stays in sync with `lib/admin.ts` automatically.
 */
export interface EmailDiscountTeaserProps {
  className?: string;
  /**
   *  - `default` — body-weight, used under buttons.
   *  - `compact` — uppercase eyebrow style for tight slots.
   */
  variant?: "default" | "compact";
  /**
   * Optional side-effect to run *before* the modal opens. Useful for
   * closing a containing overlay (e.g. the mobile menu Sheet) so the
   * modal isn't rendered behind it.
   */
  onClick?: () => void;
}

export function EmailDiscountTeaser({
  className,
  variant = "default",
  onClick,
}: EmailDiscountTeaserProps) {
  const percent = Math.round(discountConfig.email.percentOff * 100);
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
        isCompact
          ? "text-[11px] font-semibold uppercase tracking-[0.10em]"
          : "text-[13px] font-medium",
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full bg-promo"
      />
      <span>
        Get an extra {percent}% off — email me a code
      </span>
      <ArrowRight
        className="size-3.5 transition-transform group-hover:translate-x-0.5"
        strokeWidth={2.25}
      />
    </button>
  );
}
