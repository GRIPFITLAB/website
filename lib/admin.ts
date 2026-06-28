/* ──────────────────────────────────────────────────────────────────────────
 *
 *   GripFit — admin / control panel
 *
 *   THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE
 *   prices, discounts, banner copy, links, and product naming
 *   across the entire marketing site.
 *
 *   Edit a value below, save, and on the next dev-server reload (or
 *   deploy) the change is live everywhere — banners, hero, PDP,
 *   modal, footer, nav, mobile menu, sitemap, etc. No component holds
 *   a price, percent, or URL literal.
 *
 * ── How this file is organised ─────────────────────────────────────────────
 *
 *   1. Site identity     (name, tagline, description)
 *   2. Product           (name, list price USD, Shopify handle)
 *   3. Campaign discount (Kickstarter pre-order — % off + free shipping)
 *   4. Email discount    (first-visit modal — extra % that STACKS on the
 *                         campaign discount)
 *   5. External links    (crowdfunding URL, App Store, support email,
 *                         Shopify host parked for v2)
 *
 * ── What does NOT live here ────────────────────────────────────────────────
 *
 *   • Pricing math / formatters → lib/config.ts (`getPreorderPricing`,
 *     `getStackedPreorderPricing`, `formatUSD`)
 *   • Environment-derived values (NEXT_PUBLIC_SITE_URL, Shopify keys,
 *     Resend keys) → lib/env.ts and `.env.local`
 *   • Page-specific marketing copy (feature blurbs, science citations,
 *     setup steps) → the TSX of the relevant page / component
 *
 * ── Updating the percent off ───────────────────────────────────────────────
 *
 *   If you change `campaignDiscount.percentOff`, also update
 *   `campaignDiscount.bannerCopy` (and any percent reference in
 *   `emailDiscount.headline` / `emailDiscount.body`) so the human-readable
 *   copy matches the new number. The `label` shown on pills and the
 *   strike-through pricing on Hero / InTheBox / PDP recompute themselves
 *   automatically (see lib/config.ts → discountConfig.*.label).
 *
 * ──────────────────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────────────────────────────────────
// 1. Site identity
// ─────────────────────────────────────────────────────────────────────────

export const siteIdentity = {
  /** Brand name used in <title>, OG tags, footer wordmark, contact-form
   *  reply-from address, etc. */
  name: "GripFit",
  /** TODO(Decisions.md §16 Q5): final tagline. Short, declarative,
   *  performance-coded. Used as the hero eyebrow and meta description hint. */
  tagline: "Measure every squeeze.",
  /** One-sentence product summary. Powers the default OG description and
   *  the marketing-site `meta description`. Keep ≤ 160 chars. */
  description:
    "GripFit is a precision hand dynamometer that pairs with iOS to track peak force, endurance, and fatigue in real time.",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 2. Product
// ─────────────────────────────────────────────────────────────────────────

export const productSettings = {
  /** Display name on the PDP, footer, cart copy. */
  name: "GripFit",
  /** Shopify admin handle — only used when commerce relights in v2.
   *  Decisions.md §7 / §16 Q3. Safe to leave as-is until then. */
  handle: "gripfit",
  /** **List price in USD** — the sticker price.
   *  All sale / discounted prices are computed from this number, so this
   *  is the only price you ever need to change. */
  listPriceUSD: 135,
  /** v1 always true: every CTA on the site routes to the crowdfunding
   *  campaign (`links.crowdfundingUrl`) instead of a Shopify checkout.
   *  Flip to `false` once Shopify commerce relights in v2. */
  preorder: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 3. Campaign discount  (Kickstarter / pre-order)
// ─────────────────────────────────────────────────────────────────────────

export const campaignDiscount = {
  /** Pre-order discount, expressed as 0–1.
   *  e.g. `0.3` = 30% off the list price.
   *  Sale price = `listPriceUSD × (1 − percentOff)`. */
  percentOff: 0.3,
  /** Toggle the "+ free US shipping" promise on the banner / PDP. */
  freeShipping: true,
  /** Sentence form for the site-wide banner above the nav.
   *  Update this string if you change `percentOff` so the banner reads
   *  the right percent. */
  bannerCopy: "Kickstarter pre-order: 30% off + free US shipping",
  /** Button label used everywhere the campaign CTA appears: nav,
   *  mobile menu, hero, PDP, banner. */
  ctaLabel: "Back the campaign",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 4. Email-modal discount  (extra % off, stacks on the campaign discount)
// ─────────────────────────────────────────────────────────────────────────

export const emailDiscount = {
  /** Extra percent off, expressed as 0–1.
   *
   *  **STACKS on top of the Kickstarter campaign discount** — this is
   *  a percent off the campaign sale price, not off the list. So the
   *  effective combined discount on the list price is:
   *
   *      1 − (1 − campaignDiscount.percentOff) × (1 − emailDiscount.percentOff)
   *
   *  At 30% × 15% the visitor pays 59.5% of list = 40.5% off. */
  percentOff: 0.15,
  /** Modal title. Update to match `percentOff` if you change it. */
  headline: "Get an extra 15% off pre-order",
  /** Modal body copy. Update both percents if you change the numbers. */
  body: "Drop your email and we'll send you a private 15%-off code that stacks on top of the 30% Kickstarter discount.",
  /** Shown after a successful submission. */
  confirmationCopy:
    "Done — your code is on the way. Check your inbox in a couple of minutes.",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 5. External links
// ─────────────────────────────────────────────────────────────────────────

export const links = {
  /** **Crowdfunding campaign URL** — the destination for every "Back
   *  the campaign" / pre-order CTA on the site.
   *
   *  TODO(Decisions.md §16 Q10): replace with the live Kickstarter /
   *  Indiegogo URL when ready. While the campaign is dark, links fall
   *  back to /contact so visitors who hit a CTA early still reach us. */
  crowdfundingUrl: "/contact",
  /** App Store URL for the iOS companion app. Set to `null` to hide
   *  the App Store CTA entirely (Decisions.md §16 Q8). */
  iosAppStore: null as string | null,
  /** Shopify checkout host — parked for v2 (Decisions.md §7).
   *  Kept here so the v2 commerce relight only needs to flip
   *  `productSettings.preorder = false` and uncomment the Shopify
   *  imports in /product. */
  shopifyCheckoutHost: "checkout.gripfit.com",
  /** Support / contact email — used on the contact page and in any
   *  fallback "or email us" lines. */
  supportEmail: "support@gripfit.com",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Convenience aggregate — handy if you'd rather import one symbol.
// (Most code in the app imports the typed configs from `lib/config.ts`,
//  but having this object lets you `import { adminConfig } from "@/lib/admin"`
//  in scripts / one-offs.)
// ─────────────────────────────────────────────────────────────────────────

export const adminConfig = {
  site: siteIdentity,
  product: productSettings,
  campaignDiscount,
  emailDiscount,
  links,
} as const;
