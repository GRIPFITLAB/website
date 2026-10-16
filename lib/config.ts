/**
 * Typed site configuration.
 *
 * Composes the plain values in `lib/admin.ts` into the objects components
 * import. **You almost never need to edit this file** — to change a price,
 * percent, link, or copy string, edit `lib/admin.ts`.
 *
 *   lib/admin.ts    plain editable values
 *   lib/pricing.ts  pricing math (computePricing, formatUSD, copy helpers)
 *   lib/config.ts   typed exports: siteConfig, productConfig, discountConfig,
 *                   externalLinks, campaign
 */

import {
  campaignSettings,
  emailDiscount,
  links,
  priceExperiment,
  productSettings,
  siteIdentity,
  trackingSettings,
} from "@/lib/admin";
import { env } from "@/lib/env";
import { emailDiscountHeadline } from "@/lib/pricing";

export {
  computePricing,
  defaultPricing,
  formatUSD,
  campaignBannerCopy,
  emailDiscountHeadline,
} from "@/lib/pricing";
export type { Pricing, PriceTier, TierKey } from "@/lib/pricing";

export const siteConfig = {
  ...siteIdentity,
  /** Public site origin from the environment, or `null` until set. */
  url: env.SITE_URL ?? null,
} as const;

export const productConfig = {
  base: {
    name: productSettings.name,
    handle: productSettings.handle,
    retailPriceUSD: productSettings.retailPriceUSD,
    kickstarterPriceUSD: productSettings.kickstarterPriceUSD,
    preorder: productSettings.preorder,
  },
} as const;

/**
 * Discount / campaign configuration consumed by the UI.
 * Values come from `lib/admin.ts`; derived labels are computed here.
 */
export const discountConfig = {
  campaign: {
    freeShipping: campaignSettings.freeShipping,
    ctaLabel: campaignSettings.ctaLabel,
    tierLabels: campaignSettings.tierLabels,
    superEarlyBirdNote: campaignSettings.superEarlyBirdNote,
  },
  email: {
    percentOff: emailDiscount.percentOff,
    /** `"Get an extra 15% off on Kickstarter"` — percent interpolated. */
    headline: emailDiscountHeadline(),
    confirmationCopy: emailDiscount.confirmationCopy,
    consentCopy: emailDiscount.consentCopy,
    codePrefix: emailDiscount.codePrefix,
    /** `"EXTRA 15% OFF"` */
    label: `EXTRA ${Math.round(emailDiscount.percentOff * 100)}% OFF`,
  },
  experiment: priceExperiment,
} as const;

export const trackingConfig = {
  ...trackingSettings,
  /** Meta Pixel id — public by design, read from `NEXT_PUBLIC_META_PIXEL_ID`. */
  metaPixelId: env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
} as const;

/** Mailboxes come from `EMAIL_SUPPORT` / `EMAIL_LEGAL` (falling back to
 *  `lib/admin.ts`). Server-only — read in Server Components. */
export const externalLinks = {
  ...links,
  supportEmail: env.EMAIL_SUPPORT,
  legalEmail: env.EMAIL_LEGAL,
} as const;

/**
 * Where every campaign CTA points, and how to render the link.
 * While `links.crowdfundingUrl` is null the CTA routes to `/kickstarter`.
 */
export const campaign: {
  isLive: boolean;
  href: string;
  linkProps: { target?: "_blank"; rel?: string };
} = {
  isLive: links.crowdfundingUrl !== null,
  href: links.crowdfundingUrl ?? "/kickstarter",
  linkProps:
    links.crowdfundingUrl !== null
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {},
};

export type SiteConfig = typeof siteConfig;
export type ProductConfig = typeof productConfig;
export type DiscountConfig = typeof discountConfig;
