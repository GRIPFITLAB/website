# GripFit — Visual Design System

This file is the single source of truth for the GripFit web brand. It
replaces the old `DESIGN_SYSTEM/` folder (deleted) and the placeholder
"Ethereal Tech" identity that came with it. Tokens live in
[`app/globals.css`](./app/globals.css); this doc explains intent and
usage.

If a token isn't here, don't invent one in a component. Add it here
first.

> **Apr 29, 2026 revamp.** GripFit is now a **light-only**, warm-cream +
> warm-charcoal "ink" editorial site, in the spirit of warm wellness
> brands (Oura). The primary CTA fill is the warm ink itself — not a
> chromatic accent. A single **terracotta** promo accent is reserved
> for the discount banner / pre-order savings UI. The previous
> royal-purple direction has been replaced. See `Decisions.md` §3 for
> history.

---

## 1. Brand at a glance

GripFit is a precision hand dynamometer for athletes. The visual brand
takes its cues from premium wellness sites — light, warm, generous
white space, thin display typography, restrained palette, fully
rounded pill buttons, and big editorial cards. The dominant surface is
a warm cream; the contrast surface is a deep warm charcoal "ink".

**Mood:** clean, editorial, confident, warm. Thin display type. Heavy
use of cream space. Numbers are prominent. No glassmorphism, no glow
halos, no playful curves, no chromatic flood backgrounds.

**Voice:** declarative, second-person, no jargon, no emoji, numbers
are prominent, sentence case for everything except `eyebrows` / labels
which are UPPERCASE-TRACKED.

---

## 2. Color tokens

All values are wired into Tailwind through `@theme inline` in
`app/globals.css` and exposed as CSS custom properties under `:root`
(the only theme — the site is **light-only**; `<html>` has no `dark`
class).

### Surfaces

| Token                | Hex                          | Use |
| -------------------- | ---------------------------- | --- |
| `--bg-canvas`        | `#F3ECE2` (warm cream)       | Page background, default section |
| `--bg-elevated`      | `#F8F3EA`                    | Cards, panels (tier 1) |
| `--bg-raised`        | `#EDE4D5`                    | Raised surfaces, popovers, alt section |
| `--bg-deep`          | `#E6DCCB`                    | Spotlight section bands, footer base |
| `--bg-ink`           | `#1C1A17` (warm charcoal)    | Inverted dark sections (`bg-inverted`) |
| `--bg-ink-elevated`  | `#28251F`                    | Cards on dark sections |

### Ink (the brand accent)

| Token                | Hex / RGBA                       | Use |
| -------------------- | -------------------------------- | --- |
| `--accent`           | `#1C1A17`                        | Primary CTA fill, links, focus, key accents |
| `--accent-bright`    | `#2A2620`                        | Hover lift |
| `--accent-deep`      | `#0F0D0A`                        | Pressed / active state |
| `--accent-soft`      | `rgba(28,26,23,0.06)`            | Hover surfaces, chip tints |
| `--accent-glow`      | `rgba(28,26,23,0.12)`            | Soft halo on primary CTA hover |

### Promo (discount-only)

The terracotta promo accent is reserved for **the pre-order discount
UI** — the top-of-page banner, the strike-through pricing badge, and
the email-modal CTA. Do not use it for general links, body emphasis,
or section dividers.

| Token                  | Hex / RGBA                  | Use |
| ---------------------- | --------------------------- | --- |
| `--promo`              | `#B54A30`                   | Promo badge fill |
| `--promo-bright`       | `#C95A40`                   | Hover lift |
| `--promo-deep`         | `#8A3520`                   | Pressed state |
| `--promo-soft`         | `rgba(181,74,48,0.08)`      | Banner background tint |
| `--promo-foreground`   | `#FFFFFF`                   | Text on promo fill |

### Text

| Token                          | Hex / RGBA                    | Use |
| ------------------------------ | ----------------------------- | --- |
| `--text-primary`               | `#1C1A17`                     | Headlines, primary copy |
| `--text-secondary`             | `rgba(28,26,23,0.65)`         | Body, supporting copy |
| `--text-tertiary`              | `rgba(28,26,23,0.45)`         | Captions, meta, footer |
| `--text-disabled`              | `rgba(28,26,23,0.25)`         | Disabled UI |
| `--text-on-ink`                | `#F3ECE2`                     | Primary text on `bg-ink` / `bg-inverted` |
| `--text-on-ink-secondary`      | `rgba(243,236,226,0.65)`      | Body on dark sections |
| `--text-on-ink-tertiary`       | `rgba(243,236,226,0.45)`      | Captions on dark sections |

### Borders

| Token                | RGBA                          | Use |
| -------------------- | ----------------------------- | --- |
| `--border-hairline`  | `rgba(28,26,23,0.06)`         | Subtle dividers |
| `--border-default`   | `rgba(28,26,23,0.12)`         | Card borders |
| `--border-strong`    | `rgba(28,26,23,0.20)`         | Active / focused borders, outline pills |
| `--border-on-ink`    | `rgba(243,236,226,0.14)`      | Hairlines / outlines on dark sections |

### State

| Token                | Hex                          | Use |
| -------------------- | ---------------------------- | --- |
| `--state-success`    | `#5A7A3E` (warm muted green) | Positive scores |
| `--state-warning`    | `#B88718`                    | Moderate / caution |
| `--state-danger`     | `#B54A30`                    | Critical scores, errors |
| `--state-info`       | `#2F5E7A`                    | Informational |

**Rules:**
- The cream canvas is the default; **no section uses pure white**. Pure
  white reads sterile against this palette and breaks the warmth.
- The brand "accent" is the warm ink itself — the primary CTA pill is
  `bg-accent` filled with `text-on-ink`. Solid charcoal on cream reads
  as the strongest possible affordance without resorting to a chromatic
  accent.
- The `bg-inverted` (warm charcoal) utility may be used on **at most
  two** sections per page — typically the comparison band and the
  final CTA — and they should not be adjacent.
- Promo terracotta is reserved for discount UI only (the banner, the
  strike-through pricing badge, the email-capture modal CTA). Don't
  use it for navigation, body emphasis, or general dividers.
- Section padding pattern alternates `bg-canvas` → `bg-raised` /
  `bg-deep` / `bg-inverted` to create rhythm. No section relies on
  photography for contrast.

---

## 3. Typography

Two self-hosted variable fonts. **No third font.**

| Family       | Where it ships                                          | Use              |
| ------------ | ------------------------------------------------------- | ---------------- |
| `Inter Tight`| `/public/fonts/InterTight-Variable.woff2` (100–900)     | All display copy |
| `Inter Tight`| `/public/fonts/InterTight-Variable-Italic.woff2`        | Display italics  |
| `Inter`      | `/public/fonts/Inter-VariableFont_opsz_wght.ttf`        | All body copy    |
| `Inter`      | `/public/fonts/Inter-Italic-VariableFont_opsz_wght.ttf` | Body italics     |

`@font-face` rules live in `app/globals.css`. Tailwind exposes them as
`font-display` (Inter Tight) and `font-sans` (Inter). Don't reference
these family names anywhere else.

### Display scale

**Thin and editorial** — the WHOOP-thin look, slightly warmed by the
cream canvas. Display sizes default to weight `400` at the largest
tiers and step up to `500` for headings. Tracking is gently negative.

| Token            | clamp                                | Weight | Tracking | Use |
| ---------------- | ------------------------------------ | ------ | -------- | --- |
| `display-3xl`    | `clamp(72px, 11vw, 168px)`           | 400    | -0.025em | Hero only |
| `display-2xl`    | `clamp(52px, 7.5vw, 108px)`          | 400    | -0.022em | Alternate hero / section opener |
| `display-xl`     | `clamp(40px, 5vw, 72px)`             | 500    | -0.02em  | Section H1 |
| `display-lg`     | `clamp(30px, 3.6vw, 48px)`           | 500    | -0.018em | Section H2 |
| `display-md`     | `clamp(22px, 2.2vw, 32px)`           | 500    | -0.014em | Card headline |
| `display-sm`     | `20px`                               | 500    | -0.01em  | Sub-heading |

### Body scale

| Token       | Size / line-height | Use |
| ----------- | ------------------ | --- |
| `body-lg`   | `17px / 1.65`      | Hero subtitle, intro paragraphs |
| `body`      | `15px / 1.65`      | Default paragraph |
| `body-sm`   | `13px / 1.55`      | Card meta, footnotes |
| `eyebrow`   | `11px / 1` upper / tracking `0.16em` weight `600` | Section labels, kicker text |
| `mono-data` | `13px / 1.4` mono fallback stack, `tabular-nums` | Stats, numeric displays |

---

## 4. Spacing & layout

Base unit: 4px. Tailwind's default scale is fine; the only project-level
constants are the **container** and the **section rhythm**:

- `max-w-7xl` (1280px) for primary content
- `max-w-prose` for long-form (`/privacy`, `/terms`, `/setup`)
- Full-bleed sections use `w-full` with internal `mx-auto` content

Section padding pattern:

```
px-5 md:px-8       /* horizontal, all sections */
py-20 md:py-32     /* vertical, default major section */
py-16 md:py-24     /* tighter vertical for inner pages */
```

---

## 5. Radii & shadows

Soft and warm. **Pill buttons by default.**

| Token           | Value     | Use |
| --------------- | --------- | --- |
| `--radius-sm`   | `6px`     | Inputs, chips |
| `--radius-md`   | `12px`    | Default rounded — small surfaces |
| `--radius-lg`   | `16px`    | Cards |
| `--radius-xl`   | `24px`    | Hero cards, big media frames |
| `--radius-2xl`  | `32px`    | Phone mockup bezels |
| `--radius-3xl`  | `40px`    | Phone-screen inserts |
| `rounded-full`  | `9999px`  | All buttons (`components/ui/button.tsx` base) |

Shadows are warm, low-elevation drops on the cream canvas — never
tinted with the promo terracotta:

| Token                 | Value                                              | Use |
| --------------------- | -------------------------------------------------- | --- |
| `shadow-sm`           | `0 1px 2px rgba(28,26,23,0.04)`                    | Hairline lift |
| `--shadow-card`       | `0 4px 24px rgba(28,26,23,0.06)`                   | Card resting elevation |
| `--shadow-card-hover` | `0 8px 36px rgba(28,26,23,0.10)`                   | Card hover |
| `--shadow-glow`       | `0 0 28px rgba(28,26,23,0.12)`                     | Primary CTA hover only |

---

## 6. Components

### Buttons (`components/ui/button.tsx`)

The base CVA in `components/ui/button.tsx` makes every button a `rounded-full` pill.

- `default` — `bg-primary text-primary-foreground` → warm-ink fill, cream label. The single most prominent affordance per section.
- `outline` — transparent fill, `border-default`, ink label. `hover:bg-muted` lifts to the cream-elevated surface.
- `secondary` — `bg-secondary` (cream-elevated) with ink label.
- `ghost` — pure text-link with hover lift to `bg-muted`.
- `promo` (custom class composition, not a CVA variant) — `bg-promo text-white` for the discount banner CTA only.

### Cards

```
rounded-lg border border-default bg-bg-elevated p-6 md:p-8
```

No backdrop-blur. No glassmorphism. Cards are solid, slightly raised
warm panels on the cream canvas. Hover lifts to `--shadow-card-hover`
plus a faint `border-strong`.

### Section headers

```
<eyebrow>   ← uppercase, tracked, text-text-tertiary by default;
              text-promo only when announcing the discount UI
<display-lg>← thin, near-black, slightly tight tracking
<body-lg>   ← optional, secondary text
```

### Discount banner & promo pills

The pre-order site-wide banner is `bg-promo text-promo-foreground`,
sticky just under the nav, dismissable. Promo pills (40%-OFF,
FREE-SHIPPING, EXTRA-15%-OFF) inline use `border-promo text-promo` outline-style at
small sizes. Strike-through pricing renders the original price with
`line-through text-text-tertiary` and the sale price as the live
display number.

### App-screenshot mockups

Used in `components/marketing/AppShowcase.tsx`. Phone frames are pure
CSS — no real iPhone bezels, no Apple trade dress. The component is a
swipe gallery: image-on-right, paragraph-on-left layout per page, with
left/right arrows and dot pagination. Phones get replaced with real
screenshots when the design team supplies them.

### Comparison section

`components/marketing/Comparison.tsx` is a `bg-inverted` (warm
charcoal) feature-matrix section pitting GripFit against a generic
"standard dynamometer". Rows: Bluetooth, app-enabled readiness,
tracking, fatigue, balance. Yes/no glyphs are simple cream check vs
hairline minus on warm ink — no chromatic semaphore.

---

## 7. Iconography

Lucide icons (already in `package.json`). Stroke 1.5, size 16/20/24.
**No filled icons.** Tint defaults to `currentColor`. Active / branded
icons use `text-accent`. Promo-row glyphs in the comparison section
are stroked.

---

## 8. Motion

- Default transition: `transition-colors duration-200 ease-out`.
- Larger transforms (hover lifts, slide-ins): `duration-300 ease-out`.
- Carousels (AppShowcase, Science) use CSS scroll-snap + smooth scroll
  by default; reduced-motion drops the smooth-scroll behaviour and
  jumps directly.
- **No glow pulses, no perpetual motion.** The site should feel still
  and confident.
- `prefers-reduced-motion` honoured by Tailwind defaults; hand-coded
  animations should respect it.

---

## 9. Imagery

**Zero photography in v1.** Per the answers locked in for this revamp:

- Section "imagery slots" are abstract gradient panels (subtle warm
  washes on `--bg-deep`) plus optional noise texture at very low
  opacity. No photography.
- The hero **product image slot** is currently a labelled cream tile
  with a faint warm wash — replaced with a real product render when
  the design team supplies it.
- The **app-showcase** swipe gallery uses pure-CSS phone mockups with
  abstract gradient screens labelled by feature. Placeholders only.
- Inner-page **product placeholders** are visible, labelled "Product
  photography TBD" blocks.

---

## 10. What we explicitly do NOT do

- **No dark mode.** `<html>` has no `dark` class. The site is light-only.
- **No pure white.** The default surface is the warm cream `--bg-canvas`.
- **No social-proof / athlete grid section** on the home page (Decisions §6).
- **No 3-step "how it works" rail** — replaced by the readiness card
  section in the Apr 29, 2026 revamp.
- **No on-site Shopify cart in v1.** Pre-orders are taken via the
  external crowdfunding link defined in `lib/config.ts`. The
  `lib/shopify/` client is parked for v2 (Decisions §7 / §16 Q3).
- No glassmorphism / `backdrop-blur` on cards.
- No glow halos on body text.
- No second display font. No third body font.
- No invented colours in components — extend this file first.
- No promo terracotta outside the discount UI.
