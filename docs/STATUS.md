# GripFit Web — Status

**Phase:** v1 functional — email capture verified live; pending consent/privacy copy,
redemption decision, final content, campaign URL
**Updated:** 2026-09-08

---

## Now

**The email-discount flow is verified end to end against live Brevo** on
2026-09-08: form submitted on `/kickstarter`, code email received, contact
created on the website list with all four attributes. R-011 and R-013 are
closed. Every gate is green — `lint`, `typecheck`, 82 tests, `build` → 13
static routes.

What remains is not code. Three things make the site *misleading* rather than
merely unfinished, and they are the real launch gate:

1. **Consent copy under the email field.** The form adds people to a marketing
   list with no stated consent, no opt-in, and no unsubscribe on the one email
   they get (`docs/ADMIN.md` §10).
2. **Privacy policy.** It describes a Shopify checkout that does not exist and
   says nothing about email capture, Brevo, or codes — the only data the site
   actually collects.
3. **Pick a redemption route** — §9.4 lays out three, and recommends the secret
   Kickstarter reward tier. Codes are being issued *now*; nothing honours them
   yet, and the code email already promises a launch announcement.

Also: the Brevo list is the **only** copy of every issued code. Schedule the
export in §9.3 before the list is worth anything.

## Recently completed — 2026-09-07 / 09-08

| Shipped | Requirements |
| --- | --- |
| **09-08** `SITE_URL` replaces `NEXT_PUBLIC_SITE_URL` (server-only origin) | R-043 |
| **09-08** Blank env vars no longer crash the build; `.env.example` removed as a redundant third list | R-014 |
| **09-08** `SITE_URL` accepts a bare hostname; http/https enforced; `tests/env.test.ts` | R-043, R-030 |
| **09-08** Server Actions split from their schemas — every form page was 500ing in production | R-011, R-013 |
| **09-08** Brevo 401 diagnostics + env trimming; live flow verified | R-010, R-014 |
| **09-08** Discount-code runbook: storage, export, redemption options, obligations (ADMIN §9–11) | R-015 |
| MSRP $149 · campaign 25% · email +15% stacked → $94.99 (36.25% off) | R-002…R-005 |
| `lib/brevo/` typed client; both Server Actions on Brevo; env schema + flags | R-010, R-013, R-014 |
| Unique per-email discount codes, stored on the Brevo contact, idempotent | R-011, R-012 |
| `/kickstarter` holding page + `campaign.href` switch (replaces the `/contact` CTA fallback) | R-041 |
| Vitest suite (62 tests) + `.github/workflows/ci.yml` (lint → typecheck → test → build) | R-030, R-031, R-032 |
| Kickoff docs + `CHANGELOG.md` | — |
| Dead code removed (`InTheBox`, `Readiness`); five production bugs fixed | — |

**Bugs found and fixed during the pass** (none were in the kickoff scope):

| Bug | Impact |
| --- | --- |
| `robots.ts` allowed indexing in every environment | Vercel preview deploys were crawlable and competing with production |
| `ContactForm` used `text-success`, a class no token defines | Success message rendered unstyled |
| `/science` citations linked to `href="#"` | Dead links; announced as interactive to screen readers |
| `localStorage`/`sessionStorage` writes were unguarded | Threw and broke the page in browsers that block site data — including right after a successful signup |
| `DiscountBanner` called `setState` synchronously in an effect | Failed `npm run lint`, which the new CI gate makes blocking |

**Now proven:** R-011 and R-013 were verified against live Brevo on 2026-09-08
(§8 smoke test). Three production bugs were found and fixed in the process,
none of which any existing gate caught — see the 2026-09-08 row below.

## Next

| Order | Work | Requirements | Blocked on |
| --- | --- | --- | --- |
| 1 | **Consent copy** under the email field | R-042 | You + copy |
| 2 | **Privacy policy** rewrite: email capture, Brevo, retention, deletion; drop Shopify | R-020 | You + legal |
| 3 | **Choose a redemption route** (ADMIN §9.4) | R-015, OQ-2 | You |
| 4 | Stand up `support@gripfit.com` | OQ-4 | You |
| 5 | Scheduled Brevo export — the only backup of every code | OQ-9 | You |
| 6 | Terms of service review | R-020 | Legal |
| 7 | Structured data + OG images | R-043 | — |
| 8 | Final copy pass on every page | R-020 | Copy |
| 9 | Real product renders + app screenshots | R-021 | Design |
| 10 | Final logo + tagline confirmation | R-022 | Design |
| 11 | Lighthouse / a11y audit | R-045 | Steps 8–10 |
| 12 | Paste the live Kickstarter URL into `lib/admin.ts` | R-041 | Campaign build-out |
| 13 | An E2E test that renders a page | R-030 | Eng |

Full detail, with a blocks-launch column: **`docs/ADMIN.md` §11**.

### Manual steps only you can do (Brevo) — ✅ completed 2026-09-08

1. Create the custom contact attributes — **the code will error without
   these**: `DISCOUNT_CODE` (text), `DISCOUNT_PCT` (number),
   `SIGNUP_SOURCE` (text), `SIGNUP_TS` (text).
2. Create (or choose) the list website signups join → note its numeric id.
3. Verify a sender address or domain.
4. Generate a v3 API key.
5. Set `BREVO_API_KEY`, `BREVO_WEBSITE_LIST_ID`, `BREVO_SENDER_EMAIL`,
   `CONTACT_EMAIL_TO` (and optionally `BREVO_SENDER_NAME`,
   `BREVO_DISCOUNT_TEMPLATE_ID`) in Vercel and `.env.local`.

## Blocked

| Item | On | Ref |
| --- | --- | --- |
| What a discount code *does* | Kickstarter redemption mechanism — likely secret reward tiers, not a typed code | PRD OQ-2 · Decisions §16 Q14 |
| Live campaign CTA | Kickstarter campaign not built; `/kickstarter` holding page covers the gap meanwhile | Decisions §16 Q10 |
| Launch-ready pages | Final copy, product renders, app screenshots, logo, tagline | Decisions §16 Q15, Q5, Q6, Q9, Q11 |
| `mailto:` links in the footer / `/setup` | `support@gripfit.com` mailbox doesn't exist yet | Decisions §16 Q16 |
| Success measurement | No numeric targets set for capture rate / click-through | PRD OQ-3 |
| Compliance sign-off | Cookie-consent banner decision | PRD OQ-8 |

## Known gaps accepted for now

- **No rate limiting** on either Server Action — honeypot only. Add
  Upstash if abuse appears (Decisions §12).
- **No backup** of captured emails outside Brevo (PRD OQ-9).
- **`lib/shopify/` is retained but unused** — a deliberate exception to
  the no-dead-code sweep, because Decisions §7 keeps it for the v2
  commerce relight. Say the word and it goes.
