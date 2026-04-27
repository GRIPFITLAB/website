<!-- BEGIN:gripfit-project-rules -->
# GripFit Web — agent context

Project-specific rules for AI assistants. Read these before the Next.js notes below.

1. **Read [`Decisions.md`](./Decisions.md) in full before changing anything.**
   §16 lists open questions — do not write code that depends on an unanswered
   one without flagging it first.
2. **Visual tokens are owned by [`DESIGN_SYSTEM/`](./DESIGN_SYSTEM).** Mirror
   the CSS variables in `DESIGN_SYSTEM/colors_and_type.css` into
   `app/globals.css`. Do not invent new colors, font families, or radii in
   component files.
3. **Copy in `DESIGN_SYSTEM/ui_kits/website/*.jsx` is reference, not final.**
   Visual layout / spacing / motion choices there are authoritative; taglines
   and slogans are placeholders pending answers in `Decisions.md` §16.
4. **The site is dark-only.** `<html>` always carries the `dark` class. Do not
   add a light-mode color set.
5. **Single product, single CTA model.** v1 sells the GripFit base unit as a
   Shopify pre-order SKU. No waitlist, no customer accounts, no promo codes
   in custom UI (Decisions.md §5, §7, §8, §16 Q3).
6. **Server Components by default.** Add `"use client"` only when the file
   actually needs interactivity, browser APIs, or hooks. State management is
   React Context + cookie for the cart only — no Redux / Zustand / SWR.
7. **No hardcoded prices, product handles, API endpoints, or env values
   in components.** They live in `lib/config.ts` or `lib/env.ts`.
8. **Skills to consult:** `nextjs`, `shadcn`, `vercel-functions`, `auth` (if
   we ever add accounts — currently disallowed in v1).
<!-- END:gripfit-project-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
