/**
 * Per-visitor price-arm assignment.
 *
 * On a visitor's first request the proxy draws one of the experiment's
 * arms uniformly at random, mints a visitor id, and writes both into a
 * **signed** first-party cookie. The signature (HMAC-SHA256, Web Crypto)
 * means the browser can carry the assignment but cannot change it — a
 * visitor who edits the cookie to a cheaper arm simply gets re-assigned.
 * The cookie holds only the arm id; prices are looked up server-side.
 *
 * Only Web Crypto is used so this module runs in the proxy, in Server
 * Components / Actions, and under Vitest without polyfills.
 *
 * The cookie is the source of truth for *display*. The server-side record
 * (`store.ts`) is the source of truth for *analysis* — it's what the
 * demand curve is computed from.
 */

import { priceExperiment } from "@/lib/admin";
import { isValidArmId } from "@/lib/pricing";

export interface Assignment {
  visitorId: string;
  experimentId: string;
  /** The price arm this visitor sees (`priceExperiment.arms[].id`). */
  armId: number;
}

const VISITOR_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPERIMENT_ID_RE = /^[A-Za-z0-9-]{1,64}$/;

/** Fallback so local dev works without a secret. Never acceptable in prod. */
export const INSECURE_DEV_SECRET = "gripfit-dev-insecure-secret";

/**
 * Resolve the signing secret. Reads `process.env` directly (not `lib/env`)
 * so the proxy can import this without pulling the Zod schema in.
 */
export function assignmentSecret(): string {
  const secret = process.env.EXPERIMENT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[experiment] EXPERIMENT_SECRET is unset — price cookies are signed with a public dev key and can be forged.",
    );
  }
  return INSECURE_DEV_SECRET;
}

/** Uniform random integer in [min, max]. */
export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  const span = hi - lo + 1;
  // Rejection sampling over a 32-bit draw keeps the distribution uniform.
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / span) * span;
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0] as number;
  } while (x >= limit);
  return lo + (x % span);
}

/** One of the configured arms, each with probability 1/n. */
export function randomArmId(): number {
  const arms = priceExperiment.arms;
  return arms[randomInt(0, arms.length - 1)]!.id;
}

export function createAssignment(): Assignment {
  return {
    visitorId: crypto.randomUUID(),
    experimentId: priceExperiment.id,
    armId: randomArmId(),
  };
}

/* ── Signing ─────────────────────────────────────────────────────────── */

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  // 22 base64url chars = 132 bits — plenty for a cookie tamper check.
  return toBase64Url(sig).slice(0, 22);
}

function payloadOf(a: Assignment): string {
  return `${a.visitorId}.${a.experimentId}.${a.armId}`;
}

/** Serialise to the cookie / header value. */
export async function encodeAssignment(
  a: Assignment,
  secret: string = assignmentSecret(),
): Promise<string> {
  const payload = payloadOf(a);
  return `${payload}.${await hmac(secret, payload)}`;
}

/**
 * Parse and verify. Returns `null` for anything malformed, forged, from a
 * different experiment, or naming an arm that doesn't exist — all of
 * which mean "assign afresh".
 */
export async function decodeAssignment(
  value: string | undefined | null,
  secret: string = assignmentSecret(),
): Promise<Assignment | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const [visitorId, experimentId, armRaw, sig] = parts as [string, string, string, string];
  if (!VISITOR_ID_RE.test(visitorId) || !EXPERIMENT_ID_RE.test(experimentId)) return null;
  if (!/^\d{1,3}$/.test(armRaw)) return null;
  const armId = Number(armRaw);
  if (experimentId !== priceExperiment.id) return null;
  if (!isValidArmId(armId)) return null;

  const expected = await hmac(secret, `${visitorId}.${experimentId}.${armRaw}`);
  if (!timingSafeEqual(expected, sig)) return null;

  return { visitorId, experimentId, armId };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Cookie attributes shared by the proxy. */
export function assignmentCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: priceExperiment.cookieDays * 24 * 60 * 60,
  };
}
