import { beforeEach, describe, expect, it } from "vitest";

import { __resetRateLimits, checkRateLimit } from "@/lib/rate-limit";

/**
 * Best-effort in-process limiter guarding the public Server Actions.
 * Deliberately not distributed — see the module docblock.
 */
beforeEach(() => {
  __resetRateLimits();
});

const OPTS = { limit: 3, windowMs: 60_000 };

describe("checkRateLimit", () => {
  it("allows up to the limit, then refuses", () => {
    expect(checkRateLimit("a", OPTS).ok).toBe(true);
    expect(checkRateLimit("a", OPTS).ok).toBe(true);
    expect(checkRateLimit("a", OPTS).ok).toBe(true);

    const refused = checkRateLimit("a", OPTS);
    expect(refused.ok).toBe(false);
    expect(refused.retryAfterMs).toBeGreaterThan(0);
    expect(refused.retryAfterMs).toBeLessThanOrEqual(OPTS.windowMs);
  });

  it("tracks each key independently", () => {
    for (let i = 0; i < OPTS.limit; i += 1) checkRateLimit("a", OPTS);

    expect(checkRateLimit("a", OPTS).ok).toBe(false);
    expect(checkRateLimit("b", OPTS).ok).toBe(true);
  });

  it("lets a caller through again once the window expires", () => {
    const brief = { limit: 1, windowMs: 5 };

    const openedAt = Date.now();
    expect(checkRateLimit("c", brief).ok).toBe(true);
    expect(checkRateLimit("c", brief).ok).toBe(false);

    // The limiter reads Date.now() directly, so spin rather than fake timers.
    // Wait from the moment the window opened, plus a margin: the window's
    // resetAt is set inside the first call, which is at or after `openedAt`.
    const clearAt = openedAt + brief.windowMs + 5;
    while (Date.now() < clearAt) {
      /* spin */
    }

    expect(checkRateLimit("c", brief).ok).toBe(true);
  });

  it("reports zero retry delay while still under the limit", () => {
    expect(checkRateLimit("d", OPTS).retryAfterMs).toBe(0);
  });
});
