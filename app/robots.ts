import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

/**
 * `/robots.txt` generator. Allows everything in production; the only
 * dynamic bit is the absolute Sitemap URL, which Next.js requires.
 *
 * On preview/development without `NEXT_PUBLIC_SITE_URL`, the sitemap
 * line is omitted.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url;

  return {
    rules: { userAgent: "*", allow: "/" },
    ...(base ? { sitemap: new URL("/sitemap.xml", base).toString() } : {}),
  };
}
