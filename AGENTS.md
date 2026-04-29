<!-- BEGIN:gripfit-project-rules -->
# GripFit Web — agent context

Project-specific rules for AI assistants. Read these before the Next.js notes below.

1. **Read [`Decisions.md`](./Decisions.md) in full before changing anything.**
   §16 lists open questions — do not write code that depends on an unanswered
   one without flagging it first.
2. **Visual tokens are owned by [`design.md`](./design.md) + [`app/globals.css`](./app/globals.css).**
   `design.md` is prose / intent; `app/globals.css` is the implementation.
   Do not invent new colors, font families, or radii in component files —
   extend `design.md` first, then mirror into `globals.css`. The old
   `DESIGN_SYSTEM/` folder was the placeholder "Ethereal Tech" identity
   and has been deleted.
3. **The site is light-only with a warm-cream canvas.** `<html>` carries
   no `dark` class — tokens live under `:root`. The default surface is
   `--bg-canvas` (`#F3ECE2`, warm cream), **not** pure white. The brand
   "accent" is the warm-ink `--accent` (`#1C1A17`, used as the primary
   CTA fill, links, focus rings, the logo bar). A separate **terracotta**
   `--promo` (`#B54A30`) is reserved for the pre-order discount UI only
   (banner, strike-through pricing, email-modal CTA). Do not add a
   dark-mode toggle. Do not use `--promo` for navigation, body emphasis,
   or general dividers. The previous royal-purple direction was reversed
   in the Apr 29, 2026 revamp; see Decisions.md §3.
4. **No on-site Shopify cart in v1.** The first revision drives pre-orders
   to the external crowdfunding URL defined in `lib/config.ts`
   (`externalLinks.crowdfundingUrl`). The `lib/shopify/` client is parked
   for v2 — files stay, but no component should `import` from it
   (Decisions.md §7, §16 Q3). No waitlist email capture, no customer
   accounts (Decisions.md §8). The discount UI is built into the v1
   pages: a 40%-off + free-shipping Kickstarter pre-order banner on every
   page, plus an email-capture modal that stacks an additional 15%-off on first
   visit (suppressed via localStorage afterwards).
5. **No social-proof / athlete grid on the home page** (Decisions.md §6).
   The home page comparison section pitting GripFit against a standard
   dynamometer is the analogous visual slot.
6. **Zero photography in v1.** Section "imagery slots" are abstract
   warm-cream gradient panels + SVG glyphs (design.md §9). The
   `AppShowcase` swipe gallery uses pure-CSS phone mockups, the hero
   product slot is a labelled placeholder tile, and inner-page product
   shots are explicitly labelled "TBD". Replace each placeholder when
   the design team supplies real renders / screenshots.
7. **Display font is Inter Tight, body is Inter.** Both are self-hosted
   variable fonts under `/public/fonts`. Display weights stay light (400
   for the largest sizes, 500 for headings) — this is the WHOOP-thin
   look, slightly warmed by the cream canvas. No third font, no Geist
   (deleted in the Apr 26, 2026 revamp).
8. **Server Components by default.** Add `"use client"` only when the file
   actually needs interactivity, browser APIs, or hooks. State for the
   discount banner dismissal and the email modal lives in localStorage
   only — no Redux / Zustand / SWR. The cart `Context` planned for v2 is
   intentionally unimplemented in v1.
9. **No hardcoded prices, product handles, API endpoints, or env values
   in components.** They live in `lib/config.ts` (`siteConfig`,
   `productConfig`, `discountConfig`, `externalLinks`) or `lib/env.ts`.
   Pre-order pricing is derived from `productConfig.base.fallbackPriceUSD`
   × `discountConfig.preorder.percentOff` so updating the discount only
   touches one file.
10. **Skills to consult:** `nextjs`, `shadcn`, `vercel-functions`. (No
    `auth` — accounts disallowed in v1. No `shopify-*` skills until the
    `lib/shopify/` client is reawakened in v2.)
<!-- END:gripfit-project-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
