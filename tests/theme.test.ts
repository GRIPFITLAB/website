import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { theme, themeColor } from "@/lib/theme";

/**
 * `lib/theme.ts` ↔ `app/globals.css` agreement (design.md §2).
 *
 * The palette is declared twice on purpose — once as CSS custom properties
 * for Tailwind, once as TS literals for emails / meta tags / SVG. This test
 * is what stops the two copies from drifting apart.
 */

const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8");

/** `--name: value;` inside `:root`, normalised for comparison. */
function cssVar(name: string): string | null {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m?.[1] ? normalise(m[1]) : null;
}

function normalise(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    // 0.70 → 0.7 so numeric alphas compare equal.
    .replace(/(\d)\.(\d*?)0+(?=[,)])/g, (_, a: string, b: string) => (b ? `${a}.${b}` : a));
}

/** TS token path → CSS custom property name. */
const pairs: ReadonlyArray<[string, string]> = [
  ["bg-canvas", theme.bg.canvas],
  ["bg-elevated", theme.bg.elevated],
  ["bg-raised", theme.bg.raised],
  ["bg-deep", theme.bg.deep],
  ["bg-ink", theme.bg.ink],
  ["bg-ink-elevated", theme.bg.inkElevated],
  ["accent", theme.accent.base],
  ["accent-bright", theme.accent.bright],
  ["accent-deep", theme.accent.deep],
  ["accent-soft", theme.accent.soft],
  ["accent-glow", theme.accent.glow],
  ["promo", theme.promo.base],
  ["promo-bright", theme.promo.bright],
  ["promo-deep", theme.promo.deep],
  ["promo-soft", theme.promo.soft],
  ["promo-foreground", theme.promo.foreground],
  ["text-primary", theme.text.primary],
  ["text-secondary", theme.text.secondary],
  ["text-tertiary", theme.text.tertiary],
  ["text-disabled", theme.text.disabled],
  ["text-on-ink", theme.text.onInk],
  ["text-on-ink-secondary", theme.text.onInkSecondary],
  ["text-on-ink-tertiary", theme.text.onInkTertiary],
  ["border-hairline", theme.border.hairline],
  ["border-default", theme.border.base],
  ["border-strong", theme.border.strong],
  ["border-on-ink", theme.border.onInk],
  ["state-success", theme.state.success],
  ["state-warning", theme.state.warning],
  ["state-danger", theme.state.danger],
  ["state-info", theme.state.info],
];

describe("theme tokens", () => {
  it.each(pairs)("--%s matches lib/theme.ts", (name, tsValue) => {
    expect(cssVar(name)).toBe(normalise(tsValue));
  });

  it("theme-color is the canvas", () => {
    expect(themeColor).toBe(theme.bg.canvas);
  });

  it("the site is dark-only", () => {
    expect(css).toMatch(/color-scheme:\s*dark/);
    expect(css).not.toMatch(/\.dark\s*\{/);
  });

  it("no legacy warm-cream values survive", () => {
    for (const legacy of ["#f3ece2", "#1c1a17", "#b54a30", "#faf6f0"]) {
      expect(css.toLowerCase()).not.toContain(legacy);
    }
  });
});
