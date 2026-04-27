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
3. **The site is dark-only.** `<html>` always carries the `dark` class. Do not
   add a light-mode color set.
4. **Single product, single CTA model.** v1 sells the GripFit base unit as a
   Shopify pre-order SKU. No waitlist, no customer accounts, no promo codes
   in custom UI (Decisions.md §5, §7, §8, §16 Q3).
5. **No social-proof / athlete grid on the home page** (Decisions.md §6).
   The analogous visual slot is the `Science` research-citation section.
6. **Zero photography in v1.** All "imagery slots" are abstract dark
   gradients + noise + SVG glyphs (design.md §9). Product-photo placeholders
   are explicitly labelled "TBD".
7. **Server Components by default.** Add `"use client"` only when the file
   actually needs interactivity, browser APIs, or hooks. State management is
   React Context + cookie for the cart only — no Redux / Zustand / SWR.
8. **No hardcoded prices, product handles, API endpoints, or env values
   in components.** They live in `lib/config.ts` or `lib/env.ts`.
9. **Skills to consult:** `nextjs`, `shadcn`, `vercel-functions`, `auth` (if
   we ever add accounts — currently disallowed in v1).
<!-- END:gripfit-project-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
