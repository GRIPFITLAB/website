/**
 * Brand and product configuration.
 *
 * Single source of truth for any string the UI references that isn't either
 * (a) coming from a runtime API, or (b) marketing copy inside a specific
 * page. Update this file rather than hardcoding values in components.
 *
 * Several values here are TODOs tied to open questions in Decisions.md §16.
 */

import { env } from "@/lib/env";

export const siteConfig = {
  name: "GripFit",
  /**
   * TODO(Decisions.md §16 Q5): final tagline.
   * Current placeholder reflects the editorial hero brief — short,
   * declarative, performance-coded.
   */
  tagline: "Force is data.",
  description:
    "GripFit is a precision hand dynamometer that pairs with iOS to track peak force, endurance, and fatigue in real time.",
  url: env.NEXT_PUBLIC_SITE_URL ?? null,
} as const;

export const productConfig = {
  /**
   * The single product in v1 (Decisions.md §5).
   * `handle` would be the Shopify admin handle if/when commerce relights
   * — unused while v1 routes through crowdfunding (Decisions.md §16 Q3).
   */
  base: {
    name: "GripFit",
    handle: "gripfit",
    /** List price in USD. Sale price = list × (1 − discount %). */
    fallbackPriceUSD: 175,
    /**
     * v1 ships as a crowdfunding pre-order (Decisions.md §16 Q3).
     * The PDP / hero CTA copy reads "Pre-order" but routes to
     * `externalLinks.crowdfundingUrl`, not to a Shopify checkout.
     */
    preorder: true,
  },
} as const;

/**
 * Discount configuration — single source of truth for the v1 launch
 * pre-order pricing UI. Touch this file to change the percent off, the
 * free-shipping toggle, or the email-modal offer; every banner, badge,
 * and strike-through pricing display reads from here.
 *
 * Decisions.md §5, §16 Q3.
 */
export const discountConfig = {
  preorder: {
    /** 0–1. 0.4 = 40% off. */
    percentOff: 0.4,
    /** Surfaced to humans as "40% off". Computed; do not edit. */
    get label(): string {
      return `${Math.round(this.percentOff * 100)}% OFF`;
    },
    /** Sentence form for the banner. */
    bannerCopy: "Kickstarter pre-order: 40% off + free US shipping",
    freeShipping: true,
    /** Where the banner / CTA routes — see externalLinks.crowdfundingUrl. */
    ctaLabel: "Back the campaign",
  },
  email: {
    /**
     * **Stacks on top of the campaign discount.** This is an additional
     * percent off the campaign sale price, not off the list price. So
     * the effective combined discount on the list price is
     *   1 − (1 − preorder.percentOff) × (1 − email.percentOff).
     * (At 40% × 15% = 49% off list.)
     */
    percentOff: 0.15,
    /** Surfaced to humans as "EXTRA 15% OFF". Computed; do not edit. */
    get label(): string {
      return `EXTRA ${Math.round(this.percentOff * 100)}% OFF`;
    },
    headline: "Get an extra 15% off pre-order",
    body: "Drop your email and we'll send you a private 15%-off code that stacks on top of the 40% Kickstarter discount.",
    confirmationCopy:
      "Done — your code is on the way. Check your inbox in a couple of minutes.",
  },
} as const;

/**
 * Pricing helpers. Use these instead of computing prices in JSX.
 *
 *   const { sale, list, savings, formattedSale, formattedList } =
 *     getPreorderPricing();
 */
export function getPreorderPricing() {
  const list = productConfig.base.fallbackPriceUSD;
  const sale = list * (1 - discountConfig.preorder.percentOff);
  const savings = list - sale;
  return {
    list,
    sale,
    savings,
    formattedList: formatUSD(list),
    formattedSale: formatUSD(sale),
    formattedSavings: formatUSD(savings),
  };
}

/**
 * Pricing if the visitor also redeems the email-modal stacked discount.
 * Email % is multiplicative on top of the Kickstarter % (see the comment
 * on `discountConfig.email.percentOff`).
 */
export function getStackedPreorderPricing() {
  const { list, sale: campaignSale } = getPreorderPricing();
  const stacked = campaignSale * (1 - discountConfig.email.percentOff);
  const totalPercentOff = 1 - stacked / list;
  return {
    list,
    campaignSale,
    stacked,
    savings: list - stacked,
    totalPercentOff,
    formattedList: formatUSD(list),
    formattedCampaignSale: formatUSD(campaignSale),
    formattedStacked: formatUSD(stacked),
    formattedSavings: formatUSD(list - stacked),
  };
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // $47.50 not $47.5; $175 not $175.00
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const externalLinks = {
  /** TODO(Decisions.md §16 Q8): App Store URL — null disables the CTA. */
  iosAppStore: null as string | null,
  /**
   * TODO(Decisions.md §16 Q10): final crowdfunding campaign URL.
   * Until the campaign goes live, links open the contact page so users
   * who hit a CTA early can still reach us.
   */
  crowdfundingUrl: "/contact",
  /**
   * Shopify checkout host — parked for v2 (Decisions.md §7). Kept here
   * so the v2 commerce relight only has to flip preorder=false and
   * uncomment the import in /product.
   */
  shopifyCheckoutHost: "checkout.gripfit.com",
  supportEmail: "support@gripfit.com",
} as const;

export type SiteConfig = typeof siteConfig;
export type ProductConfig = typeof productConfig;
export type DiscountConfig = typeof discountConfig;
