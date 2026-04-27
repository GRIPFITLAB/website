/**
 * Brand and product configuration.
 *
 * Single source of truth for any string the UI references that isn't either
 * (a) coming from Shopify Storefront API at runtime, or (b) marketing copy
 * inside a specific page. Update this file rather than hardcoding values
 * in components.
 *
 * Several values here are TODOs tied to open questions in Decisions.md §16.
 */

import { env } from "@/lib/env";

export const siteConfig = {
  name: "GripFit",
  /**
   * TODO(Decisions.md §16 Q5): final tagline.
   * Current placeholder reflects the WHOOP-style editorial hero brief —
   * short, declarative, performance-coded.
   */
  tagline: "Force is data.",
  description:
    "GripFit is a precision hand dynamometer that pairs with iOS to track peak force, endurance, and fatigue in real time.",
  url: env.NEXT_PUBLIC_SITE_URL ?? null,
} as const;

export const productConfig = {
  /**
   * The single product in v1. (Decisions.md §5)
   * Q4 RESOLVED — canonical product name is "GripFit". No "Pro" suffix in v1.
   * `handle` must match the Shopify admin handle exactly — set both sides
   * once the Shopify store is created.
   */
  base: {
    name: "GripFit",
    handle: "gripfit",
    fallbackPriceUSD: 95,
    /** Decisions.md §16 Q3: v1 is sold as a Shopify pre-order SKU. */
    preorder: true,
  },
} as const;

export const externalLinks = {
  /** TODO(Decisions.md §16 Q8): App Store URL — null disables the CTA. */
  iosAppStore: null as string | null,
  /** Decisions.md §4 — branded checkout subdomain. */
  shopifyCheckoutHost: "checkout.gripfit.com",
  /** Decisions.md §4 */
  supportEmail: "support@gripfit.com",
} as const;

export type SiteConfig = typeof siteConfig;
export type ProductConfig = typeof productConfig;
