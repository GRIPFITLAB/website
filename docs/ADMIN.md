# GripFit Web — Admin / Ops

> Real commands, environments, and conventions. Product scope is in
> [`PRD.md`](./PRD.md); build design in [`EDD.md`](./EDD.md).

---

## 1. Local development

```bash
nvm use                         # Node 22 LTS (.nvmrc)
npm install
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

Schema + validation: [`lib/env.ts`](../lib/env.ts) (Zod). The table below is
the authoritative list — there is no committed `.env.example`. For local work,
hand-write a `.env.local` with only the keys you actually need.
All are optional at boot; features degrade to a logging fallback when unset.
A variable left **blank** counts as unset — `lib/env.ts` drops empty values
before validating, so an empty field in the Vercel dashboard disables its
feature rather than failing the build (R-014).

| Var | Scope | Needed | Purpose |
| --- | --- | --- | --- |
| `BREVO_API_KEY` | server | before launch | Brevo v3 API auth |
| `BREVO_WEBSITE_LIST_ID` | server | before launch | list for captured email-discount signups (confirm list ID — PRD OQ-5) |
| `BREVO_SENDER_EMAIL` | server | before launch | verified Brevo sender address (PRD OQ-4) |
| `BREVO_SENDER_NAME` | server | optional | outbound display name |
| `BREVO_DISCOUNT_TEMPLATE_ID` | server | optional | Brevo template for the code email; inline HTML used if unset |
| `CONTACT_EMAIL_TO` | server | before launch | support inbox for contact-form mail (PRD OQ-4) |
| `SITE_URL` | server | before launch | absolute URLs for `sitemap.xml`, `robots.txt`, OG tags |
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
- Before attaching the production domain: set `SITE_URL`, then the
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

## 9. Discount codes — anatomy, storage, review, redemption

### 9.1 What a code is

`GF-7Q4KX2M9` — the prefix from `emailDiscount.codePrefix` (`lib/admin.ts`),
then 8 characters of Crockford base32 (`0-9A-Z` minus `I`, `L`, `O`, `U`, so a
code read off a screen cannot be mistyped into a lookalike). 40 bits of entropy
from `crypto.getRandomValues`.

The token is **random, not derived from the email**. Deriving it would let
anyone who knows the algorithm mint a valid code for any address.

One address gets exactly one code, permanently: `submitEmailDiscount` looks the
contact up first and re-sends the existing `DISCOUNT_CODE` rather than issuing a
second (R-012). Re-submitting is therefore safe and idempotent.

A code is worth an extra **15% off the campaign price**, stacking on the 25%
Kickstarter discount — $94.99 against a $149 MSRP. All three numbers live in
`lib/admin.ts`.

### 9.2 Where codes live — and the risk that creates

**Brevo is the only store. There is no database and no backup** (EDD D-004,
PRD OQ-9). Each signup is one Brevo contact carrying four attributes:

| Attribute | Type | Example | Meaning |
| --- | --- | --- | --- |
| `DISCOUNT_CODE` | Text | `GF-7Q4KX2M9` | the code itself |
| `DISCOUNT_PCT` | Number | `15` | percent off, at time of issue |
| `SIGNUP_SOURCE` | Text | `website` | distinguishes these from iOS-app contacts |
| `SIGNUP_TS` | Text | ISO 8601 | when it was issued |

Consequences worth understanding before you rely on this:

- **Delete a Brevo contact and its code is gone.** If that person re-submits
  they receive a *different* code, and any record you gave them is now invalid.
- **Losing access to the Brevo account or list loses every code**, with no
  second copy anywhere.
- Nothing reconciles the site against Brevo. The site never reads codes back
  except during a re-submission.

Until OQ-9 is answered, the mitigation is the export in §9.3, run on a schedule
and kept somewhere you control.

### 9.3 Reviewing and exporting codes

**Brevo UI** — Contacts → Lists → *(your website list)* → **Export contacts**.
Include attributes; you get a CSV with `EMAIL`, `DISCOUNT_CODE`, `DISCOUNT_PCT`,
`SIGNUP_SOURCE`, `SIGNUP_TS`. This is the file you reconcile against.

**API**, for scripting a periodic backup (paginate, 500 max per call):

```bash
curl -s "https://api.brevo.com/v3/contacts/lists/$LIST_ID/contacts?limit=500&offset=0" \
  -H "api-key: $BREVO_API_KEY" -H "accept: application/json"
```

Spot-checking one address:

```bash
curl -s "https://api.brevo.com/v3/contacts/you%40example.com" \
  -H "api-key: $BREVO_API_KEY" | jq '.attributes'
```

### 9.4 Redemption — unresolved, and it is not a code problem (OQ-2)

**Nothing enforces these codes.** Not the site, not Brevo, not Kickstarter.
Kickstarter has no native promo-code mechanism, which is why v1 treats codes as
informational (EDD D-006). Issuing them was always the easy half; honouring
them is an operational decision you still have to make. The three workable
routes:

| Option | How it works | Cost |
| --- | --- | --- |
| **A — Pledge survey** | Add a "discount code" question to the Kickstarter survey. Export responses, cross-check against the Brevo CSV, refund the difference or send a credit. | Manual, and refunds after the fact look untidy to backers. |
| **B — Secret reward tier** *(recommended)* | Create a Kickstarter secret/hidden reward priced at $94.99. Put its URL in the launch email instead of asking for a code. | Cleanest for the backer — the price is simply right. The code becomes a receipt rather than a key. Anyone who forwards the link gets the price. |
| **C — Post-campaign** | Collect codes in the pledge-manager (BackerKit or similar) and apply the discount to the fulfilment invoice. | Depends on a tool you have not chosen; delays the discount. |

Option B is the recommendation: it needs no reconciliation, and it converts the
code from something that must be *enforced* into something that merely has to be
*sent*. If you pick B, the codes still earn their keep as the mailing list.

Whichever you pick, note the commitment already made in the email body: *"we'll
write to you the day it opens."* That is a broadcast you owe every contact on
this list, and it is the moment the code has to mean something.

### 9.5 Abuse

One code per address is enforced; **one code per person is not**. Nothing stops
someone submitting ten addresses, and there is no rate limiting on the Server
Action — a determined script could enumerate the form. The deterrent is
traceability: a leaked code identifies the address it was issued to (EDD D-005).

If volume looks wrong at reconciliation, the practical controls are capping
redemptions manually, or checking `SIGNUP_TS` clustering in the export.

## 10. What issuing these codes obliges you to do

This is the part that is easy to skip and awkward to retrofit.

**The code email is transactional; the list is marketing.** The email goes via
Brevo's `/smtp/email` endpoint, and Brevo does not add an unsubscribe link to
transactional mail by default. The same submission adds that person to a
marketing list via `/contacts`. So today: **no consent checkbox, no double
opt-in, and no unsubscribe link on the only email they receive.**

Brevo *does* add unsubscribe automatically to campaign (broadcast) sends, so the
launch announcement will carry one. The gap is the initial capture, and it is
the capture that has to be defensible.

**The privacy policy does not mention any of this.** It currently describes a
Shopify checkout that does not exist in v1 and says nothing about email capture,
Brevo, or discount codes — the one thing the site actually collects. That is the
most concrete item on this page.

Minimum before you send traffic:

1. **A line of consent copy under the email field** saying what they are signing
   up for — the code plus launch news — and that they can unsubscribe.
2. **A privacy section covering the capture**: what is stored (email + code +
   timestamp), that Brevo is the processor, how long it is kept, and how to be
   deleted.
3. **Delete the Shopify paragraph** from `/privacy`, or scope it to v2.
4. Decide whether the code email should carry an unsubscribe link. It needs a
   real unsubscribe destination first — do not ship a decorative one.

**Deletion requests** are served by deleting the Brevo contact, which also
destroys the code (§9.2). Say so when you answer one.

## 11. Before-launch checklist

Everything still outstanding. "Blocks launch" means the site is misleading or
broken without it, not merely unpolished.

| # | Item | Blocks launch | Owner |
| --- | --- | --- | --- |
| 1 | Consent copy under the email field (§10) | Yes | You + copy |
| 2 | Privacy policy: email capture, Brevo, retention, deletion; drop Shopify (§10) | Yes | You + legal |
| 3 | Pick a redemption route — A, B, or C (§9.4, OQ-2) | Yes | You |
| 4 | `support@gripfit.com` mailbox — `mailto:` links bounce until it exists (OQ-4) | Yes | You |
| 5 | Kickstarter campaign URL → `links.crowdfundingUrl` (OQ-1) | Yes | You |
| 6 | Scheduled export of the Brevo list as the only backup (§9.3, OQ-9) | Yes | You |
| 7 | Terms of service — placeholder copy, unreviewed | Yes | Legal |
| 8 | Product photography — hero and `/product` show "TBD" tiles | No | Design |
| 9 | OG image, Twitter handle, manifest icons (`app/layout.tsx` TODO) | No | Design |
| 10 | `/science` citations — real DOIs, currently plain rows | No | You |
| 11 | Final tagline and logo (DECISIONS §16 Q5, Q6) | No | You + design |
| 12 | Cookie-consent banner — scope undecided (OQ-8) | Undecided | You |
| 13 | Rate limiting on the email Server Action (§9.5) | No | Eng |
| 14 | E2E test that renders a page — no test does today | No | Eng |

Item 14 is worth its place: a `"use server"` export bug shipped to production
and 500'd every form page while `next build` stayed green and 78 unit tests
passed. Nothing in CI renders a page, so nothing caught it.

## 12. Conventions

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
