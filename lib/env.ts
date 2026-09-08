/**
 * Environment variable schema (Zod-validated at module import).
 *
 * - All NEXT_PUBLIC_* variables are exposed to the client bundle by Next.js.
 *   Anything else is server-only and will be `undefined` if read in a
 *   client component.
 * - Most variables are `.optional()` for v1 because the app must boot before
 *   Brevo, Shopify, and the production domain are set up. Use
 *   `requireEnv()` at the call site of any feature that genuinely needs
 *   the variable, so the failure mode is a clear error in that subsystem
 *   instead of a hard boot crash with no UI.
 *
 * Per Decisions.md §12: the Shopify Storefront token is public-by-design;
 * the Shopify Admin token must NEVER appear in this file. `BREVO_API_KEY`
 * is server-only — it must never gain a `NEXT_PUBLIC_` prefix.
 */

import { z } from "zod";

/**
 * Coerce a hand-entered origin into a URL Zod will accept.
 *
 * The realistic mistake is a missing scheme — `gripfit.com` pasted into
 * the Vercel dashboard — which `z.url()` rejects outright and which then
 * fails the whole production build. Adding the scheme and dropping a
 * trailing slash makes that input work without loosening validation for
 * genuinely malformed values.
 *
 * Exported for `tests/env.test.ts`.
 */
export function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim();

  // A bare host (`gripfit.com`) is the realistic dashboard typo. Anything
  // that already declares a scheme is passed through for `new URL` to judge
  // — prepending to it is how an earlier version turned `http://` into the
  // superficially-valid `https://http:`.
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return candidate; // let Zod report it
    }
    // Re-serialise as the origin: canonical, no trailing slash. A path is
    // dropped deliberately — `sitemap.ts` / `robots.ts` resolve absolute
    // hrefs against this, which discards a base path anyway, so keeping
    // one would only imply support the site does not have.
    return url.origin;
  } catch {
    return candidate; // malformed — let Zod produce the error message
  }
}

const envSchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z
    .string()
    .min(1)
    .optional(),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN: z
    .string()
    .min(1)
    .optional(),

  /** Absolute public origin, e.g. `https://gripfit.com`. Read only from
   *  Server Components / route handlers (`sitemap.ts`, `robots.ts`,
   *  `layout.tsx` metadata) — it has no `NEXT_PUBLIC_` prefix, so it is
   *  `undefined` in the client bundle.
   *
   *  Normalised by {@link normalizeSiteUrl} first, so a bare hostname
   *  typed into the Vercel dashboard still validates. A value that is
   *  still unparseable after that is a hard error rather than a silent
   *  fallback: an empty `sitemap.xml` and a missing `metadataBase` are
   *  invisible in production, whereas a failed deploy is not. */
  SITE_URL: z
    .preprocess(
      (value) =>
        typeof value === "string" ? normalizeSiteUrl(value) : value,
      // http/https only — `z.url()` alone accepts any scheme, including
      // `ftp://`, which is never a valid public site origin.
      z.url({ protocol: /^https?$/ }),
    )
    .optional(),

  SHOPIFY_STOREFRONT_API_VERSION: z.string().default("2025-04"),

  // ── Brevo (transactional email + contacts) ───────────────────────
  /** Brevo v3 API key. Server-only — never expose to the client. */
  BREVO_API_KEY: z.string().min(1).optional(),
  /** Numeric id of the Brevo list captured email-discount signups join. */
  BREVO_WEBSITE_LIST_ID: z.coerce.number().int().positive().optional(),
  /** A sender address verified in Brevo. Unverified senders bounce. */
  BREVO_SENDER_EMAIL: z.string().email().optional(),
  BREVO_SENDER_NAME: z.string().min(1).default("GripFit"),
  /** Optional Brevo template for the discount-code email. When unset the
   *  action sends the built-in inline HTML instead. */
  BREVO_DISCOUNT_TEMPLATE_ID: z.coerce.number().int().positive().optional(),
  /** Inbox the contact form delivers to. */
  CONTACT_EMAIL_TO: z.string().email().optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Treat an empty value as "unset" before validating.
 *
 * A variable that exists but has no value — a blank field in the Vercel
 * dashboard, or a `KEY=` line in a hand-written `.env.local` — arrives as
 * `""`, not `undefined`. An empty string is *present*, so `.optional()`
 * does not apply to it and `.min(1)` / `.url()` / `.coerce.number()` all
 * reject it, crashing the build. Dropping empties preserves the contract
 * in R-014: an unset variable disables its feature, it never breaks boot.
 */
const definedEnv = Object.fromEntries(
  Object.entries(process.env)
    // Trim first: a value pasted into a dashboard field often carries a
    // trailing newline or space, which survives into an API header and
    // gets the request rejected for reasons the log line never explains.
    .map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ])
    .filter(([, value]) => value !== ""),
);

const parsed = envSchema.safeParse(definedEnv);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables — see logs for details.");
}

export const env: Env = parsed.data;

/**
 * Throw a descriptive error if a required env var is missing.
 * Use this at the call site of any feature that needs the variable.
 */
export function requireEnv<K extends keyof Env>(
  key: K,
): NonNullable<Env[K]> {
  const value = env[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `Missing required environment variable: ${String(key)}. ` +
        `Set it in .env.local (development) or your Vercel project settings (production).`,
    );
  }
  return value as NonNullable<Env[K]>;
}

/**
 * Feature flags — true once the matching subsystem has working credentials.
 * Server Actions branch on these so the site stays deployable (and every
 * form stays usable) before the integration is configured.
 */
export const isShopifyConfigured = Boolean(
  env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN &&
    env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN,
);

/** Enough config to send mail through Brevo. */
export const isBrevoConfigured = Boolean(
  env.BREVO_API_KEY && env.BREVO_SENDER_EMAIL,
);

/** Brevo is configured *and* we know where contact-form mail goes. */
export const isContactEmailConfigured = Boolean(
  isBrevoConfigured && env.CONTACT_EMAIL_TO,
);
