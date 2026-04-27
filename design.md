# GripFit — Visual Design System

This file is the single source of truth for the GripFit web brand. It
replaces the old `DESIGN_SYSTEM/` folder (deleted) and the placeholder
"Ethereal Tech" identity that came with it. Tokens live in
[`app/globals.css`](./app/globals.css); this doc explains intent and
usage.

If a token isn't here, don't invent one in a component. Add it here
first.

---

## 1. Brand at a glance

GripFit is a precision hand dynamometer for athletes. The visual brand
takes its cues from performance-wearable sites (WHOOP-style) but uses
**warm amber** — not red — as its signature, so it can't be confused
with the medical / blood / heart-rate space WHOOP occupies.

**Mood:** editorial, dark, cinematic. Bold display type. Generous
negative space. No glassmorphism, no glow halos, no playful curves.

**Voice:** declarative, second-person, no jargon, no emoji, numbers are
prominent, sentence case for everything except `eyebrows`/labels which
are UPPERCASE-TRACKED.

---

## 2. Color tokens

All values are wired into Tailwind through `@theme inline` in
`app/globals.css` and exposed as CSS custom properties under `.dark`
(the only theme — the site is dark-only, `<html>` always carries the
`dark` class).

| Token                | Hex / RGBA                       | Use |
| -------------------- | -------------------------------- | --- |
| `--bg-canvas`        | `#0A0A0B`                        | Page background |
| `--bg-elevated`      | `#131316`                        | Cards, panels (tier 1) |
| `--bg-raised`        | `#1C1C20`                        | Raised surfaces, popovers (tier 2) |
| `--bg-deep`          | `#050506`                        | Hero / full-bleed dark wells |
| `--accent`           | `#FF6A00`                        | Brand accent — buy CTAs, links, focus |
| `--accent-bright`    | `#FF8533`                        | Hover / highlighted state |
| `--accent-deep`      | `#CC5500`                        | Pressed / active state |
| `--accent-soft`      | `rgba(255,106,0,0.10)`           | Background tints, chips |
| `--accent-glow`      | `rgba(255,106,0,0.30)`           | Soft halo on primary CTA hover |
| `--text-primary`     | `#FFFFFF`                        | Headlines, primary copy |
| `--text-secondary`   | `rgba(255,255,255,0.62)`         | Body, supporting copy |
| `--text-tertiary`    | `rgba(255,255,255,0.42)`         | Captions, meta, footer |
| `--text-disabled`    | `rgba(255,255,255,0.20)`         | Disabled UI |
| `--border-hairline`  | `rgba(255,255,255,0.06)`         | Subtle dividers |
| `--border-default`   | `rgba(255,255,255,0.10)`         | Card borders |
| `--border-strong`    | `rgba(255,255,255,0.18)`         | Active / focused borders |
| `--state-success`    | `#4ADE80`                        | Positive scores |
| `--state-warning`    | `#FBBF24`                        | Moderate / caution |
| `--state-danger`     | `#F87171`                        | Critical scores, errors |
| `--state-info`       | `#60A5FA`                        | Informational |

**Rules:**
- The buy CTA is the **only** element that uses solid `--accent` for
  fill. Everything else uses amber as a hairline accent (border, link,
  dot).
- No element should ever sit on `var(--bg-canvas)` without a defined
  surface above or below it. The page is composed of **stacked dark
  bands**, not a single floor.

---

## 3. Typography

Two self-hosted variable fonts. **No third font.**

| Family   | Where it ships                                     | Use              |
| -------- | -------------------------------------------------- | ---------------- |
| `Geist`  | `/public/fonts/Geist-Variable.woff2` (100–900)     | All display copy |
| `Inter`  | `/public/fonts/Inter-VariableFont_opsz_wght.ttf`   | All body copy    |
| `Inter`  | `/public/fonts/Inter-Italic-VariableFont_opsz_wght.ttf` | Body italics |

`@font-face` rules live in `app/globals.css`. Tailwind exposes them as
`font-display` and `font-sans`. Don't reference these family names
anywhere else.

### Display scale

Heavy weights and tight tracking — that's the WHOOP-editorial feel.
All values are wrapped in `clamp()` and resolve through Tailwind utility
classes (`text-display-xl` etc.) defined in `globals.css`.

| Token            | clamp                                | Weight | Tracking | Use |
| ---------------- | ------------------------------------ | ------ | -------- | --- |
| `display-3xl`    | `clamp(80px, 12vw, 200px)`           | 800    | -0.045em | Hero only |
| `display-2xl`    | `clamp(56px, 8vw, 128px)`            | 800    | -0.045em | Alternate hero / section opener |
| `display-xl`     | `clamp(40px, 5vw, 80px)`             | 700    | -0.035em | Section H1 |
| `display-lg`     | `clamp(32px, 4vw, 56px)`             | 700    | -0.03em  | Section H2 |
| `display-md`     | `clamp(24px, 2.5vw, 36px)`           | 600    | -0.025em | Card headline |
| `display-sm`     | `20px`                               | 600    | -0.02em  | Sub-heading |

### Body scale

| Token       | Size / line-height | Use |
| ----------- | ------------------ | --- |
| `body-lg`   | `17px / 1.65`      | Hero subtitle, intro paragraphs |
| `body`      | `15px / 1.65`      | Default paragraph |
| `body-sm`   | `13px / 1.55`      | Card meta, footnotes |
| `eyebrow`   | `11px / 1` upper / tracking `0.16em` weight `600` | Section labels, kicker text |
| `mono-data` | `13px / 1.4` Geist mono fallback stack, `tabular-nums` | Stats, numeric displays |

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

Shadows favour **flat black**, not violet glow:

| Token              | Value                                              | Use |
| ------------------ | -------------------------------------------------- | --- |
| `--shadow-sm`      | `0 1px 2px rgba(0,0,0,0.4)`                        | Hairline lift |
| `--shadow-md`      | `0 4px 16px rgba(0,0,0,0.45)`                      | Card hover |
| `--shadow-lg`      | `0 16px 48px rgba(0,0,0,0.55)`                     | Modal, hero card |
| `--shadow-glow`    | `0 0 32px rgba(255,106,0,0.25)`                    | Primary CTA hover only |

---

## 6. Components

### Buttons (`components/ui/button.tsx`)

- `default` — `bg-accent text-black`, the only solid-amber surface anywhere on the site. Used **once per section** at most.
- `outline` — transparent fill, `border-strong`, white text. Used for secondary CTAs.
- `ghost` — pure text-link with hover underline.
- All buttons get `--shadow-glow` on hover; press scales 0.98.

### Cards

```
rounded-lg border border-default bg-elevated p-6 md:p-8
```

No backdrop-blur. No glassmorphism. Cards are solid, slightly raised
panels. Hover lifts to `bg-raised`.

### Section headers

```
<eyebrow>   ← uppercase, tracked, amber-tinted
<display-lg>← bold, white, tight tracking
<body-lg>   ← optional, secondary text
```

---

## 7. Iconography

Lucide icons (already in `package.json`). Stroke 1.5, size 16/20/24.
**No filled icons.** Tint defaults to `currentColor`.

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

**Zero photography.** Per the answers locked in for this revamp:

- Hero and section "imagery slots" are abstract dark gradient meshes
  (radial gradients on `--bg-deep` with amber bias) plus optional noise
  texture.
- Product placeholders are visible, labelled "Product photography TBD"
  blocks until real photography lands.
- The iOS app screenshots in `iOS_App_Images/` are reference for app
  screens, not for web hero imagery.

---

## 10. What we explicitly do NOT do

- No light mode. `<html>` always has `.dark`.
- No social-proof / athlete grid section on the home page (Decisions §6).
- No glassmorphism / `backdrop-blur` on cards.
- No glow halos on body text.
- No second display font. No third body font.
- No invented colours in components — extend this file first.
