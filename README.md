# GripFit Web

Customer-facing marketing site for GripFit — a precision hand
dynamometer that pairs with iOS. Built on Next.js 16 + Vercel. v1
drives backers to an external Kickstarter campaign; the headless
Shopify client in `lib/shopify/` is parked for v2 (Decisions.md §16
Q3).

## Source of truth

- **[`lib/admin.ts`](./lib/admin.ts)** — control-panel for price,
  campaign discount, email discount, banner copy, and links. Edit a
  value here and it propagates to every banner, button, hero, modal,
  and PDP automatically. Touch this first for any pricing or copy
  tweak.
- **[`Decisions.md`](./Decisions.md)** — every architectural and stack
  decision, plus open questions in §16. Read this before changing anything
  non-trivial.
- **[`design.md`](./design.md)** — visual identity (colors, type,
  spacing, components, motion, voice). The implementation lives in
  [`app/globals.css`](./app/globals.css). Extend `design.md` before
  inventing tokens in components.
- **[`AGENTS.md`](./AGENTS.md)** — Next.js 16 has breaking changes vs older
  training data; consult `node_modules/next/dist/docs/` before assuming an
  API.

## Stack at a glance

- Next.js `16.2.4` (App Router) · React `19.2.4`
- TypeScript 5, strict + `noUncheckedIndexedAccess`
- Tailwind CSS v4 via `@tailwindcss/postcss`
- shadcn/ui (style: `base-nova`, base: `@base-ui/react`)
- Zod for env + form validation
- Brevo for all outbound email + email capture (typed `fetch` wrapper in `lib/brevo/`)
- Shopify Storefront API (typed `fetch` wrapper — parked for v2)
- Vitest units + GitHub Actions CI (lint → typecheck → test → build)
- Vercel hosting (no analytics package installed — see DECISIONS §12)

## Local development

```bash
nvm use            # Node 22 LTS, see .nvmrc
npm install
npm run dev        # http://localhost:3000
```

No env file is required — the app runs with nothing set. See
[`docs/ADMIN.md`](./docs/ADMIN.md) §4 for the variable list.

Useful scripts:

| Command            | What it does                          |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Next.js dev server (Turbopack)         |
| `npm run build`    | Production build                       |
| `npm run start`    | Run production build locally           |
| `npm run lint`     | ESLint (Next.js core-web-vitals + TS)  |
| `npm run typecheck`| `tsc --noEmit`                         |
| `npm test`         | Vitest unit suite                      |
| `npm run test:watch`| Vitest in watch mode                  |

CI runs all four gates (`lint`, `typecheck`, `test`, `build`) on every PR.

## Repository layout

The `Decisions.md` §14 / §16 Q2 layout is the canonical structure. Today
only `app/`, `components/`, `lib/`, and `public/` exist; the rest will be
added as the corresponding build steps land.

## What's NOT in this repo

- The iOS app — separate codebase. Reference imagery in `iOS_App_Images/`.
- Customer accounts — none in v1 (Decisions.md §8).
- A CMS — marketing copy lives in TSX (Decisions.md §10).
- An on-site cart — v1 routes backers to the external crowdfunding
  campaign via `externalLinks.crowdfundingUrl`. The Shopify client in
  `lib/shopify/` is parked for v2 (Decisions.md §7, §16 Q3).

## Build status (per Decisions.md §15)

- [x] 1. Project scaffold (Next.js + TS + Tailwind v4 + App Router)
- [x] 2. shadcn/ui init + design-token wiring
- [x] 3. Shopify Storefront API client (`lib/shopify/`)
- [x] 4. Site shell — Nav, Footer, MobileMenu, branded 404, sitemap, robots
- [x] 5. Home page — Hero, Specs, Comparison, AppShowcase, WhyGrip, ClosingCta + DiscountBanner / EmailDiscountModal (no athlete-grid social proof per §6)
- [x] **All routes live** — `/science`, `/setup`, `/contact`, `/kickstarter`,
  `/privacy`, `/terms`, `/unsubscribe`. `/product` was removed Oct 15, 2026
  (specs folded into the home page; permanent redirect to `/`).
- [x] ~~6. PDP with live add-to-cart (Shopify required)~~ — **deferred to v2** (DECISIONS.md §16 Q3).
- [x] ~~7. Cart drawer + Context + cookie persistence~~ — **deferred to v2**.
- [ ] 8. `/science` — **real citations + DOIs outstanding** (§16 Q15)
- [x] 9. Email backend — Brevo transactional + contacts, unique per-email discount codes
- [x] 10. Pre-launch **price experiment** + Meta Pixel / Conversions API + Firestore lead DB (DECISIONS.md §17)
- [ ] 11. Performance and accessibility audit
- [x] 12. Production hardening — `/kickstarter` holding page, Vitest + CI, rate limiting, unsubscribe
- [x] 13. Oct 15, 2026 launch revamp — navy theme matching the iOS app, final copy, three price tiers

The site is **deploy-ready to Vercel right now** with no env vars set. The
build is `npm run build` clean; CI proves the zero-config build keeps
working. Before launch, set `SITE_URL`, the `BREVO_*` + `CONTACT_EMAIL_TO`
keys, and — before any ads run — `EXPERIMENT_SECRET`,
`FIREBASE_SERVICE_ACCOUNT_JSON`, `NEXT_PUBLIC_META_PIXEL_ID`,
`META_CAPI_ACCESS_TOKEN` (`docs/ADMIN.md` §4). Unset integrations log
instead of failing.

## Pricing

| Tier | |
| --- | --- |
| Retail | $149 |
| Kickstarter | $112 default — or a per-visitor integer in $75–$140 while the price experiment is on; free US shipping |
| Super Early Bird | Kickstarter × 0.85, rounded — unlocked with an email signup |

Everything derives from [`lib/admin.ts`](./lib/admin.ts) via
[`lib/pricing.ts`](./lib/pricing.ts). `tests/copy.test.ts` and
`tests/pricing.test.ts` fail the build if copy and numbers disagree.

## Campaign link

`links.crowdfundingUrl` is `null` while the Kickstarter campaign is being
built, so every "Back on Kickstarter" CTA routes to the on-site
`/kickstarter` holding page, which explains the status and captures an
email for launch notice. Paste the live URL into `lib/admin.ts` and every
CTA switches to it (opening in a new tab) — no other file changes.

Stop for review at the end of each step (per Decisions.md §15).
# gripfit-web
