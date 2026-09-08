# GripFit Web — Engineering Design Doc

> How the requirements in [`PRD.md`](./PRD.md) are built. Rationale of record for
> stack/architecture is [`../DECISIONS.md`](../DECISIONS.md); this doc covers the
> pricing-config, Brevo, and testing work plus a full traceability table.

---

## 1. Architecture

```
Browser
  │  (static HTML/RSC payload — all routes prerendered)
  ▼
Next.js 16 App Router on Vercel
  ├─ Server Components render marketing pages from lib/config.ts
  ├─ Server Action: submitContact       ──┐
  ├─ Server Action: submitEmailDiscount ──┤─▶ lib/brevo/  (typed fetch wrapper)
  │                                        │      ├─ upsertContact()      → Brevo Contacts API
  │                                        │      └─ sendTransactionalEmail() → Brevo SMTP API
  └─ localStorage: EMAIL_DISCOUNT_DISMISSED_KEY (client only)

Config layering:
  lib/admin.ts   plain editable values (price, % off, copy, links)
     ▼
  lib/config.ts  typed exports + pricing helpers (siteConfig, productConfig,
                 discountConfig, externalLinks, getPreorderPricing,
                 getStackedPreorderPricing, formatUSD)
     ▼
  components/    consume typed config only — never literals

  lib/env.ts     Zod-validated process.env + feature flags
                 (isBrevoConfigured, isShopifyConfigured)
```

- **No database.** Brevo Contacts is the system of record for captured emails and
  their codes. `lib/shopify/` stays on disk, unused, for a v2 commerce relight.
- **Two server mutations only** — the two Server Actions. No `app/api/` routes.
- **Deploy-without-config invariant:** every integration env var is optional; the
  actions branch on a feature flag and fall back to logging.

## 2. Stack

| Layer | Choice | Version (installed) |
| --- | --- | --- |
| Framework | Next.js (App Router) | `16.2.4` |
| UI runtime | React / React DOM | `19.2.4` |
| Language | TypeScript, strict + `noUncheckedIndexedAccess` | `^5` |
| Node types | `@types/node` — bumped from `^20` to match `.nvmrc` | `^22.20.1` |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` | `^4` |
| UI primitives | shadcn/ui (`base-nova`) on `@base-ui/react` | `@base-ui/react ^1.4.1`, `shadcn ^4.5.0` |
| Icons | lucide-react | `^1.11.0` |
| Variants / class utils | class-variance-authority / clsx / tailwind-merge | `^0.7.1` / `^2.1.1` / `^3.5.0` |
| Validation | zod | `^4.3.6` |
| Fonts | self-hosted Inter Tight + Inter (`@font-face` in `globals.css`) | `@fontsource-variable/inter-tight ^5.2.7` |
| Email / contacts | **Brevo** — plain typed `fetch` to `api.brevo.com/v3` (no SDK) | n/a (`lib/brevo/`) |
| Server-only guard | `server-only` (build-time error if a server module is pulled client-side) | `^0.0.1` |
| Unit tests | **Vitest** (`environment: "node"`; no DOM tests, so no `@vitejs/plugin-react`) | `^5.0.0` |
| CI | **GitHub Actions** | `.github/workflows/ci.yml` |
| Hosting | Vercel + Vercel Analytics | — |
| Node | 22 LTS (`.nvmrc`) | `22` |
| Parked (v2) | `lib/shopify/` Storefront client | on disk, no importers |

## 3. Data model

No persistent local store. State lives in Brevo and in the browser.

### 3.1 Brevo contact (per email-discount signup)

| Field | Value |
| --- | --- |
| `email` | contact key |
| attribute `DISCOUNT_CODE` | our generated code, e.g. `GF-7Q4KX2M9` |
| attribute `DISCOUNT_PCT` | `15` |
| attribute `SIGNUP_SOURCE` | `"website"` |
| attribute `SIGNUP_TS` | ISO timestamp |
| list membership | `BREVO_WEBSITE_LIST_ID` |

### 3.2 Discount code

- Format: `GF-` + 8 chars of Crockford base32 (no `I O L U`), from
  `crypto.getRandomValues` (~40 bits entropy).
- **One per email.** Generation path: look up the contact by email first; if it
  already has `DISCOUNT_CODE`, reuse it and just re-send. Otherwise generate,
  write it as a contact attribute, then send.
- Collision handling: entropy is sufficient for expected pre-launch volume; no
  global uniqueness check. Race on simultaneous first submits of the same email
  is accepted (low volume, last write wins on the attribute).

### 3.3 Client state

`EMAIL_DISCOUNT_DISMISSED_KEY` in `localStorage` — modal-dismissed flag. No cookies
in v1 (pending OQ-8 cookie consent).

## 4. Interfaces

### 4.1 Server Actions (signatures unchanged — internals swapped)

```ts
submitContact(prev: ContactFormState, form: FormData): Promise<ContactFormState>
submitEmailDiscount(prev: EmailDiscountState, form: FormData): Promise<EmailDiscountState>
```

### 4.2 `lib/brevo/index.ts` (new)

```ts
upsertContact(input: {
  email: string;
  attributes?: Record<string, string | number>;
  listIds?: number[];
  updateEnabled?: boolean;       // true — idempotent upsert
}): Promise<{ id: number } | { existing: true }>

getContact(email: string): Promise<BrevoContact | null>

sendTransactionalEmail(input: {
  to: { email: string; name?: string }[];
  subject?: string;              // when not using a template
  htmlContent?: string;
  templateId?: number;           // BREVO_DISCOUNT_TEMPLATE_ID if set
  params?: Record<string, unknown>;
}): Promise<{ messageId: string }>
```

Errors: `BrevoHttpError` (status + Brevo error body). All calls `cache: "no-store"`,
`Authorization: api-key` header from `BREVO_API_KEY`.

### 4.3 Environment (`lib/env.ts` additions)

| Var | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `BREVO_API_KEY` | server | before launch | Brevo v3 API auth |
| `BREVO_WEBSITE_LIST_ID` | server | before launch | list captured signups land in (OQ-5) |
| `BREVO_SENDER_EMAIL` | server | before launch | verified Brevo sender (OQ-4) |
| `BREVO_SENDER_NAME` | server | optional | display name on outbound mail |
| `BREVO_DISCOUNT_TEMPLATE_ID` | server | optional | Brevo template for the code email; inline HTML fallback if unset |
| `CONTACT_EMAIL_TO` | server | before launch | support inbox for contact-form mail (OQ-4) |
| `SITE_URL` | server | before launch | absolute URLs for sitemap/robots/OG |

`isBrevoConfigured = Boolean(BREVO_API_KEY && BREVO_SENDER_EMAIL)`. When false,
both actions log a warning and return their existing "received, delivery pending"
success state. Existing `SHOPIFY_*` / `RESEND_*` vars: Shopify stays (parked),
Resend vars are removed.

## 5. Design decisions

Each `D-xxx` records the choice and the alternative rejected.

| ID | Decision | Rejected alternative |
| --- | --- | --- |
| D-001 | Keep the `lib/admin.ts` → `lib/config.ts` split as the pricing/copy control panel; values are typed TS constants. | A runtime JSON/YAML file — loses type safety and the compile-time "no literal in a component" guarantee. Env vars for prices — wrong lifecycle; prices are reviewed copy, not secrets. |
| D-002 | Brevo as the sole email + contact provider. | Resend (already stubbed) — stakeholder already runs Brevo for the iOS app; one vendor = one key, one sender domain, one contact list to reconcile against backers. |
| D-003 | Hand-rolled typed `fetch` wrapper in `lib/brevo/`. | `@getbrevo/brevo` SDK — heavy, weak types; the repo already chose this pattern for `lib/shopify/`. |
| D-004 | Brevo Contacts is the datastore for captured email + code; no DB. | Postgres / Vercel KV / Upstash — over-infra for a pre-launch single-product site; adds a paid dep and a second source of truth; reconciliation target is Brevo anyway. |
| D-005 | Unique per-email code, generated server-side, stored on the contact, idempotent per email. | One shared static code — stakeholder explicitly wants to deter mass sharing; a per-email code lets a leaked code be traced to the address that received it. |
| D-006 | Codes are informational in v1 (emailed, stored, exportable). Redemption/enforcement is deferred to the campaign platform. | Building redemption now — no platform selected; Kickstarter has no native promo mechanism (OQ-2). |
| D-007 | Vitest for units + GitHub Actions CI (lint → typecheck → test → build). | Jest — slower, more ESM/TS/Next-16 config. Playwright-only — doesn't cheaply cover pricing math. |
| D-008 | Email env vars stay optional at boot with a graceful fallback. | Required env vars — breaks "deploy to Vercel with zero config" and preview deploys. |
| D-009 | Keep the two Server Action signatures; swap only internals. | New `app/api/` routes for Brevo — actions are already validated server-side and no non-React caller needs them (DECISIONS §14). |
| D-010 | Leave `lib/shopify/` untouched on disk. | Delete it — v2 relight would rewrite it; zero bundle cost with no importers. |
| D-011 | Playwright smoke tests deferred; replaced by a manual Brevo smoke runbook + `next build` as the integration gate. | Full Playwright suite now — maintenance cost not justified pre-launch; build already proves every route prerenders. |
| D-012 | `links.crowdfundingUrl = null` routes every CTA to an on-site `/kickstarter` holding page; a single `campaign` helper in `lib/config.ts` flips all CTAs to the live URL when it's set. | Keeping the `/contact` fallback — a "Back the campaign" click is pre-order intent, and dumping it into a general contact form loses the signal and reads as broken. Also rejected: `href="#"` (dead link, announced as interactive) and hiding the CTAs until launch (loses the email capture the holding page exists to collect). |
| D-013 | Dismissal state read via `useSyncExternalStore`, with all storage access behind fail-silent helpers. | `useState` + `useEffect` mount-gate (the prior code) — trips `react-hooks/set-state-in-effect`, and its unguarded `setItem` throws where browsers block site data, breaking the page right after a successful signup. localStorage *is* external state; modelling it as such removes both faults. |
| D-014 | Copy/number agreement enforced by a test (`tests/copy.test.ts`) rather than by comment discipline. | Trusting the "update both" comment in `lib/admin.ts` — percentages live twice (a number for maths, a sentence for humans) and the failure mode is silent and public: a "30% off" banner on a 25%-off product. |
| D-015 | Retain `lib/shopify/` despite the no-dead-code sweep. | Deleting it with the other orphans — Decisions §7 keeps it for the v2 commerce relight, and unlike `InTheBox`/`Readiness` it has a documented forward purpose. It has no importers, so it costs nothing in the bundle. |
| D-016 | `SITE_URL` is server-only (no `NEXT_PUBLIC_` prefix), normalised by `normalizeSiteUrl` before validation, and restricted to `http`/`https`. | Keeping `NEXT_PUBLIC_SITE_URL` — every consumer (`sitemap.ts`, `robots.ts`, `layout.tsx` metadata) renders on the server, so the prefix only widened the client bundle. On the value itself: rejecting a bare hostname outright (the first attempt — it failed a production deploy on `gripfit.com`), and, at the other extreme, falling back to `null` on an invalid value — an empty `sitemap.xml` and a missing `metadataBase` are silent for weeks, whereas a failed deploy is noticed immediately. Normalise the recoverable typo; still fail loudly on the rest. |
| D-017 | No committed env template; `docs/ADMIN.md` §4 + `lib/env.ts` are the only variable lists, and empty values are dropped before validation. | Keeping `.env.example` — a third copy of the same list that drifts (it already went stale on the `RESEND_*` → `BREVO_*` swap), and copying it produced `KEY=` lines that crashed the build. Also rejected: making the schema accept `""` per-field — `z.preprocess` on every optional key is noisier than one filter and easy to forget on the next key added. |

## 6. Traceability

| Requirement | Design coverage |
| --- | --- |
| R-001 | §1 config layering, D-001 |
| R-002 / R-003 / R-004 | §1 (`getPreorderPricing`, `getStackedPreorderPricing`), values in `lib/admin.ts`; R-030 pricing test |
| R-005 | `lib/admin.ts` copy strings (`campaignDiscount.bannerCopy`, `emailDiscount.body`); `tests/copy.test.ts`, D-014 |
| R-010 | §2 stack, §4.2, D-002, D-003 |
| R-011 | §3.1, §4.1, §4.2 (`upsertContact` + `sendTransactionalEmail`), D-004 |
| R-012 | §3.2 code format + idempotent generation, D-005 |
| R-013 | §4.1 `submitContact`, §4.2 `sendTransactionalEmail`, §4.3 `CONTACT_EMAIL_TO` |
| R-014 | §1 deploy-without-config invariant, §4.3 `isBrevoConfigured`, D-008, D-017 (blank = unset) |
| R-015 | §3.1 (exportable attributes); runbook in ADMIN.md §9 (anatomy, storage, export, redemption options) + §10 (consent/privacy obligations); D-006 |
| R-020 | Content pass in page TSX; not an architecture change |
| R-021 | `next/image` + `public/product/`, `public/app/`; DECISIONS §3 imagery rules |
| R-022 | `components/layout/Logo.tsx`, `siteIdentity.tagline` |
| R-030 | §7 verification plan |
| R-031 | §7 CI workflow, D-007 |
| R-032 | §7, `next build` |
| R-033 | §7 manual smoke, D-011 |
| R-040 | DECISIONS §6 / `lib/routes.ts` / `app/**/page.tsx` |
| R-041 | §1, `lib/config.ts → campaign`, `app/kickstarter/page.tsx`, D-012 |
| R-042 | `EmailDiscount*` components + `lib/email-discount-events.ts` storage helpers, `DiscountBanner`, D-013 |
| R-043 | `app/sitemap.ts`, `app/robots.ts` (non-production disallows all), Metadata API, `SITE_URL` / D-016; structured data TODO |
| R-044 | `app/globals.css` + `design.md`; DECISIONS §3 |
| R-045 | §7 (Lighthouse / build); DECISIONS §13 |
| R-046 | RSC-default; `"use client"` only in interactive components; DECISIONS §8 |

## 7. Verification plan

| Area | Method | Gates |
| --- | --- | --- |
| Pricing math (R-002–R-005) | `tests/pricing.test.ts` — asserts `list=149`, campaign `111.75`, stacked `94.99`, `totalPercentOff≈0.3625`, `formatUSD` formatting | `npm test`, CI |
| Config invariants (R-001) | `tests/config.test.ts` — every `discountConfig`/`productConfig` value traces to `admin.ts`; label getters recompute | `npm test`, CI |
| Contact action (R-013) | `tests/contact-action.test.ts` — Zod rejects bad input, honeypot rejects, Brevo send mocked and asserted | `npm test`, CI |
| Email-discount action (R-011, R-012) | `tests/email-discount-action.test.ts` — validation; new email → `upsertContact` + `sendTransactionalEmail` called; existing contact → same code re-sent, no new code; Brevo mocked | `npm test`, CI |
| Route integrity (R-040) | `tests/routes.test.ts` — `lib/routes.ts` keys ⇔ `app/<route>/page.tsx` exist; sitemap/robots output shape | `npm test`, CI |
| Full build (R-032, R-045) | `npm run build` — all routes prerender, no type errors | CI |
| Lint / types | `npm run lint`, `npm run typecheck` | CI |
| Brevo end-to-end (R-033) | Manual: submit on a preview deploy with real Brevo env → confirm code email received + contact created with `DISCOUNT_CODE` | pre-launch checklist |
| Lighthouse (R-045) | Manual/Vercel — mobile Perf >90, A11y >95, SEO 100 | pre-launch checklist |

## 8. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Brevo sender domain not verified at launch (OQ-4) | Code emails silently undelivered | `isBrevoConfigured` gate; preview smoke test (R-033); Brevo dashboard check before go-live |
| Code redemption on the campaign is unsolved (OQ-2) | Codes may be un-redeemable as designed; promise to visitors unmet | Treat codes as list-reconciliation + marketing for now; resolve OQ-2 before campaign copy is final |
| Duplicate-contact race on simultaneous first submit | Two codes for one email briefly | Read-before-write on email; low pre-launch volume; last write wins |
| Final copy / renders slip (R-020, R-021) | Launch with visible placeholders | P1 not P0; stakeholder accepts temporary placeholders; grep gate for "TBD" strings before calling copy done |
| No rate limiting on the actions | Email/code spam, Brevo quota burn | Honeypot now; add Upstash if abuse appears (DECISIONS §12) |
| Emails (PII) stored only in Brevo (OQ-9) | GDPR posture + no backup | Privacy-policy copy (R-020); periodic CSV export; revisit consent (OQ-8) |
| Next.js 16 API drift vs training data | Wrong API usage | AGENTS.md rule — read `node_modules/next/dist/docs/` before new Next APIs |
