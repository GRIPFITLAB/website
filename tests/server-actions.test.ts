import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Guard for the `"use server"` contract (Next.js): such a module may export
 * *only* async functions. Exporting a Zod schema or a plain state object
 * from one throws at runtime — `A "use server" file can only export async
 * functions, found object` — and 500s every page rendering that form.
 *
 * This is a source-level check on purpose. `next build` does **not** catch
 * it: the offending version compiled cleanly and prerendered all 13 routes,
 * then failed when the page was actually served. A build-green signal is
 * not evidence for this class of defect, so the invariant is asserted here.
 */
const ACTION_FILES = [
  "components/forms/contact-action.ts",
  "components/marketing/email-discount-action.ts",
];

const root = join(__dirname, "..");

describe('"use server" modules', () => {
  it.each(ACTION_FILES)("%s exports only async functions", (relative) => {
    const source = readFileSync(join(root, relative), "utf8");

    expect(source.startsWith('"use server"')).toBe(true);

    // Every `export` at the start of a line, minus type-only exports, which
    // are erased before the directive is enforced.
    const exports = [...source.matchAll(/^export (.+)$/gm)]
      .map((match) => match[1] ?? "")
      .filter((decl) => !decl.startsWith("type "));

    expect(exports.length).toBeGreaterThan(0);
    for (const decl of exports) {
      expect(
        decl.startsWith("async function"),
        `"${relative}" exports a non-async-function: export ${decl}`,
      ).toBe(true);
    }
  });
});
