import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit-test config (PRD R-030).
 *
 * Scope is deliberately narrow: pure logic — pricing math, config
 * invariants, copy/number agreement, discount-code generation, Server
 * Action validation and branching, and route-map integrity. Rendering is
 * covered by `npm run build`, which fails if any page throws while
 * prerendering.
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
    },
  },
});
