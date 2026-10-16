/* ──────────────────────────────────────────────────────────────────────────
 *
 *   GripFit — admin / control panel
 *
 *   THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE
 *   prices, the price experiment, discounts, copy, links, and naming
 *   across the entire marketing site.
 *
 *   Edit a value below, save, and on the next deploy the change is live
 *   everywhere — banner, hero, modal, footer, nav, emails, sitemap. No
 *   component holds a price, percent, or URL literal.
 *
 * ── How this file is organised ─────────────────────────────────────────────
 *
 *   1. Site identity      (name, tagline, description)
 *   2. Product + pricing  (retail price, default Kickstarter price)
 *   3. Price experiment   (Meta-ads A/B price range — the demand curve test)
 *   4. Campaign           (Kickstarter — free shipping, CTA label)
 *   5. Email discount     (Super Early Bird — extra % off for an email)
 *   6. Tracking           (cookie notice toggle; the Pixel id lives in env)
 *   7. External links     (Kickstarter URL, App Store, support email)
 *
 * ── Pricing model ──────────────────────────────────────────────────────────
 *
 *   Three tiers are shown everywhere, always in this order:
 *
 *     Super Early Bird  = Kickstarter price × (1 − emailDiscount.percentOff)
 *                         — unlocked by signing up with an email.
 *     Kickstarter       = the campaign price. Either the fixed default
 *                         below, or — when the price experiment is on — a
 *                         random integer in the experiment's range, assigned
 *                         once per visitor and remembered in a cookie.
 *     Retail            = productSettings.retailPriceUSD (struck through).
 *
 *   Percent-off badges are computed from these numbers (lib/pricing.ts), so
 *   nothing here says "25%" in prose that could drift from the maths.
 *
 * ── What does NOT live here ────────────────────────────────────────────────
 *
 *   • Pricing math / formatters → lib/pricing.ts
 *   • Env-derived values (SITE_URL, Brevo, Firebase, Meta keys) → lib/env.ts
 *   • Page copy (section headlines, setup steps) → the TSX of that page
 *   • Colours / fonts → design.md, app/globals.css, lib/theme.ts
 *
 * ──────────────────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────────────────────────────────────
// 1. Site identity
// ─────────────────────────────────────────────────────────────────────────

export const siteIdentity = {
  /** Brand name used in <title>, OG tags, footer wordmark, email sender. */
  name: "GripFit",
  /** Hero H1 and <title>. */
  tagline: "A readiness signal based on effort, not HRV.",
  /** One-sentence summary. Powers the meta description and the footer
   *  blurb's first line. Keep ≤ 160 chars. */
  description:
    "GripFit is a precision hand dynamometer engineered for athletes and health-conscious people who want real-time readiness intelligence.",
  /** Second footer sentence. */
  footerBlurb:
    "A readiness signal based on effort, not HRV — one daily squeeze tells you whether to push or recover. Grip strength is a clinically backed marker for longevity and overall fitness.",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 2. Product + pricing
// ─────────────────────────────────────────────────────────────────────────

export const productSettings = {
  name: "GripFit",
  /** Shopify handle — only used if commerce relights in v2. */
  handle: "gripfit",
  /** **Retail price in USD** — the struck-through "Retail" tier. */
  retailPriceUSD: 149,
  /** **Default Kickstarter price in USD.** Used when the price experiment
   *  is off, and for anyone without an assignment (bots, build-time
   *  prerender). Whole dollars. */
  kickstarterPriceUSD: 112,
  /** v1 is always a Kickstarter pre-launch; flip when Shopify relights. */
  preorder: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 3. Price experiment  (Meta ads A/B → demand curve)
// ─────────────────────────────────────────────────────────────────────────

export const priceExperiment = {
  /** Master switch. `false` = everyone sees `kickstarterPriceUSD`. */
  enabled: true,
  /** Experiment id, stored on every visitor and lead so results can be
   *  grouped. Change it to start a fresh experiment — every visitor gets a
   *  new assignment. Letters, digits, dashes only (it lives in a cookie). */
  id: "ks-price-2026-10",
  /** Inclusive integer range the Kickstarter price is drawn from. Must stay
   *  below `retailPriceUSD` or the "Retail" tier stops making sense
   *  (`tests/pricing.test.ts` enforces this). */
  minUSD: 75,
  maxUSD: 140,
  /** How long a visitor keeps their price, in days. */
  cookieDays: 180,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 4. Campaign  (Kickstarter)
// ─────────────────────────────────────────────────────────────────────────

export const campaignSettings = {
  /** Toggle the "free US shipping" promise on the banner / pricing. */
  freeShipping: true,
  /** Button label used everywhere the campaign CTA appears. */
  ctaLabel: "Back on Kickstarter",
  /** Tier names shown in the pricing display. */
  tierLabels: {
    superEarlyBird: "Super Early Bird",
    kickstarter: "Kickstarter",
    retail: "Retail",
  },
  /** One-line explanation under the Super Early Bird tier. */
  superEarlyBirdNote: "Unlocked with your email",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 5. Email discount  (Super Early Bird)
// ─────────────────────────────────────────────────────────────────────────

export const emailDiscount = {
  /** Extra percent off the Kickstarter price, expressed as 0–1. */
  percentOff: 0.15,
  /** Modal / footer headline. The percent is interpolated from the number
   *  above, so this string must contain `{percent}`. */
  headline: "Get an extra {percent}% off on Kickstarter",
  /** Shown after a successful submission. */
  confirmationCopy:
    "Done — your Super Early Bird code is on the way. Check your inbox in a couple of minutes.",
  /** Prefix on every generated discount code, e.g. `GF-7Q4KX2M9`. */
  codePrefix: "GF",
  /** The single consent / anti-spam line under the footer form. */
  consentCopy:
    "No spam. Unsubscribe anytime. We'll only email you about Kickstarter updates.",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 6. Tracking
// ─────────────────────────────────────────────────────────────────────────

export const trackingSettings = {
  /** Show the small cookie / tracking notice on first visit. */
  showCookieNotice: true,
  /** Notice copy. Keep it to one sentence; the Privacy link is appended. */
  cookieNoticeCopy:
    "We use a first-party cookie to remember your pricing and the Meta Pixel to measure our ads.",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 7. External links
// ─────────────────────────────────────────────────────────────────────────

export const links = {
  /** **Kickstarter campaign URL** — destination for every campaign CTA.
   *  Leave `null` while the campaign is dark: CTAs route to the on-site
   *  `/kickstarter` page instead. Paste the live URL here on launch day. */
  crowdfundingUrl: null as string | null,
  /** App Store URL for the iOS app. `null` hides the App Store CTA. */
  iosAppStore: null as string | null,
  /** Shopify checkout host — parked for v2. */
  shopifyCheckoutHost: "checkout.gripfitlab.com",
  /** Support / contact email shown to visitors, the contact-form inbox, and
   *  the default sender of automated email. Fallback only — `EMAIL_SUPPORT`
   *  (and `BREVO_SENDER_EMAIL` for the sender) override it. */
  supportEmail: "support@gripfitlab.com",
  /** Legal / privacy contact on `/privacy` and `/terms`. Fallback only —
   *  `EMAIL_LEGAL` overrides it. */
  legalEmail: "legal@gripfitlab.com",
} as const;

export const adminConfig = {
  site: siteIdentity,
  product: productSettings,
  priceExperiment,
  campaign: campaignSettings,
  emailDiscount,
  tracking: trackingSettings,
  links,
} as const;
