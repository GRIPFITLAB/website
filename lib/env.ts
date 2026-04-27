/**
 * Environment variable schema (Zod-validated at module import).
 *
 * - All NEXT_PUBLIC_* variables are exposed to the client bundle by Next.js.
 *   Anything else is server-only and will be `undefined` if read in a
 *   client component.
 * - Most variables are `.optional()` for v1 because the app must boot before
 *   Shopify, Resend, and the production domain are set up. Use
 *   `requireEnv()` at the call site of any feature that genuinely needs
 *   the variable, so the failure mode is a clear error in that subsystem
 *   instead of a hard boot crash with no UI.
 *
 * Per Decisions.md §12: the Shopify Storefront token is public-by-design;
 * the Shopify Admin token must NEVER appear in this file.
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
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_EMAIL_TO: z.string().email().optional(),
  CONTACT_EMAIL_FROM: z.string().email().optional(),

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
 * Pages should branch on these to render fallback UI when an integration
 * isn't configured (e.g. Shopify before the store exists, Resend before
 * the contact form is wired in Step 9).
 */
export const isShopifyConfigured = Boolean(
  env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN &&
    env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN,
);

export const isResendConfigured = Boolean(
  env.RESEND_API_KEY && env.CONTACT_EMAIL_TO && env.CONTACT_EMAIL_FROM,
);
