# Ethereal Tech Design System

## Overview

Ethereal Tech is a visionary technology brand focused on human readiness and biometric performance. The product appears to be a health/performance tracking application that displays biometric data, readiness scores, and metrics in an elite, sci-fi aesthetic. The brand positions itself at the intersection of human biology and advanced technology.

**Tagline:** *The future of human readiness.*

## Sources

This design system was generated from brand guidelines text provided directly. No Figma files or codebase were attached. All design decisions are derived from the written brand guidelines.

---

## Content Fundamentals

### Voice & Tone
- **Visionary** — speaks to what's possible, not just what is
- **Smooth** — no friction, no jargon overload; flows naturally
- **Elite** — aspirational, premium; speaks to peak performers
- **Transcendent** — beyond the ordinary; the brand elevates the user

### Copy Style
- **Sentence case** for most UI labels and headings (not ALL CAPS or Title Case unless decorative)
- **Direct, second-person** ("your readiness score", "your neural drive") — the product is personal
- **Short and declarative** — metrics and data labels are terse; no filler words
- **No emoji** in UI; brand is too polished and clinical for emoji
- **Numbers are prominent** — readiness scores, metrics, biometric values are the hero content
- **Action language** on CTAs: "Track readiness", "View breakdown", "Optimize now"

### Example copy patterns
- Metric labels: "Neural Drive", "Recovery Index", "Readiness Score"
- Empty states: "No data yet. Begin your session."
- Onboarding: "Connect your body to the future."
- Notifications: "Your readiness is peak. Act now."

---

## Visual Foundations

### Color System
- **Deep Amethyst `#0D0914`** — primary background; the void from which everything emerges. Used on app bg, full-bleed screens, and any element that needs to recede.
- **Nebula Purple `#1A1625`** — secondary background; used for cards, modals, data panels, sidebars. Slightly lifted off the base.
- **Neural Violet `#B57BFF`** — the brand accent; used for readiness scores, active/hover states, primary CTAs, highlighted metrics, progress rings. High-contrast on dark backgrounds.
- **Supporting neutrals**: White at full and reduced opacity (text hierarchy); violet-tinted grays for secondary text and muted UI.
- **Semantic colors**: Green (`#4ADE80`) for positive/good; Amber (`#FBBF24`) for warning/moderate; Red (`#F87171`) for critical/low.

### Typography
- **Heading / Display: Poppins** — geometric, modern, slightly rounded. Used for all primary metric displays, section titles, score numbers.
- **Body / Data: Inter** — neutral, clinical, highly legible at small sizes. Used for data labels, granular biometric readouts, body copy.
- **Scale**: Large numbers (64–96px) for hero metrics; 32–48px for card headers; 16–20px for body; 12–14px for labels/captions.

### Backgrounds & Surfaces
- **Full-bleed dark** backgrounds — the default. No light mode.
- **Subtle grain texture** overlaid at low opacity on backgrounds for depth (not flat).
- **Glassmorphism** on cards: `backdrop-filter: blur`, semi-transparent with border at 10–15% white opacity.
- **No photography** indicated — the brand is abstract and data-driven.
- **Gradient meshes** — used for logo and accent glow effects; violet-to-purple ambient glows on key elements.

### Animation
- **Smooth, fluid** — no bouncy or playful easing. Prefer `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out).
- **Fades + upward translate** for element entrances (subtle: 8–12px Y).
- **Glow pulses** on active metrics (box-shadow or filter: drop-shadow animation).
- **No abrupt snaps** — everything transitions; duration range 150–400ms.

### Hover & Press States
- **Hover**: lighten the element, increase glow intensity; interactive elements gain a subtle `#B57BFF` border or glow.
- **Press / Active**: slight scale down (`scale(0.97)`), brightness reduction.
- **Focus**: 2px violet ring (`#B57BFF` at 60% opacity) — always present for a11y.

### Cards
- Background: `#1A1625` (Nebula Purple)
- Border: `1px solid rgba(255,255,255,0.08)`
- Border-radius: `16px` (large rounding throughout; nothing feels sharp)
- Shadow: `0 4px 24px rgba(181,123,255,0.08)` — a faint violet glow
- Optional: glassmorphism variant with `backdrop-filter: blur(20px)` and `background: rgba(26,22,37,0.7)`

### Spacing System
- Base unit: `4px`
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Component internal padding: 16–24px
- Card gap: 16px
- Section gap: 48–64px

### Borders & Radii
- Small elements (badges, chips): `8px`
- Cards, modals: `16px`
- Buttons: `12px`
- Pills / score rings: `9999px` (fully rounded)

### Shadows & Elevation
- **Base shadow**: subtle violet tint, low spread
- **Raised card**: `0 8px 32px rgba(181,123,255,0.12)`
- **Modal / overlay**: `0 24px 64px rgba(13,9,20,0.8)`
- **Glow effect** (for accent elements): `0 0 24px rgba(181,123,255,0.4)`

### Iconography (see ICONOGRAPHY section)
- Lucide icons (stroke-based, 1.5px weight); clean and geometric.
- No icon fills; all outline style.
- Icon size: 16px (inline), 20px (standard), 24px (prominent).

### Imagery
- Abstract, generative, sci-fi textures and mesh gradients
- Cool-to-neutral color grading; no warm tones
- No stock photography in UI; data visualization is the imagery
- Subtle background grain/noise at ~3% opacity for texture

---

## Iconography

Icons are served from the **Lucide** icon library (CDN). Lucide is a stroke-based, geometric icon set that aligns with the clean, precise aesthetic of the brand. All icons use:
- `stroke-width: 1.5`
- Color: inherit (white at various opacities based on hierarchy)
- Sizes: 16 / 20 / 24px

No custom icon font or sprite sheet was provided. No emoji are used in UI. Unicode characters are not used as icons.

**CDN**: `https://unpkg.com/lucide@latest/dist/umd/lucide.js`

---

## File Index

```
README.md                        ← You are here
SKILL.md                         ← Agent skill definition
colors_and_type.css              ← CSS design tokens (colors + typography)
assets/
  logo.svg                       ← Ethereal Tech wordmark/logo
  logo-mark.svg                  ← Icon-only logo mark
  noise-texture.svg              ← Subtle background grain texture
preview/
  colors-primary.html            ← Primary color swatches
  colors-semantic.html           ← Semantic/state colors
  type-scale.html                ← Typography scale specimen
  type-specimens.html            ← Font pairing in context
  spacing-tokens.html            ← Spacing & radius tokens
  shadows-elevation.html         ← Shadow & elevation system
  components-buttons.html        ← Button variants
  components-inputs.html         ← Form inputs
  components-cards.html          ← Card variants
  components-badges.html         ← Badges & chips
  components-metrics.html        ← Metric display components
ui_kits/
  app/
    README.md                    ← App UI kit overview
    index.html                   ← Interactive app prototype
    AppShell.jsx                 ← Layout shell (sidebar + topbar)
    DashboardScreen.jsx          ← Main readiness dashboard
    MetricCard.jsx               ← Individual metric card component
    ScoreRing.jsx                ← Circular readiness score
    DataPanel.jsx                ← Detailed biometric data panel
```
