# GripFit — Visual Design System

This file is the single source of truth for the GripFit web brand.
Tokens are implemented twice, deliberately, and kept in sync by
`tests/theme.test.ts`:

- [`app/globals.css`](./app/globals.css) — the CSS implementation Tailwind
  utilities consume (`bg-bg-canvas`, `text-accent`, …).
- [`lib/theme.ts`](./lib/theme.ts) — the same values as TypeScript, for the
  few places that cannot read a CSS variable (`<meta theme-color>`, HTML
  email, SVG literals).

Shared UI building blocks live in `components/ui/` (`section.tsx`,
`typography.tsx`, `surface.tsx`, plus the shadcn primitives). Marketing
components compose those — they do not restate layout or colour classes.
If a token or primitive isn't here, don't invent one in a component. Add it
here first.

> **Oct 15, 2026 revamp.** GripFit web now matches the GripFit iOS app:
> a **dark-only, deep-navy canvas with one electric-blue accent**. The
> previous warm-cream light direction (Apr 29, 2026) is retired. See
> `DECISIONS.md` §3 for history.

---

## 1. Brand at a glance

GripFit is a precision hand dynamometer that turns one daily squeeze into
a readiness signal. The web brand is the app's visual language stretched
to a landing page: deep navy, generous space, one saturated blue, crisp
white type, hairline rules, and real app screens as the only imagery.

**Mood:** still, precise, confident. Big type, few words. Numbers are the
hero content. No glassmorphism, no glow halos on text, no gradient text,
no decorative blobs, no stock photography, no "AI-slop" card grids with
an icon per card.

**Voice:** declarative, second-person, short. Sentence case everywhere
except `eyebrows` / labels which are UPPERCASE-TRACKED.

---

## 2. Color tokens

All values are wired into Tailwind through `@theme inline` in
`app/globals.css` and exposed as CSS custom properties under `:root`
(the only theme — the site is **dark-only**; `color-scheme: dark`).

### Surfaces

| Token               | Hex       | Use |
| ------------------- | --------- | --- |
| `--bg-canvas`       | `#0A1328` | Page background, default section |
| `--bg-elevated`     | `#101C36` | Cards, panels, popovers |
| `--bg-raised`       | `#16264A` | Raised surfaces, alt rows, inputs on cards |
| `--bg-deep`         | `#060C1A` | Footer, 404, recessed bands |
| `--bg-ink`          | `#1437A3` | Inverted band (`.bg-inverted` — the app's blue gradient) |
| `--bg-ink-elevated` | `#1A46C4` | Panels on the inverted band |

### Accent (the brand blue)

| Token             | Value                     | Use |
| ----------------- | ------------------------- | --- |
| `--accent`        | `#3B82F6`                 | Primary CTA fill, links, focus ring, live numbers |
| `--accent-bright` | `#60A5FA`                 | Hover, link hover, active nav |
| `--accent-deep`   | `#2563EB`                 | Pressed state |
| `--accent-soft`   | `rgba(59,130,246,0.14)`   | Hover surfaces, chips, selection |
| `--accent-glow`   | `rgba(59,130,246,0.35)`   | Primary CTA hover shadow only |

### Promo (discount-only)

Reserved for the **Super Early Bird / discount UI**: the top banner, the
Super Early Bird tier in the pricing display, the email-modal CTA, and the
teaser link. Never for navigation, body emphasis, or dividers.

| Token                | Value                     | Use |
| -------------------- | ------------------------- | --- |
| `--promo`            | `#34D399`                 | Promo fill / promo text |
| `--promo-bright`     | `#6EE7B7`                 | Hover |
| `--promo-deep`       | `#059669`                 | Pressed |
| `--promo-soft`       | `rgba(52,211,153,0.12)`   | Tint behind the Super Early Bird tier |
| `--promo-foreground` | `#06201A`                 | Text on promo fill |

### Text

| Token                       | Value                       | Use |
| --------------------------- | --------------------------- | --- |
| `--text-primary`            | `#F5F8FF`                   | Headlines, primary copy |
| `--text-secondary`          | `rgba(245,248,255,0.70)`    | Body |
| `--text-tertiary`           | `rgba(245,248,255,0.48)`    | Captions, eyebrows, meta |
| `--text-disabled`           | `rgba(245,248,255,0.28)`    | Disabled UI |
| `--text-on-ink`             | `#FFFFFF`                   | Primary text on `.bg-inverted` |
| `--text-on-ink-secondary`   | `rgba(255,255,255,0.76)`    | Body on the blue band |
| `--text-on-ink-tertiary`    | `rgba(255,255,255,0.56)`    | Captions on the blue band |

### Borders

| Token               | Value                      | Use |
| ------------------- | -------------------------- | --- |
| `--border-hairline` | `rgba(255,255,255,0.08)`   | Row dividers |
| `--border-default`  | `rgba(255,255,255,0.14)`   | Card borders |
| `--border-strong`   | `rgba(255,255,255,0.26)`   | Outline buttons, focused borders |
| `--border-on-ink`   | `rgba(255,255,255,0.22)`   | Hairlines on the blue band |

### State

| Token             | Hex       | Use |
| ----------------- | --------- | --- |
| `--state-success` | `#34D399` | Success messages |
| `--state-warning` | `#FBBF24` | Caution |
| `--state-danger`  | `#F87171` | Errors |
| `--state-info`    | `#60A5FA` | Informational |

**Rules**

- Navy canvas everywhere. **No section is white or light.** The only
  saturated surface is `.bg-inverted` (comparison band) — at most once per
  page.
- One accent. Blue does CTAs, links, and the live number. Nothing else is
  blue.
- Promo green is discount-only.
- Backgrounds may carry **one** `.bg-accent-wash` radial per section, at
  the top edge, and the `.bg-noise` texture on bands. Nothing animates in
  the background.

---

## 3. Typography

Two self-hosted variable fonts. **No third font.**

| Family        | Where it ships                                          | Use              |
| ------------- | ------------------------------------------------------- | ---------------- |
| `Inter Tight` | `/public/fonts/InterTight-Variable.woff2`               | All display copy |
| `Inter Tight` | `/public/fonts/InterTight-Variable-Italic.woff2`        | Display italics  |
| `Inter`       | `/public/fonts/Inter-VariableFont_opsz_wght.ttf`        | All body copy    |
| `Inter`       | `/public/fonts/Inter-Italic-VariableFont_opsz_wght.ttf` | Body italics     |

Tailwind exposes them as `font-display` (Inter Tight) and `font-sans`
(Inter). Don't reference the family names anywhere else.

### Display scale

Medium weight (500) throughout — thin weights lose contrast on navy.
Tracking is firmly negative; the look is tight, modern, and quiet.

| Token         | clamp                        | Weight | Tracking  | Use |
| ------------- | ---------------------------- | ------ | --------- | --- |
| `display-3xl` | `clamp(64px, 9.5vw, 148px)`  | 500    | -0.035em  | Reserved |
| `display-2xl` | `clamp(44px, 6.4vw, 92px)`   | 500    | -0.032em  | Hero H1 |
| `display-xl`  | `clamp(36px, 4.6vw, 64px)`   | 500    | -0.028em  | Section H2 / page H1 |
| `display-lg`  | `clamp(28px, 3.3vw, 44px)`   | 500    | -0.022em  | Sub-section H2 / modal title |
| `display-md`  | `clamp(22px, 2.2vw, 30px)`   | 500    | -0.016em  | Card headline |
| `display-sm`  | `19px`                       | 500    | -0.012em  | Row label |

### Body scale

| Token       | Size / line-height | Use |
| ----------- | ------------------ | --- |
| `body-lg`   | `17–19px / 1.65`   | Hero lead, section intro |
| `body`      | `15px / 1.65`      | Default paragraph |
| `body-sm`   | `13px / 1.55`      | Meta, footnotes |
| `eyebrow`   | `11px / 1`, upper, `0.16em`, 600 | Section labels |

Prices and stats use `tabular-nums` and the display family.

---

## 4. Spacing & layout

Base unit: 4px. Shared constants live in `components/ui/section.tsx`:

- `<Container>` — `mx-auto w-full max-w-7xl px-5 md:px-10`
- `<Section>` — vertical rhythm `py-20 md:py-28` (`tight`: `py-14 md:py-20`)
- `max-w-3xl` for long-form (`/privacy`, `/terms`, `/setup`)

---

## 5. Radii & shadows

| Token           | Value    | Use |
| --------------- | -------- | --- |
| `--radius-sm`   | `6px`    | Chips |
| `--radius-md`   | `12px`   | Inputs |
| `--radius-lg`   | `16px`   | Cards |
| `--radius-xl`   | `24px`   | Large panels, image frames |
| `--radius-2xl`  | `32px`   | Showcase frames |
| `rounded-full`  | `9999px` | All buttons |

Shadows are deep and cool — `--shadow-card`, `--shadow-card-hover`,
`--shadow-glow` (primary CTA hover only). Never tinted promo-green.

---

## 6. Components

### Primitives (`components/ui/`)

- `section.tsx` — `Section`, `Container`, `SectionHeader` (eyebrow +
  heading + optional lead, left-aligned, max-width-constrained).
- `typography.tsx` — `Eyebrow`, `Display`, `Lead`, `Meta`.
- `surface.tsx` — `Surface` (card: `rounded-2xl border border-border-default bg-bg-elevated`).
- `button.tsx` — pill buttons. `default` = blue fill / white; `outline` =
  hairline / white text; `ghost`; `promo` via `className` for the
  Super Early Bird CTA only.

### Pricing display

Three tiers in one row: **Super Early Bird** (promo tint, email signup),
**Kickstarter**, **Retail** (struck through). Prices and percent-off
badges are computed in `lib/pricing.ts` — never literal in JSX. The
Kickstarter amount may vary per visitor (price experiment, see
`DECISIONS.md` §17).

### Discount banner

`bg-promo text-promo-foreground`, full width above the nav, dismissable.
This is the only flood-fill of promo green.

### App screens

Real App Store panels from `public/app/`, shown in rounded frames with a
hairline border. No CSS phone mockups, no Apple trade dress drawn by us.

### Comparison

`.bg-inverted` band, GripFit vs a standard dynamometer. Check vs minus
glyphs in white.

---

## 7. Iconography

Lucide, stroke 1.5–2, sizes 16/20/24. `currentColor` only. No filled
icons, no icon-per-card grids.

---

## 8. Motion

- `transition-colors duration-200 ease-out` by default.
- Transforms: `duration-300 ease-out`.
- Carousels use CSS scroll-snap; `prefers-reduced-motion` disables smooth
  scroll (handled in `globals.css`).
- No background animation, no pulsing, no parallax.

---

## 9. Imagery

- **App screens** from `public/app/screen-*.png` are the only imagery.
  Replace with higher-resolution exports using the same filenames.
- **Logo**: `public/brand/gripfit-g.png` (the app icon's "G" with the
  background removed) next to the "GripFit" wordmark in Inter Tight.
  `app/icon.png` / `app/apple-icon.png` are the app icon.
- No stock photography. No illustrations.

---

## 10. What we explicitly do NOT do

- No light mode. No theme toggle.
- No white sections.
- No social-proof / athlete grid.
- No on-site cart (pre-orders go to Kickstarter).
- No glassmorphism / `backdrop-blur` on cards (the sticky nav may blur).
- No gradient text, no glow on body text.
- No second display font, no third body font.
- No invented colours in components — extend this file and
  `lib/theme.ts` + `globals.css` together.
- No promo green outside the discount UI.
