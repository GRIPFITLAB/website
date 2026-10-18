"use client";

import { Button } from "@/components/ui/button";
import { discountConfig } from "@/lib/config";
import { openEmailDiscountModal } from "@/lib/email-discount-events";

/**
 * EmailLockButton — the Hero's primary action. Opens
 * `<EmailDiscountModal />` (mounted once in the layout).
 */
export function EmailLockButton({ className }: { className?: string }) {
  return (
    <Button type="button" size="lg" className={className} onClick={openEmailDiscountModal}>
      {discountConfig.campaign.earlyBirdCtaLabel}
    </Button>
  );
}
