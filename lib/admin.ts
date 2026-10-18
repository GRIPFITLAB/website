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
 *   2. Product            (name, handle)
 *   3. Price experiment   (the five price arms — which one a visitor sees)
 *   4. Campaign           (Kickstarter — free shipping, CTA label, tier labels)
 *   5. Email lock         (Super Early Bird — the price an email locks in)
 *   6. Tracking           (cookie notice toggle; the Pixel id lives in env)
 *   7. External links     (Kickstarter URL, App Store, support email)
 *
 * ── Pricing model ──────────────────────────────────────────────────────────
 *
 *   Every visitor is assigned one arm of `priceExperiment.arms` (uniformly
 *   at random, remembered in a signed cookie) and sees only that arm's
 *   three numbers, always in this order:
 *
 *     Super Early Bird  = arm.emailLockUSD — locked in by joining the list.
 *     Kickstarter       = arm.kickstarterCeilingUSD — "never pay more than".
 *     Expected retail   = arm.retailUSD — after the campaign.
 *
 *   No percentages or strike-throughs: each number stands on its own.
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
// 2. Product
// ─────────────────────────────────────────────────────────────────────────

export const productSettings = {
  name: "GripFit",
  /** Shopify handle — only used if commerce relights in v2. */
  handle: "gripfit",
  /** v1 is always a Kickstarter pre-launch; flip when Shopify relights. */
  preorder: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 3. Price experiment  (five arms → which Kickstarter price to launch at)
// ─────────────────────────────────────────────────────────────────────────

export interface PriceArm {
  /** 1-based arm number — stored in the cookie and on every lead. */
  id: number;
  /** Expected retail price after the campaign, whole USD. */
  retailUSD: number;
  /** Kickstarter ceiling — the visitor will never pay more than this. */
  kickstarterCeilingUSD: number;
  /** Price locked in by joining the email list (Super Early Bird). */
  emailLockUSD: number;
}

export const priceExperiment = {
  /** Master switch. `false` = everyone sees `defaultArmId`. */
  enabled: true,
  /** Experiment id, stored on every visitor and lead so results can be
   *  grouped. Change it to start a fresh experiment — every visitor gets a
   *  new assignment. Letters, digits, dashes only (it lives in a cookie). */
  id: "ks-arms-2026-10",
  /** Each visitor is assigned one arm, uniformly at random. Ids must be
   *  1..n in order, and within an arm lock < ceiling < retail
   *  (`tests/pricing.test.ts` enforces both). Editing a live arm's numbers
   *  changes what its existing visitors see — change `id` instead. */
  arms: [
    { id: 1, retailUSD: 103, kickstarterCeilingUSD: 82, emailLockUSD: 69 },
    { id: 2, retailUSD: 124, kickstarterCeilingUSD: 99, emailLockUSD: 84 },
    { id: 3, retailUSD: 162, kickstarterCeilingUSD: 129, emailLockUSD: 109 },
    { id: 4, retailUSD: 199, kickstarterCeilingUSD: 159, emailLockUSD: 135 },
    { id: 5, retailUSD: 249, kickstarterCeilingUSD: 199, emailLockUSD: 169 },
  ] satisfies readonly PriceArm[],
  /** Arm shown when the experiment is off, or to a request with no
   *  assignment (prefetches, link-preview bots). Never recorded. */
  defaultArmId: 3,
  /** How long a visitor keeps their arm, in days. */
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
  /** Hero primary button — opens the email signup. */
  earlyBirdCtaLabel: "Get early bird pricing",
  /** Hero secondary link to the campaign / pre-launch page. */
  followLabel: "Follow on Kickstarter",
  /** Tier names shown in the pricing display. */
  tierLabels: {
    superEarlyBird: "Early bird",
    kickstarter: "Kickstarter",
    retail: "Expected retail",
  },
  /** Badge on a tier showing its saving against the next tier up.
   *  `{pct}` is the rounded whole percent. */
  discountBadge: "{pct}% off",
  /** One-line explanation under each tier; `null` shows none. */
  tierNotes: {
    superEarlyBird: "With email signup",
    kickstarter: null,
    retail: null,
  } satisfies Record<"superEarlyBird" | "kickstarter" | "retail", string | null>,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// 5. Email lock  (Super Early Bird)
// ─────────────────────────────────────────────────────────────────────────

export const emailDiscount = {
  /** Modal / footer / `/kickstarter` headline. `{price}` is replaced with
   *  the visitor's lock price. */
  headline: "Lock in {price} on Kickstarter",
  /** Submit button. `{price}` as above. */
  buttonLabel: "Lock in {price}",
  /** Shown after a successful submission. `{price}` is the price the email
   *  is locked at — for a returning email, its original lock. */
  confirmationCopy:
    "You're on the list — your Super Early Bird price is locked at {price}. Check your inbox in a couple of minutes.",
  /** Prefix on every generated reference code, e.g. `GF-7Q4KX2M9`. The
   *  code identifies the lock and proves ownership on `/unsubscribe`. */
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
