# GripFit Web — Status

**Phase:** v1 code-complete — pending Brevo credentials, final content, campaign URL
**Updated:** 2026-09-07

---

## Now

**Blocked on you, not on code.** Every gate is green (`lint`, `typecheck`,
62 tests, `build` → 13 static routes) and the work is committed. Nothing
further can be verified end-to-end until Brevo is configured, because every
test mocks it.

Immediate action: the **Brevo manual checklist** below, then the smoke test
(`docs/ADMIN.md` §7–8).

## Recently completed — 2026-09-07

| Shipped | Requirements |
| --- | --- |
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

**Not yet proven:** R-011 and R-013 are wired but unverified against the live
Brevo API — the unit tests mock every call. The smoke test in
`docs/ADMIN.md` §8 is what closes them.

## Next

| Order | Work | Requirements | Blocked on |
| --- | --- | --- | --- |
| 1 | **Brevo account setup + env vars** — see ADMIN.md §4 and the manual checklist below | R-011, R-013 | You (Brevo dashboard) |
| 2 | Verify with the live smoke test on a preview deploy | R-033 | Step 1 |
| 3 | Structured data + OG images | R-043 | — |
| 4 | Final copy pass on every page | R-020 | Copy |
| 5 | Real product renders + app screenshots | R-021 | Design |
| 6 | Final logo + tagline confirmation | R-022 | Design |
| 7 | Lighthouse / a11y audit | R-045 | Steps 4–6 |
| 8 | Paste the live Kickstarter URL into `lib/admin.ts` | R-041 | Campaign build-out |

### Manual steps only you can do (Brevo)

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
| Email actually sending | Brevo attributes, list id, verified sender, API key | PRD OQ-4, OQ-5 · Decisions §16 Q16 |
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
- **`.env.example` is stale** — it still lists the removed `RESEND_*` /
  `CONTACT_EMAIL_FROM` keys and none of the `BREVO_*` ones. A tooling
  permission rule blocked writing to `.env*`; the correct contents are in
  `docs/ADMIN.md` §4. Update it by hand.
- **`lib/shopify/` is retained but unused** — a deliberate exception to
  the no-dead-code sweep, because Decisions §7 keeps it for the v2
  commerce relight. Say the word and it goes.
