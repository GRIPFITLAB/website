# GripFit Web

Customer-facing marketing site for GripFit — a precision hand
dynamometer that pairs with iOS. Built on Next.js 16 + Vercel. v1
drives pre-orders to an external crowdfunding campaign; the headless
Shopify client in `lib/shopify/` is parked for v2 (Decisions.md §16
Q3).

## Source of truth

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
- Shopify Storefront API (typed `fetch` wrapper — parked for v2)
- Resend for the contact form + email-discount modal (Step 9)
- Vercel hosting + Vercel Analytics

## Local development

```bash
nvm use            # Node 22 LTS, see .nvmrc
cp .env.example .env.local   # fill in Shopify + Resend keys
npm install
npm run dev        # http://localhost:3000
```

Useful scripts:

| Command            | What it does                          |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Next.js dev server (Turbopack)         |
| `npm run build`    | Production build                       |
| `npm run start`    | Run production build locally           |
| `npm run lint`     | ESLint (Next.js core-web-vitals + TS)  |
| `npm run typecheck`| `tsc --noEmit`                         |

## Repository layout

The `Decisions.md` §14 / §16 Q2 layout is the canonical structure. Today
only `app/`, `components/`, `lib/`, and `public/` exist; the rest will be
added as the corresponding build steps land.

## What's NOT in this repo

- The iOS app — separate codebase. Reference imagery in `iOS_App_Images/`.
- Customer accounts — none in v1 (Decisions.md §8).
- A CMS — marketing copy lives in TSX (Decisions.md §10).
- An on-site cart — v1 routes pre-orders to the external crowdfunding
  campaign via `externalLinks.crowdfundingUrl`. The Shopify client in
  `lib/shopify/` is parked for v2 (Decisions.md §7, §16 Q3).

## Build status (per Decisions.md §15)

- [x] 1. Project scaffold (Next.js + TS + Tailwind v4 + App Router)
- [x] 2. shadcn/ui init + design-token wiring
- [x] 3. Shopify Storefront API client (`lib/shopify/`)
- [x] 4. Site shell — Nav, Footer, MobileMenu, branded 404, sitemap, robots
- [x] 5. Home page — Hero, Features, Readiness, AppShowcase, Comparison, InTheBox + DiscountBanner / EmailDiscountModal (no athlete-grid social proof per §6)
- [x] **Pre-deploy stubs** for `/product`, `/science`, `/setup`, `/contact`,
  `/privacy`, `/terms` so every nav link resolves on Vercel. The PDP
  reads `productConfig` + `discountConfig` only and routes its CTA to
  `externalLinks.crowdfundingUrl`. The contact form's Server Action and
  the email-discount Server Action both accept + log submissions until
  Resend lands in Step 9.
- [ ] 6. ~PDP with live add-to-cart (Shopify required)~ — **deferred to v2** (Decisions.md §16 Q3). v1 PDP is crowdfunding-driven.
- [ ] 7. ~Cart drawer + Context + cookie persistence~ — **deferred to v2**.
- [ ] 8. Marketing-page polish (`/science`, `/setup`)
- [ ] 9. Contact form backend (replace stub with Resend send) + email-discount delivery
- [ ] 10. SEO polish — structured data, OG images
- [ ] 11. Performance and accessibility audit

The site is **deploy-ready to Vercel right now** with no env vars set. The
build is `npm run build` clean; all 12 routes statically prerender. Once a
custom domain is attached, set `NEXT_PUBLIC_SITE_URL` so `sitemap.xml` and
`robots.txt` can resolve absolute URLs.

Stop for review at the end of each step (per Decisions.md §15).
# gripfit-web
