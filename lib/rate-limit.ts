import "server-only";

import { headers } from "next/headers";

/**
 * Best-effort, in-process rate limiting for the public Server Actions.
 *
 * **What this is not:** a distributed limiter. State lives in the memory of
 * one serverless instance, so it resets on cold start and is not shared
 * between concurrent instances. A determined attacker with many source IPs
 * is unaffected.
 *
 * It is still worth having. The realistic abuse here is one script hammering
 * the email form from one address to mint codes or burn Brevo quota, and a
 * per-IP window stops exactly that at zero cost. The alternative — Vercel KV
 * or Upstash — means a paid dependency and a second datastore, which EDD
 * D-004 rejected for this site. Revisit if the campaign draws real traffic.
 */

interface Window {
  count: number;
  /** Epoch ms when the current window expires. */
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Cap the map so a flood of unique keys can't grow it without bound. */
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitOptions {
  /** Requests permitted per window. */
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Milliseconds until the caller may retry. Zero when `ok`. */
  retryAfterMs: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) pruneExpired(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

function pruneExpired(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
  // Still full of live windows — drop the oldest to bound memory.
  if (windows.size >= MAX_TRACKED_KEYS) {
    const oldest = [...windows.entries()].sort(
      (a, b) => a[1].resetAt - b[1].resetAt,
    );
    for (const [key] of oldest.slice(0, Math.floor(MAX_TRACKED_KEYS / 2))) {
      windows.delete(key);
    }
  }
}

/**
 * Best-guess client identifier for a Server Action.
 *
 * `x-forwarded-for` is set by Vercel's proxy; the left-most entry is the
 * client. Falls back to a single shared bucket when no header is present
 * (local dev), which is deliberately conservative.
 */
export async function clientKey(prefix: string): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return `${prefix}:${ip && ip.length > 0 ? ip : "unknown"}`;
}

/** Exposed for tests — resets the module-level state between cases. */
export function __resetRateLimits(): void {
  windows.clear();
}
