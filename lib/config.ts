/**
 * Brand and product configuration.
 *
 * This file composes typed config objects from the values in `lib/admin.ts`
 * and adds pricing helpers on top. **You almost never need to edit this
 * file** — to change a price, percent, link, or copy string, edit
 * `lib/admin.ts` instead.
 *
 *   ┌─ lib/admin.ts          plain editable values (price, % off, copy, links)
 *   │
 *   └─ lib/config.ts (here)  typed exports + pricing helpers
 *                            (siteConfig, productConfig, discountConfig,
 *                             externalLinks, getPreorderPricing, …)
 *
 * Existing imports `from "@/lib/config"` continue to work unchanged.
 */

import {
  campaignDiscount,
  emailDiscount,
  links,
  productSettings,
  siteIdentity,
} from "@/lib/admin";
import { env } from "@/lib/env";

export const siteConfig = {
  ...siteIdentity,
  /** Public site origin from the environment (e.g.
   *  `https://gripfit.com`). Falls back to `null` until set. */
  url: env.NEXT_PUBLIC_SITE_URL ?? null,
} as const;

export const productConfig = {
  /**
   * The single product in v1 (Decisions.md §5).
   * `handle` would be the Shopify admin handle if/when commerce relights
   * — unused while v1 routes through crowdfunding (Decisions.md §16 Q3).
   */
  base: {
    name: productSettings.name,
    handle: productSettings.handle,
    /** List price in USD. Sale price = list × (1 − discount %). */
    fallbackPriceUSD: productSettings.listPriceUSD,
    preorder: productSettings.preorder,
  },
} as const;

/**
 * Discount configuration — single source of truth for the v1 launch
 * pre-order pricing UI. Values come from `lib/admin.ts`; computed
 * `label` getters round percents for badge / pill display so banners
 * stay accurate when you change the percent.
 *
 * Decisions.md §5, §16 Q3.
 */
export const discountConfig = {
  preorder: {
    percentOff: campaignDiscount.percentOff,
    freeShipping: campaignDiscount.freeShipping,
    bannerCopy: campaignDiscount.bannerCopy,
    ctaLabel: campaignDiscount.ctaLabel,
    /** Surfaced to humans as e.g. "40% OFF". Computed; do not edit. */
    get label(): string {
      return `${Math.round(this.percentOff * 100)}% OFF`;
    },
  },
  email: {
    percentOff: emailDiscount.percentOff,
    headline: emailDiscount.headline,
    body: emailDiscount.body,
    confirmationCopy: emailDiscount.confirmationCopy,
    /** Surfaced to humans as e.g. "EXTRA 15% OFF". Computed; do not edit. */
    get label(): string {
      return `EXTRA ${Math.round(this.percentOff * 100)}% OFF`;
    },
  },
} as const;

/**
 * External-link surface — re-exported from `lib/admin.ts` so existing
 * imports (`externalLinks.crowdfundingUrl`, etc.) keep working.
 * Edit values in `lib/admin.ts → links`.
 */
export const externalLinks = links;

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

export type SiteConfig = typeof siteConfig;
export type ProductConfig = typeof productConfig;
export type DiscountConfig = typeof discountConfig;
