/**
 * GripFit theme — the ONE place raw colour values live in TypeScript.
 *
 * `app/globals.css` is the CSS implementation of the same palette (it has
 * to be CSS so Tailwind utilities can consume it). This file exists for
 * the handful of places that cannot read a CSS custom property:
 *
 *   - `<meta name="theme-color">` in `app/layout.tsx`
 *   - inline-styled HTML emails (`email-discount-action.ts`, `contact-action.ts`)
 *   - SVG `stopColor` / `fill` attributes that need a literal
 *
 * If you change a value here, change the matching `:root` token in
 * `app/globals.css` and the table in `design.md`. `tests/theme.test.ts`
 * asserts the two files agree so they cannot drift.
 *
 * Direction (Oct 15, 2026): deep-navy canvas + electric-blue accent, matching
 * the GripFit iOS app. Dark-only. See design.md §1–2.
 */

export const theme = {
  /** Surfaces */
  bg: {
    canvas: "#0a1328",
    elevated: "#101c36",
    raised: "#16264a",
    deep: "#060c1a",
    /** Inverted band — the saturated blue used for the comparison section. */
    ink: "#1437a3",
    inkElevated: "#1a46c4",
  },
  /** Brand accent — the app's electric blue. */
  accent: {
    base: "#3b82f6",
    bright: "#60a5fa",
    deep: "#2563eb",
    soft: "rgba(59, 130, 246, 0.14)",
    glow: "rgba(59, 130, 246, 0.35)",
  },
  /** Promo accent — reserved for the Super Early Bird / discount UI. */
  promo: {
    base: "#34d399",
    bright: "#6ee7b7",
    deep: "#059669",
    soft: "rgba(52, 211, 153, 0.12)",
    foreground: "#06201a",
  },
  text: {
    primary: "#f5f8ff",
    secondary: "rgba(245, 248, 255, 0.70)",
    tertiary: "rgba(245, 248, 255, 0.48)",
    disabled: "rgba(245, 248, 255, 0.28)",
    onInk: "#ffffff",
    onInkSecondary: "rgba(255, 255, 255, 0.76)",
    onInkTertiary: "rgba(255, 255, 255, 0.56)",
  },
  border: {
    hairline: "rgba(255, 255, 255, 0.08)",
    base: "rgba(255, 255, 255, 0.14)",
    strong: "rgba(255, 255, 255, 0.26)",
    onInk: "rgba(255, 255, 255, 0.22)",
  },
  state: {
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    info: "#60a5fa",
  },
} as const;

/** Colour the browser chrome paints around the page (iOS Safari, Android). */
export const themeColor = theme.bg.canvas;

/**
 * Email palette — HTML email can't use CSS variables, so templates read
 * these. Kept light-on-white deliberately: dark-mode email rendering is
 * unreliable across clients, and the brand blue carries the identity.
 */
export const emailTheme = {
  pageBg: "#f3f6fc",
  cardBg: "#ffffff",
  text: "#0a1328",
  textMuted: "#5b6478",
  textFaint: "#8a93a6",
  accent: theme.accent.deep,
  promo: theme.promo.deep,
  codeBg: "#eef3ff",
  rule: "#e3e8f2",
} as const;

export type Theme = typeof theme;
