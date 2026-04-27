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
| Email — contact | Resend (Server Action) | Minimize custom infra |
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

- **Light-only WHOOP-thin direction** with **royal deep purple
  (`#5B21B6`)** as the accent, used *subtly*: buttons, links, focus
  rings, the logo bar, key dot accents. **Not** a flood colour. (Locked
  in Apr 26, 2026; supersedes the dark-only / amber direction below.)
- **Light-only.** `<html>` carries no `dark` class; tokens live under
  `:root`. There is no dark-mode toggle.
- **Display font: Inter Tight** at light weights (400 for the largest
  display sizes, 500 for headings). **Body font: Inter.** No third
  font; Geist was deleted in the Apr 26, 2026 revamp.
- **Zero photography in v1.** Section "imagery slots" are abstract
  light-canvas gradient panels + SVG glyphs (`design.md` §9). The home
  page also includes an `AppShowcase` section with three pure-CSS phone
  mockups whose abstract gradient screens are placeholders for real
  app screenshots.
- **No social-proof / athlete grid on the home page** (§6). The
  analogous visual slot is the `Science` research-citation section.
- Final logo and tagline are **TBD** — see §16. The current wordmark is
  inline SVG inside `components/layout/Logo.tsx`; replace when the
  final mark lands.

> **Revision history.** The previous identity was a dark-only,
> amber-accent (`#FF6A00`) direction (locked Apr 26, 2026 morning,
> reversed Apr 26, 2026 afternoon). The original placeholder identity
> was a violet "Ethereal Tech" set deleted along with the
> `DESIGN_SYSTEM/` folder during the same-day revamp.

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
  - Sold as a **pre-order SKU** through normal Shopify cart + checkout (resolved in Q3).
  - CTAs may read "Pre-order" but the mechanic is the standard Storefront-API cart flow described in §7.
  - There is **no separate waitlist email capture** in v1.
  - Variants: none
  - Price: $95
  - Inventory: tracked via Shopify (use Shopify pre-order / continue-selling-when-out-of-stock setting; expected-ship date displayed on PDP)
  - Weight: ~2 lbs (placeholder, close to final)
  - Photos: minimum 5 — hero, side, in-use, app pairing, packaging
  - Description: drafted in Shopify admin; marketing pages link/reference

Subscription products: **None on Shopify.** App subscriptions stay in StoreKit 2.

---

## 6. Page Inventory

| Route                | Purpose                                                                  | Built in |
| -------------------- | ------------------------------------------------------------------------ | -------- |
| `/`                  | Home — hero, features, how-it-works, CTA. **No social-proof section.**   | Step 5   |
| `/product`           | PDP — photos, specs, add-to-cart                                         | Step 6   |
| `/science`           | Why grip strength predicts athletic readiness                            | Step 8   |
| `/contact`           | Resend-backed contact form (Server Action submit)                        | Step 9   |
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

| Item | Decision |
| --- | --- |
| Cart UI pattern | Drawer (slides in from right) |
| Cart persistence | Shopify cart ID in HTTP-only cookie + localStorage backup |
| Checkout host | Shopify (branded `checkout.gripfit.com` subdomain) |
| Optimistic UI on add-to-cart | No (v1) — ship correct, polish later |
| Quantity selector | Yes, in cart drawer |
| Promo code field | Defer to Shopify checkout (don't replicate in cart) |
| Cross-sell in cart | None (single product) |

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
| Contact | Server Action → Resend | Email to shared Gmail (`support@gripfit.com` alias) |

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
  shopify/
    client.ts                 # typed fetch wrapper (Storefront GraphQL)
    queries.ts                # Storefront query strings
    mutations.ts              # Storefront mutation strings
    types.ts                  # handwritten Storefront response types
    index.ts                  # public API (getProduct, createCart, …)
  cart/
    context.tsx               # React Context provider (client component) — Step 7
    cookies.ts                # cart-id cookie helpers (server-only) — Step 7
  env.ts                      # Zod-validated process.env + isShopifyConfigured / isResendConfigured
  config.ts                   # siteConfig, productConfig, externalLinks
  routes.ts                   # typed nav + footer + sitemap route map (Step 4)
  utils.ts                    # cn() — shadcn

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
- [x] **5. Home page static structure** —
  - `components/marketing/{Hero,Features,HowItWorks,InTheBox,Science,CTA}.tsx` — WHOOP-style editorial sections (revamped Apr 26, 2026). Section order is Hero → Features → HowItWorks → InTheBox → Science → CTA.
  - Explicitly NO athlete grid / member-quote section per §6. The analogous visual slot is `Science` (grip-strength research citations).
  - `InTheBox` replaces the typical 3-tier "Choose a membership" pricing grid with a single bold pricing card — GripFit is a single-SKU pre-order (§5).
  - `app/page.tsx` composes the six sections.
  - Hero CTAs route to `/product` (pre-order) and `/science` (educational); both link-only — no Shopify dependency.
- [x] **Pre-deploy stubs** (so Vercel preview shows every route) —
  - `app/product/page.tsx` — graceful fallback to `productConfig.base` + design-system specs grid when Shopify env is missing; live Shopify product when configured. Add-to-cart deliberately disabled until Step 6 / 7.
  - `app/science/page.tsx`, `app/setup/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx` — placeholder copy in TSX.
  - `app/contact/page.tsx` + `components/forms/{ContactForm.tsx,contact-action.ts}` — Server Action with Zod validation, honeypot, and an `isResendConfigured` no-op branch (logs + success message until Resend env lands in Step 9).
  - `npm run build` is green; all 12 routes (home, 6 inner pages, 404, sitemap, robots) statically prerender.
- [ ] 6. Product detail page with add-to-cart (live Shopify data) — promote `/product` from stub to full PDP.
- [ ] 7. Cart drawer + Context + cookie persistence.
- [ ] 8. Marketing-page polish (`/science`, `/setup`, copywriting).
- [ ] 9. Contact form backend (replace stub with Resend send + rate limit).
- [ ] 10. SEO metadata, structured data, OG images (sitemap + robots already shipped in Step 4 prep).
- [ ] 11. Performance and accessibility audit.

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

**Q3 — Pre-order vs in-stock model. ✅ RESOLVED.**
Pre-order via Shopify, using the standard Storefront-API cart drawer +
Shopify-hosted checkout. Product is configured as a pre-order SKU on
Shopify (continue-selling-when-out-of-stock + expected-ship-date messaging).
**No separate waitlist email capture.** The design-system Hero "Pre-order"
button copy is fine; the design-system CTA section's waitlist email form is
**replaced** by a final pre-order CTA that opens the cart drawer.

**Q4 — Product naming. ✅ RESOLVED.** Canonical name is **"GripFit"**
(no "Pro" suffix). Used in all copy, hero, PDP H1, and Shopify product
handle (`gripfit`). Resolved during the Apr 26, 2026 UI revamp.

**Q5 — Tagline.** Current placeholder in `siteConfig.tagline` is
*"Force is data."* Confirm or replace before launch. The hero H1 also
uses this string — bumping it requires a touch in
`components/marketing/Hero.tsx` and `components/marketing/CTA.tsx`.

**Q6 — Logo.** The placeholder `DESIGN_SYSTEM/assets/logo.svg` was
deleted with the rest of the placeholder identity. The current wordmark
is inline SVG inside `components/layout/Logo.tsx` — uppercase "GRIPFIT"
in Inter Tight medium with a three-bar grip glyph whose middle bar is
the royal-purple accent. Replace this single file when the final mark
lands; no other component references the logo asset
directly.

**Q7 — Domain + Shopify store URL (§4).** Both still TBD. Not blocking
scaffold, but blocking deployment and Storefront token setup.

**Q8 — App Store link target.** Several sections will want a "Get the app"
or "Pair your device" CTA pointing to the iOS app. Provide the App Store
URL (or confirm "TBD — link disabled until App Store approval").

**Q9 — App screenshots for `AppShowcase`.** The home page now includes a
3-phone "App Store style" `components/marketing/AppShowcase.tsx` section
(Apr 26, 2026 PM revamp). The phone screens are abstract gradient
mockups labelled *Strength / Readiness / History*. Drop the real iOS
screenshots into `public/app/` and swap the abstract `<PhoneScreen>`
graphics for `next/image` references when the design team supplies
them. Until then the phones are intentionally generic to avoid mocking
real Apple trade dress.

