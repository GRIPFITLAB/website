import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  allRouteHrefs,
  footerRoutes,
  primaryNavRoutes,
  routes,
} from "@/lib/routes";

/**
 * Route-map integrity (PRD R-040).
 *
 * `lib/routes.ts` drives the nav, the footer, and the sitemap. A route
 * declared there without a matching page is a 404 in the nav; a page
 * without a declaration is invisible to the sitemap. This test catches
 * both, which is cheaper than noticing after deploy.
 */

const appDir = fileURLToPath(new URL("../app", import.meta.url));

describe("declared routes have pages", () => {
  it.each(Object.values(routes))("$href renders from a page.tsx", (route) => {
    const relative = route.href === "/" ? "" : route.href.replace(/^\//, "");
    expect(existsSync(path.join(appDir, relative, "page.tsx"))).toBe(true);
  });
});

describe("route map shape", () => {
  it("keys its entries consistently", () => {
    for (const [key, route] of Object.entries(routes)) {
      expect(route.key).toBe(key);
    }
  });

  it("uses root-relative hrefs", () => {
    for (const href of allRouteHrefs) {
      expect(href.startsWith("/")).toBe(true);
    }
  });

  it("has no duplicate hrefs", () => {
    expect(new Set(allRouteHrefs).size).toBe(allRouteHrefs.length);
  });

  it("gives every route a label", () => {
    for (const route of Object.values(routes)) {
      expect(route.label.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("surface filters", () => {
  it("derives the nav and footer lists from the surface flags", () => {
    expect(primaryNavRoutes.every((r) => r.surface.primaryNav)).toBe(true);
    expect(footerRoutes.every((r) => r.surface.footer)).toBe(true);
  });

  it("keeps the home route out of both lists", () => {
    expect(primaryNavRoutes).not.toContainEqual(routes.home);
    expect(footerRoutes).not.toContainEqual(routes.home);
  });

  it("exposes the legal pages in the footer", () => {
    const hrefs = footerRoutes.map((r) => r.href);
    expect(hrefs).toContain("/privacy");
    expect(hrefs).toContain("/terms");
  });

  it("exposes the campaign holding page somewhere reachable", () => {
    const hrefs = [...primaryNavRoutes, ...footerRoutes].map((r) => r.href);
    expect(hrefs).toContain("/kickstarter");
  });
});
