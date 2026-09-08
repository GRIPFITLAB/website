import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit-test config (PRD R-030).
 *
 * Scope is deliberately narrow: pure logic — pricing math, config
 * invariants, copy/number agreement, discount-code generation, Server
 * Action validation and branching, and route-map integrity. Page rendering
 * is covered by `tests/render.test.ts` — `npm run build` is NOT sufficient,
 * as a `"use server"` export bug once compiled and prerendered cleanly while
 * 500ing every form page at request time.
 *
 * `environment: "node"` because nothing here touches the DOM.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // See tests/stubs/server-only.ts for why.
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
});
