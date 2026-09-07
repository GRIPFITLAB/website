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

const envSchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z
    .string()
    .min(1)
    .optional(),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN: z
    .string()
    .min(1)
    .optional(),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
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

const parsed = envSchema.safeParse(process.env);

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
