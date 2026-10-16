/**
 * Pricing math — pure, dependency-free, safe to import from Server
 * Components, Client Components, Server Actions, and the proxy.
 *
 * Every price shown on the site comes out of `computePricing()`. The only
 * input that varies is the Kickstarter price, which the price experiment
 * assigns per visitor (`lib/experiment/`). Everything else is derived from
 * `lib/admin.ts`.
 */

import {
  campaignSettings,
  emailDiscount,
  priceExperiment,
  productSettings,
} from "@/lib/admin";

export type TierKey = "superEarlyBird" | "kickstarter" | "retail";

export interface PriceTier {
  key: TierKey;
  label: string;
  /** Whole-dollar amount. */
  amount: number;
  /** `$95` */
  formatted: string;
  /** Whole-number percent off retail; `0` for the retail tier itself. */
  percentOffRetail: number;
  /** `"36% OFF"`; empty string for retail. */
  badge: string;
}

export interface Pricing {
  superEarlyBird: PriceTier;
  kickstarter: PriceTier;
  retail: PriceTier;
  /** Tiers in display order. */
  tiers: readonly [PriceTier, PriceTier, PriceTier];
  /** Whole-number extra percent the email code takes off Kickstarter. */
  emailPercentOff: number;
  freeShipping: boolean;
  /** True when the Kickstarter amount came from a per-visitor assignment. */
  isExperimentPrice: boolean;
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function percentOff(amount: number, retail: number): number {
  if (retail <= 0) return 0;
  return Math.max(0, Math.round((1 - amount / retail) * 100));
}

function tier(key: TierKey, label: string, amount: number, retail: number): PriceTier {
  const pct = key === "retail" ? 0 : percentOff(amount, retail);
  return {
    key,
    label,
    amount,
    formatted: formatUSD(amount),
    percentOffRetail: pct,
    badge: pct > 0 ? `${pct}% OFF` : "",
  };
}

/** Super Early Bird = Kickstarter × (1 − email%), rounded to whole dollars. */
export function superEarlyBirdPrice(kickstarterPrice: number): number {
  return Math.round(kickstarterPrice * (1 - emailDiscount.percentOff));
}

/** True if `n` is a price the current experiment could have assigned. */
export function isValidExperimentPrice(n: unknown): n is number {
  return (
    typeof n === "number" &&
    Number.isInteger(n) &&
    n >= priceExperiment.minUSD &&
    n <= priceExperiment.maxUSD
  );
}

/**
 * Compute every tier from a Kickstarter price.
 *
 * Pass the visitor's assigned price when there is one; omit it (or pass
 * `null`) to get the default pricing from `lib/admin.ts`.
 */
export function computePricing(assignedKickstarterPrice?: number | null): Pricing {
  const retail = productSettings.retailPriceUSD;
  const isExperimentPrice =
    priceExperiment.enabled && isValidExperimentPrice(assignedKickstarterPrice);
  const kickstarterAmount = isExperimentPrice
    ? (assignedKickstarterPrice as number)
    : productSettings.kickstarterPriceUSD;

  const retailTier = tier("retail", campaignSettings.tierLabels.retail, retail, retail);
  const kickstarterTier = tier(
    "kickstarter",
    campaignSettings.tierLabels.kickstarter,
    kickstarterAmount,
    retail,
  );
  const sebTier = tier(
    "superEarlyBird",
    campaignSettings.tierLabels.superEarlyBird,
    superEarlyBirdPrice(kickstarterAmount),
    retail,
  );

  return {
    superEarlyBird: sebTier,
    kickstarter: kickstarterTier,
    retail: retailTier,
    tiers: [sebTier, kickstarterTier, retailTier],
    emailPercentOff: Math.round(emailDiscount.percentOff * 100),
    freeShipping: campaignSettings.freeShipping,
    isExperimentPrice,
  };
}

/** The pricing everyone without an assignment sees. */
export const defaultPricing: Pricing = computePricing(null);

/* ── Copy helpers — sentences that quote numbers are built here so they
 *    can never disagree with the numbers. ─────────────────────────────── */

/** `"Get an extra 15% off on Kickstarter"` */
export function emailDiscountHeadline(): string {
  return emailDiscount.headline.replace(
    "{percent}",
    String(Math.round(emailDiscount.percentOff * 100)),
  );
}

/** Site-wide banner sentence. */
export function campaignBannerCopy(p: Pricing): string {
  const parts = [
    `Kickstarter price ${p.kickstarter.formatted}`,
    `Super Early Bird ${p.superEarlyBird.formatted} with email signup`,
  ];
  if (p.freeShipping) parts.push("Free US shipping");
  return parts.join(" · ");
}
