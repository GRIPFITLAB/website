# Changelog

All notable changes to GripFit Web. Requirement IDs refer to
[`docs/PRD.md`](./docs/PRD.md); decision IDs to [`docs/EDD.md`](./docs/EDD.md).

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Brevo integration as the single provider for all outbound email and email
  capture: typed `fetch` client in `lib/brevo/` (`getContact`,
  `upsertContact`, `sendTransactionalEmail`) with `BrevoHttpError` /
  `BrevoNetworkError` and a 10s request timeout. [R-010]
- Unique per-email discount codes (`GF-XXXXXXXX`, 40 bits of Crockford
  base32 from `crypto.getRandomValues`), stored as a `DISCOUNT_CODE`
  attribute on the Brevo contact. One code per address — re-submitting
  re-sends the existing code rather than minting a second. [R-011] [R-012]
- Brevo-backed email delivery for the discount-code and contact-form flows,
  including a branded inline HTML fallback when no Brevo template is
  configured. [R-011] [R-013]
- `/kickstarter` holding page — campaign-in-preparation blurb, email capture
  as the primary action, and a pricing recap. Every "Back the campaign" CTA
  routes here while the campaign URL is unset. [R-041]
- `campaign` helper in `lib/config.ts` — one switch that flips every CTA
  between the on-site holding page and the live Kickstarter URL, adding
  `target="_blank"` + `rel="noopener noreferrer"` only for external
  targets. [R-041]
- `tests/server-actions.test.ts` — asserts every `"use server"` module exports
  only async functions. Source-level on purpose: `next build` compiles the
  broken form cleanly and prerenders all 13 routes, so a green build is not
  evidence against this defect. [R-030]
- `tests/env.test.ts` — 14 tests covering `SITE_URL` normalisation and the
  blank-value filter, including a regression for a scheme-only value
  (`http://`) being rewritten into the superficially-valid `https://http:`.
  [R-014] [R-030]
- Vitest unit suite: 62 tests across pricing maths, `admin.ts` → `config.ts`
  invariants, copy/number agreement, discount-code generation, both Server
  Actions (Brevo mocked), and route-map ⇔ `app/` parity. [R-030]
- GitHub Actions CI running lint → typecheck → test → build on every PR and
  push to `main`, deliberately with no secrets so the zero-config build stays
  verified. [R-031] [R-032]
- Brevo environment variables, Zod-validated and optional at boot, with
  `isBrevoConfigured` / `isContactEmailConfigured` feature flags and a
  graceful logging fallback. [R-014]
- Kickoff documentation: `docs/PRD.md`, `docs/EDD.md`, `docs/ADMIN.md`,
  `docs/STATUS.md`, and this changelog.

### Changed

- Pricing: MSRP $135 → **$149**, campaign discount 30% → **25%**, email
  signup discount unchanged at **15% stacked** on the campaign price.
  Stacked pre-order price is now **$94.99** (36.25% off MSRP).
  [R-002] [R-003] [R-004]
- Banner and modal copy updated to quote the new percentages, now guarded by
  `tests/copy.test.ts` so a number can't drift from the sentence describing
  it. [R-005]
- `links.crowdfundingUrl` is `null` rather than `/contact` while the campaign
  is dark — CTAs no longer send pre-order intent to a general contact form.
  [R-041]
- `@types/node` bumped `^20` → `^22` to match Node 22 in `.nvmrc`; the stale
  pin blocked the vitest install. [R-030]
- `NEXT_PUBLIC_SITE_URL` → **`SITE_URL`**. The origin is only ever read on the
  server (`app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx` metadata), so the
  `NEXT_PUBLIC_` prefix was shipping it to the client bundle for no reason.
  **Action required:** rename this key in the Vercel dashboard. [R-043]

### Fixed

- `robots.txt` allowed indexing in every environment, so Vercel preview
  deployments were crawlable and competing with production. Non-production
  environments now disallow all. [R-043]
- `localStorage` / `sessionStorage` access was unguarded and throws in
  browsers that block site data — an unhandled throw inside an effect broke
  the page immediately after a successful signup. All access now goes through
  fail-silent helpers. [R-042]
- `DiscountBanner` called `setState` synchronously inside an effect, failing
  `npm run lint` (now blocking via CI). Rewritten with `useSyncExternalStore`,
  which also removes the hydration mount-gate. [R-042]
- `ContactForm` styled its success message with `text-success`, a class no
  design token defines, so the message rendered unstyled. Now
  `text-state-success`. [R-044]
- `/science` citations linked to `href="#"` — dead links announced as
  interactive to screen readers. They render as plain rows until the final
  DOIs land. [R-020]
- `.env.example` was never committed — `.gitignore` matched `.env*` with no
  exception, so the `cp .env.example .env.local` step in README.md and
  `docs/ADMIN.md` §1 failed on a fresh clone. The template is now negated
  back in; every file that can hold a real value stays ignored. [R-014]
- `.env.example` contents refreshed for Brevo: the removed `RESEND_*` and
  `CONTACT_EMAIL_FROM` keys are gone, all `BREVO_*` keys are present, and
  each is annotated with where to find its value and whether it blocks
  launch. [R-014]
- A variable that was **present but blank** crashed the build. `KEY=` (a copied
  template line, or an empty field in the Vercel dashboard) arrives as `""`,
  which is *present*, so `.optional()` did not apply and `.min(1)` / `.url()`
  rejected it. `lib/env.ts` now drops empty values before validating, restoring
  the R-014 guarantee that an unset variable disables its feature instead of
  breaking boot. CI never caught this because CI defines no variables at all.
  [R-014]
- **Every page containing a form 500'd in production.** `contact-action.ts` and
  `email-discount-action.ts` are `"use server"` modules but each exported a Zod
  schema and an initial-state object alongside its Action. Next.js permits only
  async function exports there and throws on module evaluation — `A "use server"
  file can only export async functions, found object` — so `/kickstarter`,
  `/contact`, and the footer form were unreachable. The schemas and state now
  live in `contact-schema.ts` / `email-discount-schema.ts`. Present since the
  Brevo migration; never caught because the build passes and no test rendered a
  page. [R-011] [R-013]
- `SITE_URL` set to a bare hostname (`gripfit.com`) failed the production build:
  `z.url()` requires a scheme, and the whole deploy died on `Invalid URL`. The
  value is now normalised before validation — a missing scheme becomes `https://`,
  whitespace and trailing slashes are dropped, and the result is canonicalised to
  its origin. Validation itself was *tightened* at the same time: only `http`/`https`
  are accepted, where plain `z.url()` also allowed `ftp://`. A value that is still
  unparseable remains a hard build error — an empty `sitemap.xml` is invisible in
  production, a failed deploy is not. [R-043]

### Removed

- `components/marketing/InTheBox.tsx` and `components/marketing/Readiness.tsx`
  — orphaned since the Jun 28 2026 home-page revamp, with no importers.
- Resend configuration (`RESEND_API_KEY`, `CONTACT_EMAIL_FROM`,
  `isResendConfigured`), superseded by Brevo. [R-010]
- `.env.example` and its `!.env.example` exception in `.gitignore`. It was a
  third copy of a list already maintained in `docs/ADMIN.md` §4 and `lib/env.ts`,
  and copying it was what produced the blank-variable crash above. `.gitignore`
  now matches `.env*` with no exception. [R-014]
