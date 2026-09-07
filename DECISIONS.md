# GripFit Web — Decisions

> Source of truth for every architectural and stack decision for the GripFit
> marketing + commerce website. Update this file when a decision changes.
> If something is missing or ambiguous, flag it in **§16 Open Questions** —
> do not write code that depends on an unanswered question.

---

## 1. Project Goal

Build a customer-facing marketing and commerce site for GripFit using a
headless Shopify architecture. The site educates prospective customers,
drives them to purchase the GripFit device, and links them to the iOS app.

**Success criteria for v1 launch**

- Visitor can learn what GripFit is, how it works, and what it costs in under 60 seconds.
- Visitor can purchase a GripFit device with a checkout that converts at industry-standard rates.
- Visitor can find setup instructions and contact us for support.
- Site is fast (LCP < 2.5s), accessible, and mobile-first.

---

## 2. Stack Decisions

| Layer | Choice | Rationale |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router) — installed `16.2.4` | Current stable as of Apr 2026; supersedes the original "Next.js 15" wording. Scaffold ships an `AGENTS.md` warning that v16 has breaking changes vs older training data — read `node_modules/next/dist/docs/` before assuming an API. |
| React | **React 19** — installed `19.2.4` | Bundled by Next.js 16. |
| Hosting | Vercel | Zero-config Next.js, preview deployments, fast |
| Language | TypeScript 5 (strict mode + `noUncheckedIndexedAccess`) | Type safety on Shopify API responses |
| Styling | Tailwind CSS **v4** (via `@tailwindcss/postcss`) | Tokens defined in CSS via `@theme`; raw values live in `app/globals.css`, prose in `design.md` |
| UI primitives | shadcn/ui — `style: base-nova`, base library: **`@base-ui/react`** (the new shadcn default, replacing Radix in `new-york`). Components are copy-paste in `components/ui/`. | Custom branding without theme lock-in. If we later add AI Elements (which require Radix APIs), re-init with `npx shadcn@latest init -d --base radix -f`. |
| Fonts | Self-hosted `@font-face` in `app/globals.css` pointing at `/public/fonts/` (Inter Tight Variable for display, Inter Variable + Inter Italic Variable for body). **Not** `next/font/local`. | `@theme inline` resolves at parse time, so it cannot read the runtime CSS variable that `next/font/local` injects. Using literal `"Inter Tight"` / `"Inter"` family names plus self-hosted `@font-face` makes Tailwind utilities (`font-sans`, `font-display`) work and avoids the documented shadcn × Tailwind v4 font gotcha. Inter Tight ships via the `@fontsource-variable/inter-tight` package; the Latin variable woff2 is copied into `/public/fonts/`. |
| Commerce | Shopify Basic ($39/mo) | Commerce platform, not just payments |
| Commerce API | Shopify Storefront API (GraphQL) | Headless-supported, public-token-safe |
| GraphQL client | Native `fetch` + typed wrappers in `lib/shopify/` | Avoid Apollo overhead |
| Forms | React Hook Form + Zod | Standard, well-supported |
| Email — orders | Shopify built-in | Handled by checkout |
| Email + contacts | **Brevo** (v3 REST, hand-rolled `fetch` wrapper in `lib/brevo/`) | Single vendor for all outbound mail and email capture. Already runs the iOS app's signup + notifications, so one API key, one verified sender domain, one contact list to reconcile against backers. Supersedes the Resend decision (Sep 7, 2026). No SDK — mirrors the `lib/shopify/` pattern. |
| Email capture store | Brevo Contacts (custom attributes) | No database in v1. Brevo is the system of record for captured emails and their discount codes. |
| Tests | **Vitest** (unit) + `next build` as the integration gate | Native ESM/TS, no config beyond a path alias. Rendering is covered by the build, which fails if a page throws while prerendering. |
| CI | GitHub Actions — lint → typecheck → test → build | Runs on every PR and push to `main`, with no secrets, proving the zero-config deploy still works. |
| Analytics | Vercel Analytics + Shopify reports | Free, sufficient for v1 |
| State | RSC + URL state + minimal client (cart only via React Context + cookie) | No Redux / Zustand |
| Node | 22 LTS — pinned via `.nvmrc` (added in Step 1 cleanup) | Matches Vercel current LTS |
| Package manager | npm | Default, zero-config on Vercel |

---

## 3. Brand and Identity

**All visual brand decisions (colors, typography, spacing, radii, shadows,
component styles, motion, iconography, voice & tone) live in
[`design.md`](./design.md).** Tokens are implemented in
[`app/globals.css`](./app/globals.css) and consumed via Tailwind v4
utilities. Do not duplicate or override them in code or in this doc.

Authoritative files:

- `design.md` — visual philosophy, token table, type scale, motion rules
- `app/globals.css` — the implementation: `@font-face`, `@theme inline`,
  and the `:root` token block
- `public/fonts/` — `InterTight-Variable.woff2` + `InterTight-Variable-Italic.woff2`
  (display), `Inter-VariableFont_opsz_wght.ttf` + `Inter-Italic-VariableFont_opsz_wght.ttf`
  (body)

Implementation rules:

- **Light-only warm-cream + warm-ink direction.** The default surface is
  `--bg-canvas` (`#F3ECE2`, warm cream). The brand "accent" is the warm
  ink `--accent` (`#1C1A17`) used as the primary CTA fill, link colour,
  focus ring, and logo bar. A separate **terracotta** `--promo`
  (`#B54A30`) is reserved exclusively for the pre-order discount UI
  (site-wide banner, strike-through pricing badge, email-modal CTA).
  (Locked Apr 29, 2026; supersedes the royal-purple direction below.)
- **Light-only.** `<html>` carries no `dark` class; tokens live under
  `:root`. There is no dark-mode toggle. Inverted dark sections use the
  `bg-inverted` (`--bg-ink`) utility — used at most twice per page (the
  comparison band and the final CTA, non-adjacent).
- **No pure white.** Cards live on `--bg-elevated` / `--bg-raised` cream
  surfaces; the canvas itself is `--bg-canvas`.
- **Pill buttons by default.** `components/ui/button.tsx` uses
  `rounded-full` in its base CVA. Cards still use `rounded-lg` /
  `rounded-xl`.
- **Display font: Inter Tight** at light weights (400 for the largest
  display sizes, 500 for headings). **Body font: Inter.** No third
  font; Geist was deleted in the Apr 26, 2026 revamp.
- **Zero photography in v1.** Section imagery is abstract warm gradient
  panels + SVG glyphs (`design.md` §9). The home page hero ships a
  labelled product-image placeholder tile; the `AppShowcase` swipe
  gallery ships pure-CSS phone mockups; the PDP ships a "Product
  photography TBD" tile. Each gets swapped for real assets when the
  design team supplies them.
- **No social-proof / athlete grid on the home page** (§6). The
  analogous visual slot is the comparison band (GripFit vs a standard
  dynamometer).
- Final logo and tagline are **TBD** — see §16. The current wordmark is
  inline SVG inside `components/layout/Logo.tsx`; replace when the
  final mark lands.

> **Revision history.** The Apr 29, 2026 revamp replaced the prior
> royal-purple direction (locked Apr 26, 2026 PM) with the warm-cream +
> warm-ink palette and added the `--promo` terracotta token for the
> discount UI. Earlier still: the placeholder violet "Ethereal Tech"
> identity that came with the original `DESIGN_SYSTEM/` folder, then a
> dark-only / amber-accent (`#FF6A00`) direction (locked Apr 26, 2026
> AM, reversed Apr 26, 2026 PM), then the royal-purple direction
> (`#5B21B6`, locked Apr 26, 2026 PM, reversed Apr 29, 2026).

---

## 4. Domain and Infrastructure

| Item | Decision |
| --- | --- |
| Apex domain | TBD — likely `gripfit.com` |
| Apex points to | Vercel |
| Shopify store URL | TBD — likely `gripfit.myshopify.com` initially |
| Branded checkout subdomain | `checkout.gripfit.com` → Shopify |
| Email domain | `support@gripfit.com` |
| Vercel team / project name | `gripfit-web` |

---

## 5. Product Catalog (Shopify side)

Phase 1 product list:

- **GripFit (base device)**
  - **v1 sells via an external crowdfunding campaign**, not Shopify
    (resolved Apr 29, 2026 — supersedes the prior Q3 "Shopify pre-order"
    decision). All "Pre-order" / "Back the campaign" CTAs hand off to
    `externalLinks.crowdfundingUrl` (defined in `lib/config.ts`).
  - MSRP: **$149**. Kickstarter pre-order discount: **25% off** (sale
    price $111.75) plus **free US shipping**. Values live in
    `lib/admin.ts`; `lib/config.ts → discountConfig.preorder` types them,
    so updating a percent or the free-shipping toggle touches one file.
  - First-visit email-capture modal offers an **extra 15% off**
    (`discountConfig.email`) that **stacks on top of the 25% Kickstarter
    discount** — combined effective discount on MSRP is
    1 − 0.75 × 0.85 = 36.25% (stacked sale price $94.99, computed by
    `getStackedPreorderPricing()`).
  - Each captured email receives a **unique code** (`GF-XXXXXXXX`,
    40 bits of Crockford base32 from `crypto.getRandomValues`), stored as
    a `DISCOUNT_CODE` attribute on the Brevo contact. One code per
    address, re-sent rather than re-issued on repeat submits, so a leaked
    code is traceable to the address it was issued to. Generation lives
    in `lib/discount-code.ts`.
  - **Redemption is unresolved** — see §16 Q14. Codes are issued, stored,
    and exportable; how a code grants a discounted Kickstarter reward
    tier is decided when the campaign is set up.
  - There is **no separate waitlist email capture** beyond the discount
    modal.
  - Variants: none.
  - Photos: minimum 5 — hero, side, in-use, app pairing, packaging.
    Currently placeholders (`design.md` §9).
  - Description: marketing copy lives in TSX (`§10`); long-form is
    eventually owned by Shopify admin in v2 when commerce relights.

Subscription products: **None on Shopify in v1** (Shopify itself is
parked). App subscriptions stay in StoreKit 2.

> **Revision history.** Q3 was originally "Shopify pre-order SKU"
> (resolved Apr 26, 2026). It was reopened and re-resolved on Apr 29,
> 2026 in favour of the external crowdfunding model above. The
> `lib/shopify/` client and its `lib/cart/` neighbour are intentionally
> retained on disk for v2 — see §7 and §16 Q3.

---

## 6. Page Inventory

| Route                | Purpose                                                                  | Built in |
| -------------------- | ------------------------------------------------------------------------ | -------- |
| `/`                  | Home — hero, features, how-it-works, CTA. **No social-proof section.**   | Step 5   |
| `/product`           | PDP — photos, specs, add-to-cart                                         | Step 6   |
| `/science`           | Why grip strength predicts athletic readiness                            | Step 8   |
| `/kickstarter`       | Campaign holding page — "in preparation" + launch-notice email capture   | Sep 2026 |
| `/contact`           | Brevo-backed contact form (Server Action submit)                        | Step 9   |
| `/setup`             | Pairing / setup guide                                                    | Step 8   |
| `/privacy`           | Privacy policy (TSX)                                                     | Step 8   |
| `/terms`             | Terms of service (TSX)                                                   | Step 8   |
| `app/not-found.tsx`  | Branded 404 (catch-all; not in nav)                                      | Step 4   |

**Out of scope for v1** (do **not** build): `/about`, `/faq`,
`/shipping`, blog, customer login, account dashboard, gift cards.

The cart drawer is a global UI element, not a route. Checkout is hosted by
Shopify on `checkout.gripfit.com`.

---

## 7. Cart and Checkout Decisions

**v1: no on-site cart.** Pre-orders hand off to the external
crowdfunding campaign (Decisions.md §5, §16 Q3, Q10). The table below
documents the planned v2 cart so that the parked `lib/shopify/` and
`lib/cart/` clients have a forward-compatible spec to wake up to:

| Item | Decision (planned for v2) |
| --- | --- |
| Cart UI pattern | Drawer (slides in from right) |
| Cart persistence | Shopify cart ID in HTTP-only cookie + localStorage backup |
| Checkout host | Shopify (branded `checkout.gripfit.com` subdomain) |
| Optimistic UI on add-to-cart | No — ship correct, polish later |
| Quantity selector | Yes, in cart drawer |
| Promo code field | Defer to Shopify checkout (don't replicate in cart) |
| Cross-sell in cart | None (single product) |

**Implementation rule for v1:** no component imports anything from
`lib/shopify/` or `lib/cart/`. The `/product` page reads from
`productConfig` + `discountConfig` only. The dormant clients stay on
disk so v2 doesn't have to rewrite them; they're excluded from the
runtime bundle by virtue of having no consumers.

---

## 8. Customer Accounts

**Phase 1: No accounts.** Customers receive order confirmation by email; order
lookup by email + order number if needed.

**Rationale:** Account creation friction at checkout reduces conversion.
Single-product pre-launch doesn't justify the build cost. Revisit when
repeat-purchase or warranty-claim volume warrants it.

Future: the iOS app may add a "Register product" section in Settings that
links an order # to an App Store account.

---

## 9. Forms and Email

| Form | Backend | Notification |
| --- | --- | --- |
| Contact | Server Action → Brevo transactional (`/smtp/email`) | Delivered to `CONTACT_EMAIL_TO`; `replyTo` is the submitter so replying answers them directly. Sender is always the verified Brevo address — sending as the visitor's domain would fail SPF/DKIM. |
| Email-discount capture (extra 15% off, stacks on Kickstarter) | Server Action → Brevo Contacts (`/contacts`, `updateEnabled: true`) then Brevo transactional | Upserts the contact into `BREVO_WEBSITE_LIST_ID` with a unique `DISCOUNT_CODE` attribute, then emails the code. Three surfaces share the same `submitEmailDiscount` action and the same `EMAIL_DISCOUNT_DISMISSED_KEY` localStorage flag: (a) first-visit `<EmailDiscountModal />` mounted in `app/layout.tsx`, (b) always-visible `<EmailDiscountForm variant="footer" />` in the footer, (c) `<EmailDiscountTeaser />` next to every "Back the campaign" CTA. The teaser opens the modal via the `gripfit:open-email-discount` custom event (`lib/email-discount-events.ts`) — no Context provider, no prop drilling. |

---

## 10. Content Strategy

| Content type | Lives in | Edit method |
| --- | --- | --- |
| Product titles, prices, photos | Shopify admin | Shopify dashboard |
| Marketing copy (home, science, etc.) | Code (TSX) | Code commit + deploy |
| Instructions / setup guide | Code (TSX) — resolved | Code commit + deploy |
| Legal pages | Code (TSX) — resolved | Code commit + deploy |
| Demo videos | TBD — YouTube unlisted, Mux, or Vimeo | Replace via URL change |

**Resolved:** all long-form copy is TSX, not MDX. Rationale: only three
pages (`/setup`, `/privacy`, `/terms`) are long-copy, they update rarely,
and TSX lets us drop shadcn components inline without configuring
`@next/mdx`. Revisit Sanity / Shopify metaobjects in Phase 2 if a
non-technical contributor needs edit access.

---

## 11. SEO Foundations

| Item | Decision |
| --- | --- |
| Sitemap | Auto-generated via Next.js convention |
| `robots.txt` | Allow all in production, disallow in preview |
| OG images | Per-page via Next.js Metadata API |
| Structured data | Product schema on PDP, Organization schema sitewide |
| Canonical URLs | Enforced via Metadata API |
| Analytics | Vercel Analytics (no GA4 until needed) |

---

## 12. Security and Privacy

| Item | Decision |
| --- | --- |
| Storefront API token | Public-by-design, stored in env var |
| Admin API token | Not used in frontend; webhook-only if at all |
| Customer PII storage | Zero — Shopify is sole store of customer data |
| CSP headers | Configured in Next.js middleware |
| Rate limiting | None at launch; add Upstash if spam appears |
| Cookie consent | Add — looks polished, covers EU visitors |

---

## 13. Performance Targets

| Metric | Target |
| --- | --- |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| Lighthouse Performance (mobile) | > 90 |
| Lighthouse Accessibility | > 95 |
| Lighthouse SEO | 100 |

---

## 14. Repository Structure

```
app/
  layout.tsx                  # global layout: <html dark>, fonts, nav, footer
  page.tsx                    # /
  product/page.tsx            # /product (PDP, Step 6)
  science/page.tsx            # /science (Step 8)
  contact/page.tsx            # /contact (Step 9)
  setup/page.tsx              # /setup (Step 8)
  privacy/page.tsx            # /privacy (Step 8)
  terms/page.tsx              # /terms (Step 8)
  not-found.tsx               # branded 404 (Step 4)
  sitemap.ts                  # auto-generated from lib/routes.ts (Step 4)
  robots.ts                   # /robots.txt generator (Step 4)
  globals.css                 # Tailwind base + design.md token implementation
  favicon.ico

components/
  layout/                     # Nav, Footer, MobileMenu, Logo
  marketing/                  # Hero, Features, HowItWorks, InTheBox, Science, CTA  (NO athlete grid — §6)
  product/                    # Gallery, Specs, BuyBox, AddToCartButton
  cart/                       # CartDrawer, CartItem, CartButton, CartProvider
  forms/                      # ContactForm + colocated Server Action
  ui/                         # shadcn primitives (button, sheet, dialog, …)

lib/
  brevo/
    client.ts                 # typed fetch wrapper + BrevoHttpError / BrevoNetworkError
    types.ts                  # handwritten subset of the Brevo v3 shapes
    index.ts                  # public API (getContact, upsertContact, sendTransactionalEmail)
  shopify/                    # parked for v2 — no importers (§7)
    client.ts                 # typed fetch wrapper (Storefront GraphQL)
    queries.ts                # Storefront query strings
    mutations.ts              # Storefront mutation strings
    types.ts                  # handwritten Storefront response types
    index.ts                  # public API (getProduct, createCart, …)
  admin.ts                    # THE control panel — prices, discounts, copy, links
  config.ts                   # typed exports + pricing helpers + `campaign` link switch
  discount-code.ts            # unique per-email code generation
  email-discount-events.ts    # modal custom-event channel + safe storage helpers
  env.ts                      # Zod-validated process.env + isBrevoConfigured / isShopifyConfigured
  routes.ts                   # typed nav + footer + sitemap route map (Step 4)
  utils.ts                    # cn() — shadcn

tests/                        # Vitest units — see §2
  pricing.test.ts             # stacked discount maths + formatUSD
  config.test.ts              # admin.ts → config.ts invariants
  copy.test.ts                # banner/modal percentages match the numbers
  discount-code.test.ts       # format, uniqueness, non-guessability
  contact-action.test.ts      # validation, honeypot, HTML escaping, Brevo mocked
  email-discount-action.test.ts # validation, code reuse, degraded modes
  routes.test.ts              # route map ⇔ app/ directory parity

.github/workflows/ci.yml      # lint → typecheck → test → build

public/
  fonts/                      # self-hosted Inter Tight Variable + Inter Variable + Inter Italic Variable
  …

design.md                     # visual identity (tokens, type, motion) — see §3
iOS_App_Images/               # untouched — reference imagery only
Decisions.md                  # this doc
AGENTS.md                     # agent rules (Decisions first, light-only, …)
README.md
```

**Rules:**

1. No Server Actions in `lib/actions/` — co-locate them with the
   component that calls them (e.g. the contact form).
2. No `app/api/` folder unless something a non-React client needs to call;
   the contact form uses a Server Action (resolved in §16 Q2).
3. No `content/` folder; `/setup`, `/privacy`, `/terms` are TSX (resolved
   in §10).
4. No additional folder nesting beyond what is shown above.

---

## 15. Build Order

Stop for review after each step. Do not proceed to the next step without explicit instruction.

- [x] **1. Project scaffold** — Next.js 16.2.4 + React 19.2.4 + TS strict (`noUncheckedIndexedAccess` on) + Tailwind v4 + App Router. `.nvmrc` pinned to 22. ESLint flat config, `npm run typecheck`.
- [x] **2. shadcn/ui init + design-token wiring** —
  - `npx shadcn@latest init -d` (style `base-nova`, base `@base-ui/react`, baseColor `neutral`).
  - `app/globals.css` rewritten: literal-name fonts in `@theme inline`, `@font-face` for Inter Tight Variable (display) + Inter Variable / Inter Italic Variable (body) from `/public/fonts/`, all shadcn semantic tokens mapped to GripFit values under `:root { … }` (light-only), radii overridden to absolute pixel values from `design.md`. (The Apr 26, 2026 afternoon revamp flipped the theme from dark-only to light-only and replaced Geist with Inter Tight as the display font.)
  - `app/layout.tsx` rewritten: light theme is the default (no `dark` class on `<html>`), Inter Tight Variable preloaded as the LCP-critical display font, GripFit `Metadata` + `Viewport`.
  - `lib/env.ts` (Zod-validated `NEXT_PUBLIC_SHOPIFY_*`, `SHOPIFY_*`, `RESEND_*`, `CONTACT_EMAIL_*`).
  - `lib/config.ts` (`siteConfig`, `productConfig`, `externalLinks`). The earlier `brandConfig` was removed during the Apr 26 UI revamp — the wordmark is rendered inline in `components/layout/Logo.tsx`.
  - `.env.example` template.
  - `components/ui/button.tsx` shipped by shadcn init; further components added on demand.
- [x] **3. Shopify Storefront API client** —
  - `lib/shopify/types.ts` (handwritten subset of Storefront types: `Money`, `Image`, `Product`, `ProductVariant`, `Cart`, `CartLine`, `UserError`, etc.).
  - `lib/shopify/queries.ts` (fragments + `PRODUCT_BY_HANDLE_QUERY`, `CART_BY_ID_QUERY`).
  - `lib/shopify/mutations.ts` (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`).
  - `lib/shopify/client.ts` (`shopifyFetch<T>()`, `ShopifyHttpError`, `ShopifyGraphQLErrorBag`, `ShopifyUserError`, `ShopifyCacheTags`).
  - `lib/shopify/index.ts` (public surface: `getProductByHandle`, `getCart`, `createCart`, `addToCart`, `updateCartLines`, `removeCartLines`).
  - Reads use Next.js Data Cache (`next: { revalidate: 60, tags: [...] }`); cart mutations always use `cache: 'no-store'`.
- [x] **4. Site shell** —
  - `lib/routes.ts` — single source of truth for nav/footer/sitemap.
  - `components/layout/{Logo,Nav,MobileMenu,Footer}.tsx` — sticky nav with translucent backdrop, shadcn-Sheet mobile menu, footer link grid.
  - `app/layout.tsx` wires Nav + `<main>` + Footer.
  - `app/not-found.tsx` — branded 404.
  - Build prep: `.vercelignore` (excludes `iOS_App_Images/`, agent transcripts), `app/sitemap.ts`, `app/robots.ts`.
- [x] **5. Home page static structure** — *Jun 28, 2026 revamp*
  - `components/marketing/{Hero,Comparison,AppShowcase,Features}.tsx` — warm-cream editorial sections. Order: Hero → Comparison → AppShowcase → Features. (Earlier Apr 29 line-up was Hero → Features → Readiness → AppShowcase → Comparison → InTheBox; the standalone `Readiness` section and the bottom `InTheBox` pricing card were dropped from the home page — both files stay on disk, unused.)
  - Explicitly NO athlete grid / member-quote section per §6. The analogous visual slot is `Comparison` (GripFit vs standard dynamometer on a `bg-inverted` band), now placed directly under the hero.
  - The hero product card carries the "what's in the box" checklist (folded in from the removed `InTheBox`). There is no longer a duplicate bottom pricing card; the hero is the single pricing + buy-link surface on the home page.
  - `components/marketing/{DiscountBanner,EmailDiscountModal,PricingDisplay}.tsx` ship the pre-order discount UI: site-wide terracotta banner above the nav, first-visit "extra 15% off" email-capture modal on the home page (stacks on the 30% Kickstarter discount), and a strike-through pricing widget reused by Hero / PDP. All read from `lib/config.ts → discountConfig`.
  - Hero CTAs: primary "Back the campaign" routes to `externalLinks.crowdfundingUrl`; secondary is "Talk to us" (→ `/contact`).
- [x] **Pre-deploy stubs** (so Vercel preview shows every route) —
  - `app/product/page.tsx` — graceful fallback to `productConfig.base` + design-system specs grid when Shopify env is missing; live Shopify product when configured. Add-to-cart deliberately disabled until Step 6 / 7.
  - `app/science/page.tsx`, `app/setup/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx` — placeholder copy in TSX.
  - `app/contact/page.tsx` + `components/forms/{ContactForm.tsx,contact-action.ts}` — Server Action with Zod validation, honeypot, and an `isResendConfigured` no-op branch (logs + success message until Resend env lands in Step 9).
  - `npm run build` is green; all 12 routes (home, 6 inner pages, 404, sitemap, robots) statically prerender.
- [x] ~~6. Product detail page with add-to-cart (live Shopify data)~~ — **deferred to v2** (§16 Q3). v1 PDP is crowdfunding-driven.
- [x] ~~7. Cart drawer + Context + cookie persistence~~ — **deferred to v2**.
- [ ] 8. Marketing-page polish (`/science`, `/setup`, copywriting) — **final copy still outstanding**; see §16 Q15.
- [x] **9. Email backend — Brevo.** *Sep 7, 2026.*
  - `lib/brevo/{client,types,index}.ts` — typed `fetch` wrapper, `BrevoHttpError` / `BrevoNetworkError`, 10s timeout.
  - `lib/discount-code.ts` — unique `GF-XXXXXXXX` codes, Crockford base32, `crypto.getRandomValues`.
  - `submitEmailDiscount` — validate → look up contact → reuse or mint a code → upsert into `BREVO_WEBSITE_LIST_ID` → send the code. Idempotent per address.
  - `submitContact` — validate → Brevo transactional to `CONTACT_EMAIL_TO`, `replyTo` the submitter, submitted text HTML-escaped.
  - Both keep the degraded branch: with no Brevo env set they validate, log, and report success, so the zero-config deploy still works (CI proves it).
  - Rate limiting still deferred (§12) — honeypot only.
- [ ] 10. SEO metadata, structured data, OG images (sitemap + robots already shipped in Step 4 prep; robots now disallows non-production).
- [ ] 11. Performance and accessibility audit.
- [x] **12. Production hardening.** *Sep 7, 2026.*
  - Pricing moved to $149 / 25% / +15% stacked (§16 Q12).
  - `/kickstarter` holding page added; `campaign.href` switch replaces the `/contact` CTA fallback (§16 Q10).
  - Vitest suite (62 tests) + GitHub Actions CI: lint → typecheck → test → build.
  - Dead code removed: `components/marketing/{InTheBox,Readiness}.tsx` (orphaned since the Jun 28 revamp).
  - Bugs fixed: `robots.txt` allowed indexing of preview deploys; `ContactForm` used a `text-success` class that no token defines; `/science` citations linked to `#`; `localStorage` writes were unguarded and threw when a browser blocks site data; `DiscountBanner` tripped `react-hooks/set-state-in-effect` (now `useSyncExternalStore`).
  - `@types/node` bumped 20 → 22 to match `.nvmrc`.

---

## 16. Open Questions / Conflicts

These must be resolved before the dependent build steps can proceed.
The agent will ask one at a time.

**Q1 — Page Inventory. ✅ RESOLVED.** See §6 for the locked list.
Out of scope for v1: `/about`, `/faq`, `/shipping`, blog. Home page does
**not** have a social-proof section.

**Q2 — Repository structure. ✅ RESOLVED.** See §14. Sub-decisions:

- Contact form submits via **Server Action**, not a Route Handler. No
  `app/api/contact/` folder. Action is co-located in `components/forms/`.
- Long-copy pages (`/setup`, `/privacy`, `/terms`) are **TSX**, not MDX.
  No `content/` folder, no `@next/mdx` dependency.

**Q3 — Pre-order vs in-stock model. ✅ RE-RESOLVED Apr 29, 2026;
pricing updated Sep 7, 2026.**
v1 routes pre-orders through an **external crowdfunding campaign**
(Kickstarter, URL TBD — see Q10). Shopify is parked. All "Pre-order" /
"Back the campaign" CTAs hand off to `campaign.href`. The Kickstarter
pre-order discount is **25% off + free US shipping** on a $149 MSRP,
baked into `discountConfig.preorder` (sale price $111.75). Visitors who
provide their email get an **additional 15% off** code via the
`EmailDiscountModal` (`discountConfig.email`) that **stacks on top of the
25%** for a combined 36.25% off MSRP (`getStackedPreorderPricing()`,
$94.99).

> The Apr 26, 2026 resolution (Shopify pre-order SKU) was superseded
> when crowdfunding became the v1 pre-launch strategy. The
> `lib/shopify/` client stays on disk for v2.

**Q4 — Product naming. ✅ RESOLVED.** Canonical name is **"GripFit"**
(no "Pro" suffix). Used in all copy, hero, PDP H1, and Shopify product
handle (`gripfit`). Resolved during the Apr 26, 2026 UI revamp.

**Q5 — Tagline.** Current working tagline in `siteIdentity.tagline`
(`lib/admin.ts`) is *"Measure every squeeze."* (replaced the earlier
*"Force is data."* on Jun 28, 2026). Confirm or replace before launch.
The hero H1 and the `<title>` both read `siteConfig.tagline`, so a
change only requires editing `lib/admin.ts`.

**Q6 — Logo.** The placeholder `DESIGN_SYSTEM/assets/logo.svg` was
deleted with the rest of the placeholder identity. The current wordmark
is inline SVG inside `components/layout/Logo.tsx` — uppercase "GRIPFIT"
in Inter Tight medium with a three-bar grip glyph whose middle bar is
the warm-ink accent (`--accent`). Replace this single file when the
final mark lands; no other component references the logo asset
directly.

**Q7 — Domain (§4).** Apex domain still TBD. Not blocking scaffold,
but blocking production deployment. The Shopify store URL portion of
this question is parked alongside Shopify itself in v1.

**Q8 — App Store link target.** Several sections will want a "Get the app"
or "Pair your device" CTA pointing to the iOS app. Provide the App Store
URL (or confirm "TBD — link disabled until App Store approval").

**Q9 — App screenshots for `AppShowcase`.** The home page swipe gallery
in `components/marketing/AppShowcase.tsx` ships pure-CSS phone mockups
(*Strength / Readiness / History*). Drop the real iOS screenshots into
`public/app/` and swap the abstract `<PhoneScreen>` graphics for
`next/image` references when the design team supplies them. Until then
the phones are intentionally generic to avoid mocking real Apple trade
dress.

**Q10 — Crowdfunding URL. ⏳ OPEN, but no longer blocking.** The
campaign is Kickstarter; the exact URL is **TBD** because the campaign
page isn't built yet. `lib/admin.ts → links.crowdfundingUrl` is `null`,
which routes every CTA to the on-site **`/kickstarter` holding page**
(campaign-in-preparation blurb + launch-notice email capture) rather
than to a dead `#` or an off-topic `/contact`. Paste the live URL into
`lib/admin.ts` on launch day and every CTA site-wide switches to it,
opening in a new tab — no component edits, no other file touched.
`lib/config.ts → campaign` owns that switch.

**Q11 — Hero product image.** The hero now reserves a right-column
slot for a product render or photograph. Currently a labelled placeholder
tile (`design.md` §9). Drop the final art into `public/product/hero.*`
and reference it via `next/image` once the design team supplies it.

**Q12 — Pricing.** ✅ RE-RESOLVED Sep 7, 2026. MSRP set to **$149**,
Kickstarter pre-order discount **25% off** (sale price $111.75),
email-modal discount **extra 15% off** that **stacks on the Kickstarter
discount** (combined 36.25% off MSRP = $94.99, computed by
`getStackedPreorderPricing()`). All values flow from `lib/admin.ts`; no
UI component encodes a percent or price literal, and
`tests/copy.test.ts` fails the build if a banner sentence drifts from
the number it describes. Replaces the Jun 28, 2026 $135 / 30% / $94.50
line-up (itself replacing Apr 29's $175 / 40% / $105).

**Q13 — Specs change wording.** The Apr 29, 2026 revamp removed the
"Specifications are subject to minor change before the production run
ships…" disclaimer from the PDP. If legal needs that hedge back, add
it as a footnote on `/product` only (not on every spec section).

**Q14 — Discount-code redemption on Kickstarter. ⏳ OPEN (owner: AS).**
The site issues a unique code per captured email and stores it on the
Brevo contact (§5). **How a backer actually redeems it is undecided.**
Kickstarter has no native promo-code field; the likely mechanism is a
set of **secret/limited reward tiers** priced at the stacked discount,
whose URLs are sent only to people on the list — which makes the code
a reference for reconciliation rather than something typed at checkout.

Resolve when the Kickstarter campaign is set up. Until then the code
email deliberately says *"we'll write to you the day it opens, with
instructions for applying your code"* — it promises no specific
redemption mechanism. Nothing in the codebase depends on the answer;
only the copy in `components/marketing/email-discount-action.ts` and
the launch-day announcement do.

Depends on Q10 (campaign URL).

**Q15 — Final copy and imagery. ⏳ OPEN (owner: design/AS).** The site
is structurally complete but still ships interim copy in places:
`/setup` steps, `/science` citations (listed without DOI links until
they're confirmed), and the home-page section copy. Imagery is still
abstract per §3 — hero product tile, PDP photography slot, and the
`AppShowcase` phone mockups all await real renders and screenshots
(Q9, Q11). None of this blocks deployment; all of it blocks *launch*.

**Q16 — Support mailbox. ⏳ OPEN.** `links.supportEmail`
(`support@gripfit.com`) is displayed in the footer and on `/setup` but
the mailbox does not exist — those `mailto:` links currently bounce.
Separately, `CONTACT_EMAIL_TO` (where the contact form delivers) and
`BREVO_SENDER_EMAIL` (a Brevo-verified sender) must be set before
launch or no mail is sent at all.

