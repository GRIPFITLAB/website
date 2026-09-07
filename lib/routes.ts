/**
 * Single source of truth for site routes. Every nav link, footer link,
 * sitemap entry, and breadcrumb references this file.
 *
 * Adding a route is a two-step process: declare it here, then create the
 * matching `app/<route>/page.tsx`. Decisions.md §6 owns the canonical
 * page list.
 */

export type RouteKey =
  | "home"
  | "product"
  | "science"
  | "kickstarter"
  | "contact"
  | "setup"
  | "privacy"
  | "terms";

export interface Route {
  key: RouteKey;
  href: string;
  label: string;
  /** Where the link appears. */
  surface: {
    primaryNav: boolean;
    footer: boolean;
  };
}

export const routes: Record<RouteKey, Route> = {
  home: {
    key: "home",
    href: "/",
    label: "Home",
    surface: { primaryNav: false, footer: false },
  },
  product: {
    key: "product",
    href: "/product",
    label: "Product",
    surface: { primaryNav: true, footer: true },
  },
  science: {
    key: "science",
    href: "/science",
    label: "Science",
    surface: { primaryNav: true, footer: true },
  },
  setup: {
    key: "setup",
    href: "/setup",
    label: "Setup",
    surface: { primaryNav: true, footer: true },
  },
  /**
   * Holding page for the crowdfunding campaign. Every "Back the
   * campaign" CTA lands here while `links.crowdfundingUrl` is null;
   * once the live URL is set the CTAs bypass this page, but the route
   * stays reachable (and linked from the footer) as the campaign
   * explainer + launch-notice signup.
   */
  kickstarter: {
    key: "kickstarter",
    href: "/kickstarter",
    label: "Kickstarter",
    surface: { primaryNav: false, footer: true },
  },
  contact: {
    key: "contact",
    href: "/contact",
    label: "Contact",
    surface: { primaryNav: false, footer: true },
  },
  privacy: {
    key: "privacy",
    href: "/privacy",
    label: "Privacy",
    surface: { primaryNav: false, footer: true },
  },
  terms: {
    key: "terms",
    href: "/terms",
    label: "Terms",
    surface: { primaryNav: false, footer: true },
  },
};

export const primaryNavRoutes: Route[] = Object.values(routes).filter(
  (r) => r.surface.primaryNav,
);

export const footerRoutes: Route[] = Object.values(routes).filter(
  (r) => r.surface.footer,
);

export const allRouteHrefs: string[] = Object.values(routes).map(
  (r) => r.href,
);
