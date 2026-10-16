/**
 * Ad attribution captured from the landing URL.
 *
 * Meta can't tell us who a visitor is, but it *can* stamp the click URL.
 * Configure the ad's "URL parameters" in Ads Manager as:
 *
 *   utm_source=meta&utm_medium=paid_social
 *   &utm_campaign={{campaign.name}}&utm_content={{ad.name}}
 *   &campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}
 *   &placement={{placement}}
 *
 * Meta appends `fbclid` itself. Everything below is first-touch: once a
 * visitor has an attribution cookie it is never overwritten, so the
 * audience that *brought* them is what a later signup is credited to.
 *
 * Pure functions — used by the proxy, Server Actions, and tests.
 */

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Meta ids from the URL-parameter macros above. */
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  placement?: string;
  /** Meta click id, appended automatically to ad clicks. */
  fbclid?: string;
  /** Path (with query stripped) the visitor first landed on. */
  landing_path?: string;
  /** `document.referrer` equivalent, host only. */
  referrer_host?: string;
  /** ISO timestamp of first touch. */
  first_seen_at?: string;
}

const PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "campaign_id",
  "adset_id",
  "ad_id",
  "placement",
  "fbclid",
] as const satisfies ReadonlyArray<keyof Attribution>;

const MAX_LEN = 200;

function clean(v: string | null): string | undefined {
  if (!v) return undefined;
  const t = v.trim().slice(0, MAX_LEN);
  return t.length > 0 ? t : undefined;
}

/** True when the URL carries anything worth attributing. */
export function hasAttributionParams(url: URL): boolean {
  return PARAM_KEYS.some((k) => clean(url.searchParams.get(k)) !== undefined);
}

export function parseAttribution(
  url: URL,
  referrer: string | null,
  now: Date = new Date(),
): Attribution {
  const out: Attribution = {};
  for (const key of PARAM_KEYS) {
    const v = clean(url.searchParams.get(key));
    if (v !== undefined) out[key] = v;
  }
  out.landing_path = url.pathname.slice(0, MAX_LEN);
  if (referrer) {
    try {
      const host = new URL(referrer).host;
      if (host && host !== url.host) out.referrer_host = host.slice(0, MAX_LEN);
    } catch {
      // ignore malformed referrer
    }
  }
  out.first_seen_at = now.toISOString();
  return out;
}

/* ── Cookie encoding (base64url JSON) ────────────────────────────────── */

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string | null {
  try {
    const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeAttribution(a: Attribution): string {
  return b64urlEncode(JSON.stringify(a));
}

export function decodeAttribution(value: string | undefined | null): Attribution | null {
  if (!value) return null;
  const json = b64urlDecode(value);
  if (!json) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const out: Attribution = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && v.length <= MAX_LEN) {
        (out as Record<string, string>)[k] = v;
      }
    }
    return out;
  } catch {
    return null;
  }
}

/** One year — attribution should outlive the price cookie. */
export function attributionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  };
}
