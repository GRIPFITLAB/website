<!-- BEGIN:gripfit-project-rules -->
# GripFit Web — agent context

Project-specific rules for AI assistants. Read these before the Next.js notes below.

1. **Read [`DECISIONS.md`](./DECISIONS.md) in full before changing anything.**
   §16 lists open questions — do not write code that depends on an unanswered
   one without flagging it first. §17 documents the price experiment.
2. **Visual tokens are owned by [`design.md`](./design.md) + [`app/globals.css`](./app/globals.css) + [`lib/theme.ts`](./lib/theme.ts).**
   `design.md` is prose / intent; `globals.css` is the Tailwind implementation;
   `lib/theme.ts` is the same palette as TS literals for emails, `theme-color`,
   and SVG. Raw colour values appear in those two code files and nowhere
   else — `tests/theme.test.ts` asserts they agree. Layout and type
   primitives live in `components/ui/section.tsx` (`Container`, `Section`,
   `SectionHeader`), `components/ui/typography.tsx` (`Eyebrow`, `Display`,
   `Lead`, `Meta`) and `components/ui/surface.tsx`; marketing components
   compose those rather than restating class strings. To add a colour, font,
   or radius: extend `design.md`, then mirror into `globals.css` and
   `lib/theme.ts`.
3. **The site is dark-only: deep-navy canvas + electric-blue accent, matching
   the iOS app.** `color-scheme: dark`; tokens live under `:root`. Canvas is
   `--bg-canvas` (`#0a1328`); the brand accent is `--accent` (`#3b82f6`, with
   `--accent-bright` for text/links on dark) — primary CTA fill, links, focus
   rings, the "G" mark. A separate **mint** `--promo` (`#34d399`) is reserved
   for the early bird / discount UI only (early bird card, "% off" badge, email CTA).
   The saturated-blue `bg-inverted` band is used once per page (the
   comparison). Do not add a light mode or a toggle. Do not use `--promo` for
   navigation, body emphasis, or dividers. The warm-cream direction was
   reversed in the Oct 15, 2026 launch revamp; see DECISIONS.md §3.
4. **No on-site Shopify cart in v1.** CTAs drive to the external crowdfunding
   URL in `lib/admin.ts` (`links.crowdfundingUrl`; `/kickstarter` holding page
   while it is `null`). The `lib/shopify/` client is parked for v2 — files
   stay, nothing imports from it (DECISIONS.md §7, §16 Q3). No customer
 accounts (§8). The pricing UI: the three-card `PricingDisplay` (Early bird
 with "With email signup", Kickstarter, struck-through Expected retail; the
 first two carry a flat "15% off" / "20% off" pill beside the label — never
 more than the real saving in any arm, test-enforced),
 plus an email-capture flow that locks in the early bird price. There is no
 site-wide banner (removed Oct 18, 2026 as repetitive).
   Three surfaces share one Server Action (`submitEmailDiscount`) and one
   `EMAIL_DISCOUNT_DISMISSED_KEY` localStorage flag: (a) `<EmailDiscountModal />`
   in `app/layout.tsx` (auto-opens once; re-open anywhere via the
   `gripfit:open-email-discount` event), (b) `<EmailDiscountForm
   variant="footer" source="footer" showConsent />` at the top of the footer,
   (c) in the Hero, the primary `<EmailLockButton />` ("Get early bird pricing")
 with a "Follow on Kickstarter →" link to `campaign.href` beside it; in the
 mobile menu, `<EmailDiscountTeaser />` beside the "Back on Kickstarter" CTA
 (not in `ClosingCta` — the footer form sits right below).
   Every form shows the no-commitment line (`emailDiscount.noCommitmentCopy`)
   under the input. Modal and `/kickstarter` cards are otherwise header + input only; the footer adds the
   single consent line. Pass the correct `source` so the lead DB knows which
   surface converted.
5. **No social-proof / athlete grid on the home page** (DECISIONS.md §6).
   The comparison band (GripFit vs a standard dynamometer) is the analogous
   slot. There is no `/product` page — specs live in `components/marketing/Specs.tsx`
   and `/product` 308-redirects home.
6. **Real app screens only.** `public/app/screen-*.png` are the App Store
   panels, rendered with `next/image` in `Hero` and `AppShowcase`. No stock
   photography, no CSS phone mockups, no "TBD" / "placeholder" / "illustrative"
   copy anywhere on the site. Originals are in `assets/source/` (gitignored);
   the committed web-sized PNGs are derived from them.
7. **Display font is Inter Tight (weight 500), body is Inter.** Both are
   self-hosted variable fonts under `/public/fonts`. No third font.
8. **Server Components by default.** Add `"use client"` only for
   interactivity, browser APIs, or hooks. Client state is localStorage
   (modal / cookie-notice dismissal) plus the read-only
   `PricingProvider` context seeded from the server — no Redux / Zustand /
   SWR. Every page is dynamic because `app/layout.tsx` reads the visitor's
   price assignment; that is intentional.
9. **No hardcoded prices, product handles, API endpoints, env values, or
   colours in components.** Editable values live in **[`lib/admin.ts`](./lib/admin.ts)**
 — the five price arms, default arm, email-lock copy templates, tier
 labels/notes, CTA label, links, support email, cookie-notice copy.
 `lib/config.ts` composes the typed `siteConfig`, `productConfig`,
 `discountConfig`, `trackingConfig`, `externalLinks`, `campaign` exports;
 **`lib/pricing.ts`** owns all pricing math (`computePricing(armId)`,
 `savingPct` / `discountBadge`, `emailLock*` copy helpers, `campaignBannerCopy`
 for the mobile menu). Components read prices
 through `usePricing()` (client) or `getVisitorPricing()` (server) — never
 from `admin.ts` directly — so the per-visitor arm flows everywhere. Sentences
   that quote a number are generated, not typed; `tests/copy.test.ts` checks
   them. Env-derived values stay in `lib/env.ts`.
10. **Price experiment + tracking (DECISIONS.md §17).** `proxy.ts` assigns a
 signed, httpOnly `gf_exp` cookie (visitor id + price arm) and a first-touch
    `gf_attr` attribution cookie, and forwards them as request headers.
    `lib/experiment/server.ts → getVisitorContext()` is the only way to read
    them. Leads, visitors, and contact messages persist to Firestore via
    `lib/experiment/store.ts`; Brevo stays the email/code provider. Meta
    Pixel (`components/tracking/MetaPixel.tsx`) and Conversions API
    (`lib/tracking/meta-capi.ts`) share a browser-generated `event_id` for
    dedup. **Never send an email address or other directly identifying value
    to Meta in ordinary event parameters** — hashed email in CAPI `user_data`
    only. Any new cookie or tracker must be disclosed in `app/privacy/page.tsx`.
    Every integration must no-op cleanly when its env var is unset.
11. **Skills to consult:** `nextjs`, `shadcn`, `vercel-functions`,
    `firebase-firestore` (for the lead store). (No `auth` — accounts
    disallowed in v1. No `shopify-*` skills until `lib/shopify/` is
    reawakened in v2.)
<!-- END:gripfit-project-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
