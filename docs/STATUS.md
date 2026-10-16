# GripFit Web — Status

**Phase:** launch build complete — navy theme, final copy, price experiment,
Meta tracking, Firestore lead DB. Pending: env vars, hi-res app screens,
real science citations, campaign URL.
**Updated:** 2026-10-15

---

## Now — 2026-10-15 launch revamp

Shipped in one pass (see `CHANGELOG.md` → "Oct 15, 2026"): dark navy + blue
theme matching the iOS app; final copy on every page; `/product` removed and
specs folded into the home page; three named price tiers (Super Early Bird /
Kickstarter / Retail); the **pre-launch price experiment** (random
per-visitor Kickstarter price in a signed first-party cookie, ad attribution
capture, Firestore lead DB, Meta Pixel + Conversions API with dedup and
hashed-only identity); cookie notice and privacy/terms disclosure.
Gates: `lint`, `typecheck`, 156 tests, `build` all green.

**Before running ads, set in Vercel:** `EXPERIMENT_SECRET`,
`FIREBASE_SERVICE_ACCOUNT_JSON`, `NEXT_PUBLIC_META_PIXEL_ID`,
`META_CAPI_ACCESS_TOKEN` (ADMIN §4), and put the URL-parameter string from
DECISIONS §17 on every ad. Then `npm run brevo:setup` once to create the four
new contact attributes.

**Still external:**

1. **`/science` citations are not real papers.** Replace with verifiable
   studies + DOIs (suggestions in the Oct 15 hand-off) — blocks launch.
2. Confirm the experiment range `$75–$140` (DECISIONS §16 Q17).

## Previously — 2026-09-30

Email capture is verified live and the launch-blocking compliance work is
done in code. Gates: `lint`, `typecheck`, 95 tests, `build`, and a new
`smoke` run that serves the build and requests every route.

**One thing found late and worth knowing:** discount codes were never being
stored. The four Brevo custom attributes did not exist, and Brevo silently
drops writes to unknown attributes rather than rejecting them — so every
signal said success while the code vanished. Fixed 2026-09-08 and verified;
`npm run brevo:check` now gates it. The two contacts captured before the fix
have no code and cannot be backfilled — delete them before the first export.

What is left is genuinely external:

1. **Pick a redemption route** (ADMIN §9.4 — recommendation is the secret
   Kickstarter reward tier). Codes are being issued now and the email already
   promises a launch announcement.
2. **Confirm `support@gripfitlab.com` receives mail** — the site now links to
   it (set up in Brevo 10-15); send a test message before launch.
3. **Legal review** of `/privacy` and `/terms`. Rewritten 2026-09-30 to cover
   the website and the iOS app at launch minimum. They no longer say they are
   unreviewed, and they still are. No legal entity, governing law, or hardware
   returns / warranty terms.
4. **Schedule `npm run export:contacts`.** It is the only backup of every
   issued code.
5. Final renders, copy, DOIs, logo, tagline, and the live campaign URL.

Full detail with a blocks-launch column: `docs/ADMIN.md` §11.

## Recently completed — 2026-09-07 → 09-30

| Shipped | Requirements |
| --- | --- |
| **09-30** `/privacy` + `/terms` rewritten to cover website and iOS app, launch-minimum; legal review deferred | R-020 |
| **09-08** `SITE_URL` replaces `NEXT_PUBLIC_SITE_URL` (server-only origin) | R-043 |
| **09-08** Blank env vars no longer crash the build; `.env.example` removed as a redundant third list | R-014 |
| **09-08** `SITE_URL` accepts a bare hostname; http/https enforced; `tests/env.test.ts` | R-043, R-030 |
| **09-08** Server Actions split from their schemas — every form page was 500ing in production | R-011, R-013 |
| **09-08** Brevo 401 diagnostics + env trimming; live flow verified | R-010, R-014 |
| **09-08** Discount-code runbook: storage, export, redemption options, obligations (ADMIN §9–11) | R-015 |
| **09-08** Consent copy, working unsubscribe, privacy + terms rewritten to reality | R-020, R-042 |
| **09-08** Brevo attributes were missing — codes silently unstored; created + verified | R-011, R-012 |
| **09-08** Rate limiting, `smoke` in CI, Brevo setup/check + export scripts | R-030, R-032, R-015 |
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
| 2 | **Privacy policy** legal review — copy shipped 09-30, unreviewed | R-020 | Legal |
| 3 | **Choose a redemption route** (ADMIN §9.4) | R-015, OQ-2 | You |
| 4 | Confirm `support@gripfitlab.com` receives mail (now live on the site) | OQ-4 | You |
| 5 | Scheduled Brevo export — the only backup of every code | OQ-9 | You |
| 6 | Terms of service legal review — copy shipped 09-30; add entity, governing law, returns / warranty | R-020 | Legal |
| 7 | Structured data + OG images | R-043 | — |
| 8 | Final copy pass on every page | R-020 | Copy |
| 9 | Real product renders + app screenshots | R-021 | Design |
| 10 | Final logo + tagline confirmation | R-022 | Design |
| 11 | Lighthouse / a11y audit | R-045 | Steps 8–10 |
| 12 | Paste the live Kickstarter URL into `lib/admin.ts` | R-041 | Campaign build-out |
| 13 | An E2E test that renders a page | R-030 | Eng |

Full detail, with a blocks-launch column: **`docs/ADMIN.md` §11**.

### Manual steps only you can do (Brevo) — ✅ completed 2026-09-08

1. Create the custom contact attributes — **skipping these fails silently,
   it does not error**: `DISCOUNT_CODE` (text), `DISCOUNT_PCT` (number),
   `SIGNUP_SOURCE` (text), `SIGNUP_TS` (text). Done 2026-09-08 via
   `npm run brevo:setup`.
2. Create (or choose) the list website signups join → note its numeric id.
3. Verify a sender address or domain.
4. Generate a v3 API key.
5. Set `BREVO_API_KEY`, `BREVO_WEBSITE_LIST_ID`, `BREVO_SENDER_EMAIL`,
   `EMAIL_SUPPORT` (and optionally `BREVO_SENDER_NAME`,
   `BREVO_DISCOUNT_TEMPLATE_ID`) in Vercel and `.env.local`.

## Blocked

| Item | On | Ref |
| --- | --- | --- |
| What a discount code *does* | Kickstarter redemption mechanism — likely secret reward tiers, not a typed code | PRD OQ-2 · Decisions §16 Q14 |
| Live campaign CTA | Kickstarter campaign not built; `/kickstarter` holding page covers the gap meanwhile | Decisions §16 Q10 |
| Launch-ready pages | Final copy, product renders, app screenshots, logo, tagline | Decisions §16 Q15, Q5, Q6, Q9, Q11 |
| Success measurement | No numeric targets set for capture rate / click-through | PRD OQ-3 |
| Compliance sign-off | Cookie-consent banner decision | PRD OQ-8 |

## Known gaps accepted for now

- **No rate limiting** on either Server Action — honeypot only. Add
  Upstash if abuse appears (Decisions §12).
- **No backup** of captured emails outside Brevo (PRD OQ-9).
- **`lib/shopify/` is retained but unused** — a deliberate exception to
  the no-dead-code sweep, because Decisions §7 keeps it for the v2
  commerce relight. Say the word and it goes.
