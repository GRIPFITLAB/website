# GripFit Web — PRD

> Product requirements for the GripFit marketing + pre-order site.
> Companion docs: [`EDD.md`](./EDD.md) (design), [`ADMIN.md`](./ADMIN.md) (ops),
> [`STATUS.md`](./STATUS.md) (state). Architectural rationale lives in
> [`../DECISIONS.md`](../DECISIONS.md); visual identity in [`../design.md`](../design.md).
> **Retrofit note:** most of this was reverse-engineered from the codebase on
> 2026-09-07 and confirmed in the kickoff interview. Correct it before new code lands.

---

## 1. Problem

GripFit is a precision hand dynamometer that pairs with an iOS app. There is no
public web presence: prospective customers can't learn what the device is, how it
works, or what it costs, and there is no way to express purchase intent ahead of
the crowdfunding launch. v1 exists to educate visitors and funnel them to an
external crowdfunding campaign, while capturing emails (with a stacked discount
incentive) for the launch announcement.

## 2. Users

| User | Description | Jobs |
| --- | --- | --- |
| **Primary — prospective customer** | Grip/strength-training athletes, climbers, strength coaches, physical therapists, hand-therapy patients evaluating the device. | Understand what GripFit is in <60s; see price and pre-order offer; get to the campaign; leave an email for the extra discount. |
| **Secondary — existing iOS app user** | Someone who already has the app or device and needs help. | Find the setup/pairing guide; contact support. |

**What they do today:** nothing — there is no site. Interest is captured ad hoc.

## 3. Success criteria

| Signal | Target |
| --- | --- |
| Time to understand the product | < 60s (DECISIONS §1) |
| LCP / CLS / INP | < 2.5s / < 0.1 / < 200ms (DECISIONS §13) |
| Lighthouse mobile — Perf / A11y / SEO | > 90 / > 95 / 100 |
| Deploy readiness | `npm run build` green, all routes statically prerender, deploys to Vercel with zero env vars |
| Email-capture rate, CTA→campaign click-through | **Targets TBD — Open Question OQ-3** |

---

## 4. Requirements

Priority: **P0** = launch-blocking, **P1** = launch-desirable, **P2** = post-launch.
"Retrofit" = already built; listed so the design doc can trace it.

### 4.1 Pricing & configuration control panel

| ID | P | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| R-001 | P0 | A single human-editable key-variables file (`lib/admin.ts`) is the only place a non-developer edits price, discount %, free-shipping toggle, banner/modal copy, product name, and external links. `lib/config.ts` derives every rendered/computed value from it. *(Retrofit — must remain true.)* | No component contains a price, percent, or URL literal (`grep` clean). Changing one value in `admin.ts` updates banner, hero, PDP, modal, footer, nav on next reload. |
| R-002 | P0 | Set MSRP (list price) to **$149**. | `getPreorderPricing().list === 149`; renders `$149`. |
| R-003 | P0 | Campaign (Kickstarter pre-order) discount = **25% off + free US shipping**. | Campaign sale price `$111.75`; banner copy reads "25% off + free US shipping"; `discountConfig.preorder.label` → "25% OFF". |
| R-004 | P0 | Email-signup discount = **extra 15% off, stacking on the campaign price** (multiplicative). | `getStackedPreorderPricing().stacked` → `$94.99` (94.9875); `totalPercentOff` ≈ 0.3625; stacked savings `$54.01`. |
| R-005 | P1 | All human-readable discount copy (banner sentence, modal headline/body) matches the live percentages — no stale "30%"/"40.5%" strings. | Rendered banner + modal reference 25% and 15%; automated copy/number lint or test guards it. |

### 4.2 Email & contact — Brevo

Brevo is the **single provider** for all outbound email and email capture
(transactional email API + Contacts API). It already runs the iOS app's signup
and notifications, so the site reuses that account.

| ID | P | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| R-010 | P0 | Replace the parked Resend stub path with Brevo for both Server Actions. | No runtime code references Resend; `isBrevoConfigured` flag replaces `isResendConfigured`. |
| R-011 | P0 | Email-discount capture action: validate (Zod + honeypot) → upsert the email as a Brevo contact in a designated list → attach a unique per-email discount code → send the code by Brevo transactional email. | Valid submit creates/updates a Brevo contact with a `DISCOUNT_CODE` attribute and list membership; visitor receives the code email. |
| R-012 | P0 | Unique discount code: generated server-side, non-guessable, exactly one per email, stored on the Brevo contact, idempotent (re-submitting the same email resends the **existing** code, never a new one). | Two emails → two different, non-sequential codes; same email twice → identical code, one contact. Code format documented in EDD. |
| R-013 | P1 | Contact-form action sends a Brevo transactional email to the support inbox (`CONTACT_EMAIL_TO`); keeps Zod validation + honeypot and the existing success/error state shape. | Valid submit delivers an email to the configured inbox; invalid submit returns field errors unchanged. |
| R-014 | P0 | All Brevo/email config is env-driven, Zod-validated in `lib/env.ts`, **optional at boot** with a graceful logging fallback when unset (mirrors the current pattern). | `npm run build` and a Vercel deploy succeed with zero email env vars; forms then return a friendly "received, delivery pending" message and log a warning. |
| R-015 | P2 | Documented procedure to export captured emails + codes from Brevo and reconcile them against crowdfunding backers. | A written runbook in ADMIN.md; depends on OQ-2. |

### 4.3 Content & assets

| ID | P | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| R-020 | P1 | Every page ships final production copy. Today `/science` and `/setup` are placeholder copy; home sections, `/product`, `/privacy`, `/terms` need a copy pass. | No "TBD" / "placeholder" / "Lorem" / "subject to change" strings in rendered output. |
| R-021 | P1 | Replace abstract placeholders with real product renders (hero `public/product/hero.*`, PDP gallery) and real iOS app screenshots (`AppShowcase`, `public/app/`). *(Blocked on design team; not launch-blocking per stakeholder.)* | `next/image` references real files; no CSS phone mockups or "photography TBD" tiles remain. |
| R-022 | P2 | Final logo/wordmark and confirmed tagline replace the inline SVG in `components/layout/Logo.tsx` and `siteIdentity.tagline`. | Design-approved mark in place; `<title>` and hero use the final tagline. |

### 4.4 Testing & release readiness

| ID | P | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| R-030 | P0 | Vitest unit suite covering: pricing math (25%→15% stack + `formatUSD`), `admin.ts`↔`config.ts` invariants, contact action (Zod + honeypot), email-discount action (validation, code uniqueness, idempotent resend, Brevo calls mocked), route map ↔ `app/` directory parity, sitemap/robots output. | `npm test` runs `vitest run` and passes; each area above has ≥1 test. |
| R-031 | P0 | `.github/workflows/ci.yml` runs **lint → typecheck → test → build** on every PR and push to `main`. | A failing lint/type/test/build fails the check; green on `main`. |
| R-032 | P1 | Production build stays green with all routes statically prerendering; CI enforces it. | `npm run build` exits 0; route count matches expected; CI gate active. |
| R-033 | P2 | Documented manual smoke test for Brevo (real submit in a preview deploy → confirm code email + contact), since Brevo is mocked in unit tests. | Runbook in ADMIN.md. |

### 4.5 Retrofit baseline (already built)

| ID | P | Requirement | Notes |
| --- | --- | --- | --- |
| R-040 | P0 | Pages: home (Hero → Comparison → AppShowcase → Features), `/product` PDP, `/science`, `/setup`, `/contact`, `/privacy`, `/terms`, branded 404. | DECISIONS §6. |
| R-041 | P0 | Every pre-order CTA routes to `externalLinks.crowdfundingUrl` with a safe fallback (`/contact`) while the URL is TBD. No on-site cart or checkout in v1. | DECISIONS §5, §7. |
| R-042 | P1 | Discount UI: site-wide banner + first-visit email modal + always-visible footer form + CTA-adjacent teaser, all sharing one Server Action and one `EMAIL_DISCOUNT_DISMISSED_KEY` localStorage flag; teaser opens the modal via a custom event. | DECISIONS §9, AGENTS §4. |
| R-043 | P1 | SEO: Metadata API, auto sitemap, robots (allow prod / disallow preview), Product + Organization structured data, per-page OG images. | Structured data + OG images still pending (DECISIONS §15 step 10). |
| R-044 | P0 | Light-only warm-cream design system; tokens owned by `design.md` + `app/globals.css`; no new colors/fonts/radii in components. | DECISIONS §3, AGENTS §2–§7. |
| R-045 | P1 | Meet the performance/a11y targets in §3. | DECISIONS §13; audit is step 11. |
| R-046 | P0 | RSC by default; `"use client"` only where interactivity/browser APIs/hooks are needed; dismissal state in localStorage only; no global state library. | DECISIONS §8. |

---

## 5. Key flows

1. **Learn → back the campaign.** Land on `/` → hero states what GripFit is + stacked price → "Back the campaign" → `externalLinks.crowdfundingUrl` (falls back to `/contact` until set).
2. **Claim the extra discount.** First visit auto-opens `EmailDiscountModal` (or via footer form / any teaser) → submit email → Brevo upserts contact + generates code + sends code email → confirmation copy shown → dismissal remembered in localStorage.
3. **Get support.** Nav/footer → `/setup` for pairing, or `/contact` → Server Action → Brevo transactional email to support inbox.

## 6. Out of scope for v1

On-site cart/checkout; Shopify commerce (client parked in `lib/shopify/` for v2);
customer accounts; any email capture beyond the discount modal; automated code
**redemption/enforcement**; `/about`, `/faq`, `/shipping`, blog, gift cards;
dark mode; CMS/MDX; GA4; rate limiting (add Upstash only if spam appears);
a local database.

## 7. Open questions

| ID | Question | Blocks |
| --- | --- | --- |
| OQ-1 | Crowdfunding platform + live campaign URL (DECISIONS §16 Q10). | R-041 final wiring; launch. |
| OQ-2 | How is a per-email code actually redeemed/enforced on the campaign? Kickstarter has no native promo-code mechanism. | R-012 intent, R-015. |
| OQ-3 | Numeric success targets — email-capture rate, CTA→campaign click-through. | §3 measurement. |
| OQ-4 | Support inbox address + verified Brevo sender domain/identity are not set up yet. | R-013, R-011 deliverability before launch. |
| OQ-5 | Brevo list ID for website signups — new list, or shared with the iOS app list? | R-011. |
| OQ-6 | App Store URL for "Get the app" CTAs (DECISIONS §16 Q8). | Minor CTA; currently hidden. |
| OQ-7 | Timing for final copy, product renders, app screenshots, logo, tagline (DECISIONS §16 Q5, Q6, Q9, Q11). | R-020, R-021, R-022. |
| OQ-8 | Cookie-consent banner — DECISIONS §12 says "add"; is it launch-scope? | Compliance. |
| OQ-9 | Any backup store for captured email+code beyond Brevo? | Data durability. |
