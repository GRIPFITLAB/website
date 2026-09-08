/**
 * Stub for the `server-only` package.
 *
 * `server-only` throws on import outside a React Server Component, which
 * makes any module that guards itself with it untestable under Vitest. The
 * guard exists to stop server modules being pulled into a client bundle —
 * a build-time concern that `next build` enforces for real. Aliasing it to
 * nothing here lets the unit tests import those modules directly.
 */
export {};
