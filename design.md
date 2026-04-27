# GripFit — Visual Design System

This file is the single source of truth for the GripFit web brand. It
replaces the old `DESIGN_SYSTEM/` folder (deleted) and the placeholder
"Ethereal Tech" identity that came with it. Tokens live in
[`app/globals.css`](./app/globals.css); this doc explains intent and
usage.

If a token isn't here, don't invent one in a component. Add it here
first.

> **Apr 26, 2026 revamp.** GripFit is now a **light-only**, WHOOP-thin
> editorial site with a **royal deep purple** (`#5B21B6`) accent used
> sparingly. The previous dark-only / amber direction has been replaced.
> See `Decisions.md` §3 for history.

---

## 1. Brand at a glance

GripFit is a precision hand dynamometer for athletes. The visual brand
takes its cues from performance-wearable sites — light, airy, generous
white space, thin display typography, single restrained accent — but
uses **royal deep purple** as its signature.

**Mood:** clean, editorial, confident, modern. Thin display type. Heavy
use of white space. Numbers are prominent. No glassmorphism, no glow
halos, no playful curves, no gradient flood backgrounds.

**Voice:** declarative, second-person, no jargon, no emoji, numbers are
prominent, sentence case for everything except `eyebrows`/labels which
are UPPERCASE-TRACKED.

---

## 2. Color tokens

All values are wired into Tailwind through `@theme inline` in
`app/globals.css` and exposed as CSS custom properties under `:root`
(the only theme — the site is **light-only**; `<html>` has no `dark`
class).

| Token                | Hex / RGBA                       | Use |
| -------------------- | -------------------------------- | --- |
| `--bg-canvas`        | `#FFFFFF`                        | Page background |
| `--bg-elevated`      | `#FAFAFA`                        | Cards, panels (tier 1) |
| `--bg-raised`        | `#F4F4F5`                        | Raised surfaces, popovers (tier 2) |
| `--bg-deep`          | `#EFEFF1`                        | Alternate spotlight section bands |
| `--accent`           | `#5B21B6`                        | Brand accent — buy CTAs, links, focus |
| `--accent-bright`    | `#6D28D9`                        | Hover / highlighted state |
| `--accent-deep`      | `#4C1D95`                        | Pressed / active state |
| `--accent-soft`      | `rgba(91,33,182,0.08)`           | Background tints, chips, hover surfaces |
| `--accent-glow`      | `rgba(91,33,182,0.18)`           | Soft halo on primary CTA hover |
| `--text-primary`     | `#0A0A0B`                        | Headlines, primary copy |
| `--text-secondary`   | `rgba(10,10,11,0.65)`            | Body, supporting copy |
| `--text-tertiary`    | `rgba(10,10,11,0.45)`            | Captions, meta, footer |
| `--text-disabled`    | `rgba(10,10,11,0.25)`            | Disabled UI |
| `--border-hairline`  | `rgba(10,10,11,0.06)`            | Subtle dividers |
| `--border-default`   | `rgba(10,10,11,0.10)`            | Card borders |
| `--border-strong`    | `rgba(10,10,11,0.18)`            | Active / focused borders |
| `--state-success`    | `#16A34A`                        | Positive scores |
| `--state-warning`    | `#D97706`                        | Moderate / caution |
| `--state-danger`     | `#DC2626`                        | Critical scores, errors |
| `--state-info`       | `#2563EB`                        | Informational |

**Rules:**
- Purple is **subtle**: buttons, links, focus rings, the logo grip-bar,
  selected/active dots. **Not** a flood colour. No purple gradient
  washes on hero or section backgrounds beyond the `bg-purple-wash`
  utility used at low opacity in narrow areas.
- The buy CTA is the **only** element that uses solid `--accent` for
  fill at full intensity. Everything else uses purple as a hairline
  accent (border, link, dot).
- Sections alternate `--bg-canvas` and `--bg-deep` to create visual
  rhythm. No section relies on photography for contrast.
- The home page may use the `bg-inverted` (near-black) utility **at
  most once** — currently only on the final CTA strip.

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

**Thin and editorial** — the WHOOP-thin look. Display sizes default to
weight `400` at the largest tiers and step up to `500` for headings.
Tracking is gently negative.

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
constant is the **container**:

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

Sharp, editorial. **Drop the shadcn-default rounded-xl-everywhere look.**

| Token         | Value     | Use |
| ------------- | --------- | --- |
| `--radius-sm` | `4px`     | Inputs, chips |
| `--radius-md` | `8px`     | Buttons (default) |
| `--radius-lg` | `12px`    | Cards |
| `--radius-xl` | `20px`    | Hero cards, big media frames |
| `--radius-pill` | `9999px` | Pills, badges |

Shadows are **soft greys** on a white canvas — never tinted, except the
purple-glow CTA hover:

| Token              | Value                                              | Use |
| ------------------ | -------------------------------------------------- | --- |
| `shadow-sm`        | `0 1px 2px rgba(10,10,11,0.04)`                    | Hairline lift |
| `shadow-md`        | `0 4px 16px rgba(10,10,11,0.06)`                   | Card hover |
| `shadow-lg`        | `0 16px 48px rgba(10,10,11,0.10)`                  | Modal, hero card |
| `--shadow-glow`    | `0 0 32px rgba(91,33,182,0.18)`                    | Primary CTA hover only |

---

## 6. Components

### Buttons (`components/ui/button.tsx`)

- `default` — `bg-accent text-white`, the only solid-purple surface anywhere on the site. Used **once per section** at most.
- `outline` — transparent fill, `border-strong`, near-black text. Used for secondary CTAs.
- `ghost` — pure text-link with hover underline.
- All buttons get `--shadow-glow` on hover; press scales 0.98.

### Cards

```
rounded-lg border border-default bg-card p-6 md:p-8
```

No backdrop-blur. No glassmorphism. Cards are solid, slightly raised
panels on the white canvas. Hover lifts to `shadow-md` + faint
`border-strong`.

### Section headers

```
<eyebrow>   ← uppercase, tracked, text-accent (purple) for emphasis
<display-lg>← thin, near-black, slightly tight tracking
<body-lg>   ← optional, secondary text
```

### App-screenshot mockups

Used in `components/marketing/AppShowcase.tsx`. Phone frames are pure
CSS — no real iPhone bezels, no Apple trade dress. Each phone is a
rounded rect with a hair border and a deep gradient "screen" inside.
Three phones per home-page block; on `/product` the spec list lives
elsewhere.

---

## 7. Iconography

Lucide icons (already in `package.json`). Stroke 1.5, size 16/20/24.
**No filled icons.** Tint defaults to `currentColor`. Active / branded
icons use `text-accent`.

---

## 8. Motion

- Default transition: `transition-colors duration-200 ease-out`.
- Larger transforms (hover lifts, slide-ins): `duration-300 ease-out`.
- **No glow pulses, no perpetual motion.** The site should feel still
  and confident.
- `prefers-reduced-motion` honoured by Tailwind defaults; hand-coded
  animations should respect it.

---

## 9. Imagery

**Zero photography in v1.** Per the answers locked in for this revamp:

- Section "imagery slots" are abstract gradient panels (subtle radial
  washes on `--bg-deep`) plus optional noise texture at very low
  opacity. No photography.
- The **app-showcase** section uses pure-CSS phone mockups with
  abstract gradient screens labelled by feature. They are placeholders
  — they get replaced when the design team supplies real screenshots.
- Product placeholders are visible, labelled "Product photography TBD"
  blocks until real photography lands.

---

## 10. What we explicitly do NOT do

- **No dark mode.** `<html>` has no `dark` class. The site is light-only.
- No social-proof / athlete grid section on the home page (Decisions §6).
- No glassmorphism / `backdrop-blur` on cards.
- No glow halos on body text.
- No second display font. No third body font.
- No invented colours in components — extend this file first.
- No purple flood backgrounds. Purple is hairline-accent only.
