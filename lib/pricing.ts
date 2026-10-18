/**
 * Pricing math — pure, dependency-free, safe to import from Server
 * Components, Client Components, Server Actions, and the proxy.
 *
 * Every price shown on the site comes out of `computePricing()`. The only
 * input that varies is the visitor's arm, which the price experiment
 * assigns per visitor (`lib/experiment/`). The arms themselves live in
 * `lib/admin.ts`.
 */

import {
  campaignSettings,
  emailDiscount,
  priceExperiment,
  type PriceArm,
} from "@/lib/admin";

export type { PriceArm } from "@/lib/admin";

export type TierKey = "superEarlyBird" | "kickstarter" | "retail";

export interface PriceTier {
  key: TierKey;
  label: string;
  /** One-line explanation shown under the price, if any. */
  note: string | null;
  /** Whole-percent saving against the next tier up; `null` for retail. */
  discountPct: number | null;
  /** Whole-dollar amount. */
  amount: number;
  /** `$84` */
  formatted: string;
}

export interface Pricing {
  /** The arm these numbers come from. */
  armId: number;
  /** Email lock price. */
  superEarlyBird: PriceTier;
  /** Kickstarter ceiling — "never pay more than". */
  kickstarter: PriceTier;
  /** Expected retail. */
  retail: PriceTier;
  /** Tiers in display order. */
  tiers: readonly [PriceTier, PriceTier, PriceTier];
  freeShipping: boolean;
  /** True when the arm came from a per-visitor assignment. */
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

/** The configured arm with this id, or `null`. */
export function priceArm(id: unknown): PriceArm | null {
  if (typeof id !== "number" || !Number.isInteger(id)) return null;
  return priceExperiment.arms.find((arm) => arm.id === id) ?? null;
}

/** True if `n` is an arm the current experiment could have assigned. */
export function isValidArmId(n: unknown): n is number {
  return priceArm(n) !== null;
}

/** Rounded percent saved paying `price` instead of `reference`. */
export function savingPct(price: number, reference: number): number {
  return Math.round((1 - price / reference) * 100);
}

function tier(key: TierKey, amount: number, nextTierUp: number | null): PriceTier {
  return {
    key,
    label: campaignSettings.tierLabels[key],
    note: campaignSettings.tierNotes[key],
    discountPct: nextTierUp === null ? null : savingPct(amount, nextTierUp),
    amount,
    formatted: formatUSD(amount),
  };
}

function defaultArm(): PriceArm {
  const arm = priceArm(priceExperiment.defaultArmId);
  if (!arm) throw new Error("priceExperiment.defaultArmId must name a configured arm");
  return arm;
}

/**
 * Compute every tier for an arm.
 *
 * Pass the visitor's assigned arm when there is one; omit it (or pass
 * `null`) to get the default arm from `lib/admin.ts`.
 */
export function computePricing(assignedArmId?: number | null): Pricing {
  const assigned = priceExperiment.enabled ? priceArm(assignedArmId) : null;
  const arm = assigned ?? defaultArm();

  const superEarlyBird = tier("superEarlyBird", arm.emailLockUSD, arm.kickstarterCeilingUSD);
  const kickstarter = tier("kickstarter", arm.kickstarterCeilingUSD, arm.retailUSD);
  const retail = tier("retail", arm.retailUSD, null);

  return {
    armId: arm.id,
    superEarlyBird,
    kickstarter,
    retail,
    tiers: [superEarlyBird, kickstarter, retail],
    freeShipping: campaignSettings.freeShipping,
    isExperimentPrice: assigned !== null,
  };
}

/** The pricing everyone without an assignment sees. */
export const defaultPricing: Pricing = computePricing(null);

/* ── Copy helpers — sentences that quote numbers are built here so they
 *    can never disagree with the numbers. ─────────────────────────────── */

function withPrice(template: string, amount: number): string {
  return template.replace("{price}", formatUSD(amount));
}

/** `"Lock in $84 on Kickstarter"` */
export function emailLockHeadline(p: Pricing): string {
  return withPrice(emailDiscount.headline, p.superEarlyBird.amount);
}

/** `"Lock in $84"` */
export function emailLockButtonLabel(p: Pricing): string {
  return withPrice(emailDiscount.buttonLabel, p.superEarlyBird.amount);
}

/** Success message quoting the price the email is actually locked at. */
export function emailLockConfirmation(lockedAmount: number): string {
  return withPrice(emailDiscount.confirmationCopy, lockedAmount);
}

/** `"16% off"`, or `null` for a tier with nothing above it. */
export function discountBadge(t: PriceTier): string | null {
  return t.discountPct === null
    ? null
    : campaignSettings.discountBadge.replace("{pct}", String(t.discountPct));
}

/** One-line campaign summary (mobile menu). */
export function campaignBannerCopy(p: Pricing): string {
  const parts = [
    `Kickstarter: never more than ${p.kickstarter.formatted}`,
    `Lock in ${p.superEarlyBird.formatted} with your email`,
  ];
  if (p.freeShipping) parts.push("Free US shipping");
  return parts.join(" · ");
}
