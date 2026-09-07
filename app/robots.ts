import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

/**
 * `/robots.txt` generator.
 *
 * Production allows everything. **Every other environment disallows
 * everything** (Decisions.md §11) — Vercel preview deployments get real,
 * crawlable URLs, and without this they compete with production in
 * search results and leak unreleased copy.
 *
 * `VERCEL_ENV` is `production` only on the production deployment;
 * previews get `preview` and local dev has it unset.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url;
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    ...(base ? { sitemap: new URL("/sitemap.xml", base).toString() } : {}),
  };
}
