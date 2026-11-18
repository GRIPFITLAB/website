/**
 * `/admin` session tokens — pure Web Crypto, so the proxy, Server
 * Components, and Vitest can all use it.
 *
 * Token: `v1.<expiresAtSeconds>.<hmac>`. The HMAC key is derived from the
 * server secret *and* the admin credentials, so rotating `ADMIN_PASSCODE`
 * (or `ADMIN_EMAIL`) invalidates every outstanding session.
 */

export const ADMIN_SESSION_COOKIE = "gf_admin";
/** Request header the proxy sets on `/admin` requests so the root layout
 *  can render the bare dashboard shell instead of the marketing chrome. */
export const ADMIN_SURFACE_HEADER = "x-gf-surface";
export const ADMIN_PATH = "/admin";
/** Twelve hours: a working day, then sign in again. */
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

const VERSION = "v1";

export interface SessionKeyParts {
  secret: string;
  email: string;
  passcode: string;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(key: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload)));
}

function keyOf({ secret, email, passcode }: SessionKeyParts): string {
  return `${secret}\u0000${email.trim().toLowerCase()}\u0000${passcode}`;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(
  parts: SessionKeyParts,
  nowMs: number = Date.now(),
): Promise<string> {
  const exp = Math.floor(nowMs / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = `${VERSION}.${exp}`;
  return `${payload}.${await hmac(keyOf(parts), payload)}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
  parts: SessionKeyParts,
  nowMs: number = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const segments = token.split(".");
  if (segments.length !== 3) return false;
  const [version, expRaw, sig] = segments as [string, string, string];
  if (version !== VERSION || !/^\d{1,12}$/.test(expRaw)) return false;
  if (Number(expRaw) * 1000 <= nowMs) return false;
  const expected = await hmac(keyOf(parts), `${version}.${expRaw}`);
  return timingSafeEqual(expected, sig);
}

async function digest(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toBase64Url(buf);
}

/**
 * Compare submitted credentials against the configured pair without
 * leaking either value's length or prefix through timing. Email is
 * case-insensitive; the passcode is exact. Both are always checked.
 */
export async function credentialsMatch(
  submitted: { email: string; passcode: string },
  expected: { email: string; passcode: string },
): Promise<boolean> {
  const [se, ee, sp, ep] = await Promise.all([
    digest(submitted.email.trim().toLowerCase()),
    digest(expected.email.trim().toLowerCase()),
    digest(submitted.passcode),
    digest(expected.passcode),
  ]);
  const emailOk = timingSafeEqual(se, ee);
  const passOk = timingSafeEqual(sp, ep);
  return emailOk && passOk;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}
