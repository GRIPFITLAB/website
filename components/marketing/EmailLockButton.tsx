"use client";

import { usePricing } from "@/components/experiment/PricingContext";
import { Button } from "@/components/ui/button";
import { openEmailDiscountModal } from "@/lib/email-discount-events";
import { emailLockButtonLabel } from "@/lib/pricing";

/**
 * EmailLockButton — the Hero's primary action. Quotes the visitor's lock
 * price and opens `<EmailDiscountModal />` (mounted once in the layout).
 */
export function EmailLockButton({ className }: { className?: string }) {
  const pricing = usePricing();
  return (
    <Button type="button" size="lg" className={className} onClick={openEmailDiscountModal}>
      {emailLockButtonLabel(pricing)}
    </Button>
  );
}
