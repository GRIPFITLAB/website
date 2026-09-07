# GripFit Web — Admin / Ops

> Real commands, environments, and conventions. Product scope is in
> [`PRD.md`](./PRD.md); build design in [`EDD.md`](./EDD.md).

---

## 1. Local development

```bash
nvm use                         # Node 22 LTS (.nvmrc)
npm install
cp .env.example .env.local      # optional — app boots with no vars set
npm run dev                     # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build — all routes must statically prerender |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint (Next core-web-vitals + TS) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | `vitest run` — unit suite (62 tests) |
| `npm run test:watch` | `vitest` watch mode |

## 2. Editing prices, discounts, copy, links

**Edit [`lib/admin.ts`](../lib/admin.ts) only.** It is the control panel; every
banner, hero, PDP, modal, footer, and nav re-renders from it. `lib/config.ts`
derives typed values + pricing math — you rarely touch it. No component holds a
price, percent, or URL literal.

| To change… | Edit in `lib/admin.ts` | Also update (copy must match the number) |
| --- | --- | --- |
| MSRP / list price | `productSettings.listPriceUSD` | — (all sale prices recompute) |
| Campaign discount % | `campaignDiscount.percentOff` | `campaignDiscount.bannerCopy` |
| Free-shipping promise | `campaignDiscount.freeShipping` | `campaignDiscount.bannerCopy` |
| Email-signup extra % | `emailDiscount.percentOff` | `emailDiscount.headline`, `emailDiscount.body` |
| Crowdfunding URL | `links.crowdfundingUrl` | — |
| App Store URL | `links.iosAppStore` (`null` hides the CTA) | — |
| Support email | `links.supportEmail` | — |
| Product / brand name, tagline | `productSettings.name`, `siteIdentity.*` | — |

**Live pricing:** MSRP `$149`, campaign `25%` off + free shipping
(`$111.75`), email signup extra `15%` stacking (`$94.99`, 36.25% off MSRP).
`tests/copy.test.ts` fails if you change a percentage without updating the
sentence that quotes it.

**Campaign link:** `links.crowdfundingUrl` is `null`, so every "Back the
campaign" CTA routes to the on-site `/kickstarter` holding page. Paste the
live Kickstarter URL there on launch day — every CTA switches to it,
opening in a new tab. No other file changes.

## 3. Environments

| Env | Where | Trigger | Notes |
| --- | --- | --- | --- |
| Local | your machine | `npm run dev` | `.env.local`; all integration vars optional |
| Preview | Vercel | every PR / push to a non-`main` branch | `robots.txt` disallows all; use for the Brevo smoke test |
| Production | Vercel | push / merge to `main` | `robots.txt` allows all; needs the "before launch" vars below |

## 4. Environment variables

Schema + validation: [`lib/env.ts`](../lib/env.ts) (Zod). Template: `.env.example`.
All are optional at boot; features degrade to a logging fallback when unset.

| Var | Scope | Needed | Purpose |
| --- | --- | --- | --- |
| `BREVO_API_KEY` | server | before launch | Brevo v3 API auth |
| `BREVO_WEBSITE_LIST_ID` | server | before launch | list for captured email-discount signups (confirm list ID — PRD OQ-5) |
| `BREVO_SENDER_EMAIL` | server | before launch | verified Brevo sender address (PRD OQ-4) |
| `BREVO_SENDER_NAME` | server | optional | outbound display name |
| `BREVO_DISCOUNT_TEMPLATE_ID` | server | optional | Brevo template for the code email; inline HTML used if unset |
| `CONTACT_EMAIL_TO` | server | before launch | support inbox for contact-form mail (PRD OQ-4) |
| `NEXT_PUBLIC_SITE_URL` | public | before launch | absolute URLs for `sitemap.xml`, `robots.txt`, OG tags |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | public | v2 only | parked Shopify client |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN` | public | v2 only | parked Shopify client |
| `SHOPIFY_STOREFRONT_API_VERSION` | server | v2 only | defaults to `2025-04` |

Set production values in **Vercel → Project → Settings → Environment Variables**.
Never commit `.env.local`. The Shopify Admin token must never appear anywhere in
this repo (DECISIONS §12).

## 5. Deploy

- Vercel auto-deploys: preview per PR, production on `main`.
- The site is deploy-ready with **zero** env vars — forms accept input and log
  instead of sending.
- Before attaching the production domain: set `NEXT_PUBLIC_SITE_URL`, then the
  Brevo + contact vars, then run the smoke test in §7.

## 6. CI

`.github/workflows/ci.yml` runs on every PR and push to `main`:
**lint → typecheck → test → build**. A red check blocks merge.

It runs with **no secrets on purpose** — the build must keep succeeding
with zero env vars, which is what makes preview deploys work before Brevo
is configured (PRD R-014).

## 7. Brevo account setup (one-time, manual)

Do these in the Brevo dashboard before setting the env vars.

1. **Create the custom contact attributes.** Contacts → Settings →
   Contact attributes. Brevo rejects writes to attributes it doesn't
   know, so the signup action fails without all four:

   | Attribute | Type |
   | --- | --- |
   | `DISCOUNT_CODE` | Text |
   | `DISCOUNT_PCT` | Number |
   | `SIGNUP_SOURCE` | Text |
   | `SIGNUP_TS` | Text |

2. **Create the list** website signups join (keep it separate from the
   iOS app list if you want to mail them differently). Note the numeric
   id from the list URL → `BREVO_WEBSITE_LIST_ID`.
3. **Verify a sender.** Senders, Domains & Dedicated IPs. Domain
   authentication (SPF/DKIM) is strongly preferred over a single
   verified address — unauthenticated mail lands in spam.
   → `BREVO_SENDER_EMAIL`
4. **Generate a v3 API key.** SMTP & API → API keys. → `BREVO_API_KEY`
5. *(Optional)* Build a transactional template for the code email and
   note its id → `BREVO_DISCOUNT_TEMPLATE_ID`. It receives
   `{{ params.DISCOUNT_CODE }}`. Leave unset to use the built-in inline
   HTML, which already renders in the brand palette.

## 8. Brevo smoke test (pre-launch, manual — R-033)

1. Deploy a preview with real `BREVO_*` + `CONTACT_EMAIL_TO` set.
2. Submit the email-discount modal with a real inbox you control.
3. Confirm: (a) code email arrives, (b) Brevo shows a new contact in
   `BREVO_WEBSITE_LIST_ID` with a `DISCOUNT_CODE` attribute.
4. Re-submit the same email → same code re-sent, no second contact, no new code.
5. Submit `/contact` → confirm mail lands in `CONTACT_EMAIL_TO` and that
   hitting reply addresses the submitter, not the sender address.

## 9. Reconciling codes with backers (R-015 — pending OQ-2)

Export the `BREVO_WEBSITE_LIST_ID` contacts (email + `DISCOUNT_CODE`) from Brevo
as CSV and cross-check against the campaign's backer export. Enforcement mechanism
on the campaign side is unresolved — see PRD OQ-2.

## 10. Conventions

- **Read [`../DECISIONS.md`](../DECISIONS.md) before any non-trivial change.**
  §16 holds open questions — don't build on an unanswered one without flagging it.
- Commits: conventional commits + requirement IDs, e.g.
  `feat(pricing): set MSRP to $149 (R-002)`.
- Server Actions live **next to** the component that calls them
  (`components/**/*-action.ts`), never in `lib/actions/`.
- No `app/api/` unless a non-React client needs the endpoint.
- Visual tokens: extend [`../design.md`](../design.md) first, then mirror into
  `app/globals.css`. No new colors/fonts/radii in component files.
- Server Components by default; add `"use client"` only for real interactivity.
- Long-copy pages (`/setup`, `/privacy`, `/terms`) are TSX, not MDX.
- Skills to consult: `nextjs`, `shadcn`, `vercel-functions`.
