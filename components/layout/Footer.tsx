import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { externalLinks, siteConfig } from "@/lib/config";
import { footerRoutes, routes } from "@/lib/routes";

/**
 * Footer — wide editorial layout.
 *
 * WHOOP-style structure: dense link grid grouped by topic on the left,
 * brand block + support email on the right, hairline rule below for
 * legal copy and copyright. The footer is intentionally large so it
 * acts as the closing punctuation on every page.
 */

const linkGroups: Array<{ heading: string; routeKeys: ReadonlyArray<keyof typeof routes> }> = [
  { heading: "Product", routeKeys: ["product", "science", "setup"] },
  { heading: "Company", routeKeys: ["contact"] },
  { heading: "Legal", routeKeys: ["privacy", "terms"] },
];

export function Footer() {
  const year = new Date().getFullYear();
  const allowedKeys = new Set(footerRoutes.map((r) => r.key));

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border-hairline bg-bg-deep">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Logo size={18} />
            <p className="mt-5 max-w-xs text-sm leading-[1.7] text-text-secondary">
              {siteConfig.description}
            </p>
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="mt-6 inline-block text-sm text-text-tertiary transition-colors hover:text-accent"
            >
              {externalLinks.supportEmail}
            </a>
          </div>

          {/* Link grid */}
          <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
            {linkGroups.map((group) => {
              const groupRoutes = group.routeKeys
                .map((k) => routes[k])
                .filter((r) => allowedKeys.has(r.key));
              if (groupRoutes.length === 0) return null;
              return (
                <div key={group.heading}>
                  <h3 className="text-eyebrow mb-5 text-text-tertiary">
                    {group.heading}
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {groupRoutes.map((route) => (
                      <li key={route.key}>
                        <Link
                          href={route.href}
                          className="text-sm text-text-primary transition-colors hover:text-accent"
                        >
                          {route.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border-hairline pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-text-tertiary">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary">
            GripFit is a measurement device, not a medical device. Not
            intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  );
}
