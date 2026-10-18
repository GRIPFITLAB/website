"use client";

import { usePricing } from "@/components/experiment/PricingContext";
import type { PriceTier } from "@/lib/pricing";
import { cn } from "@/lib/utils";

/**
 * PricingDisplay — the visitor's arm, always in this order:
 *
 *   Super Early Bird (promo tint — the price an email locks in)
 *   Kickstarter      (the ceiling — "never pay more than")
 *   Expected retail  (after the campaign)
 *
 * Each number stands on its own: no strike-through, no percent-off badges.
 * Prices come from `usePricing()` so the visitor's assigned arm flows
 * through automatically. No literals here.
 *
 * Variants:
 *   - `full`    hero / kickstarter page — three columns with hairlines.
 *   - `compact` one line, for tight slots.
 */
export function PricingDisplay({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const pricing = usePricing();

  if (variant === "compact") {
    return (
      <p className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums", className)}>
        <span className="font-display text-[28px] font-medium leading-none tracking-[-0.02em] text-promo">
          {pricing.superEarlyBird.formatted}
        </span>
        <span className="text-[13px] text-text-secondary">
          {pricing.superEarlyBird.label} · {pricing.kickstarter.label} never more than{" "}
          {pricing.kickstarter.formatted} · {pricing.retail.label} {pricing.retail.formatted}
        </span>
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <dl className="grid divide-y divide-border-hairline overflow-hidden rounded-2xl border border-border-default bg-bg-elevated/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {pricing.tiers.map((tier) => (
          <Tier key={tier.key} tier={tier} />
        ))}
      </dl>
      <p className="mt-3 text-[13px] text-text-tertiary">
        USD · one-time
        {pricing.freeShipping ? " · free US shipping on Kickstarter" : ""}
      </p>
    </div>
  );
}

function Tier({ tier }: { tier: PriceTier }) {
  const isPromo = tier.key === "superEarlyBird";
  return (
    <div
      className={cn(
        // Phone: label + price on one row. ≥sm: stacked column tile.
        "relative flex items-center justify-between gap-3 px-4 py-4 sm:flex-col sm:items-start sm:gap-2 sm:py-5 md:px-6 md:py-6",
        isPromo && "bg-promo-soft",
      )}
    >
      <dt className={cn("text-eyebrow", isPromo ? "text-promo" : "text-text-tertiary")}>
        {tier.label}
      </dt>
      <dd className="flex flex-col items-end gap-1 sm:items-start sm:gap-1.5">
        <span
          className={cn(
            "font-display font-medium leading-none tabular-nums tracking-[-0.03em]",
            "text-[28px] sm:text-[40px] md:text-[48px]",
            isPromo ? "text-text-primary" : "text-text-secondary",
          )}
        >
          {tier.formatted}
        </span>
        <span className="text-right text-[12px] leading-[1.4] text-text-secondary sm:text-left">
          {tier.note}
        </span>
      </dd>
    </div>
  );
}
