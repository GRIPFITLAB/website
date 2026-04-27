import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";
import { allRouteHrefs } from "@/lib/routes";

/**
 * Auto-generated sitemap. Pulls the canonical route list from
 * `lib/routes.ts` so adding a route registers it here too.
 *
 * Returns an empty list when `NEXT_PUBLIC_SITE_URL` is unset (e.g. on
 * preview deploys without a custom domain) — Next will then serve a
 * sitemap with no entries rather than throwing during prerender.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  if (!base) return [];

  const lastModified = new Date();

  return allRouteHrefs.map((href) => ({
    url: new URL(href, base).toString(),
    lastModified,
    changeFrequency: href === "/" ? "weekly" : "monthly",
    priority: href === "/" ? 1 : 0.7,
  }));
}
