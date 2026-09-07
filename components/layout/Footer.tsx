import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { EmailDiscountForm } from "@/components/marketing/EmailDiscountForm";
import { discountConfig, externalLinks, siteConfig } from "@/lib/config";
import { footerRoutes, routes } from "@/lib/routes";

/**
 * Footer — wide editorial layout.
 *
 * Top band: always-visible email signup that promotes the stacked
 * extra-15%-off code. Submitting here writes the same localStorage
 * suppression flag the modal uses, so visitors who already gave us
 * their email don't get nagged by the auto-popup on later pages.
 *
 * Below: dense link grid grouped by topic on the left, brand block on
 * the right, hairline rule below for legal copy and copyright. The
 * footer is intentionally large so it acts as the closing punctuation
 * on every page.
 */

const linkGroups: Array<{
  heading: string;
  routeKeys: ReadonlyArray<keyof typeof routes>;
}> = [
  { heading: "Product", routeKeys: ["product", "science", "setup"] },
  { heading: "Company", routeKeys: ["kickstarter", "contact"] },
  { heading: "Legal", routeKeys: ["privacy", "terms"] },
];

export function Footer() {
  const year = new Date().getFullYear();
  const allowedKeys = new Set(footerRoutes.map((r) => r.key));

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border-hairline bg-bg-deep">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
        {/* Email signup band — promotes the stacked extra-15% code. */}
        <section
          id="email-discount"
          aria-labelledby="footer-email-discount-heading"
          className="grid scroll-mt-24 items-center gap-6 border-b border-border-default pb-10 md:grid-cols-12 md:gap-10 md:pb-12"
        >
          <div className="md:col-span-6 lg:col-span-5">
            <p className="text-eyebrow mb-3 inline-flex items-center gap-2 text-promo">
              <span
                aria-hidden
                className="inline-block size-1.5 rounded-full bg-promo"
              />
              {discountConfig.email.label} · stacks on Kickstarter
            </p>
            <h2
              id="footer-email-discount-heading"
              className="font-display text-display-sm text-text-primary"
            >
              {discountConfig.email.headline}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-[1.6] text-text-secondary">
              {discountConfig.email.body}
            </p>
          </div>
          <div className="flex flex-col justify-center md:col-span-6 md:pl-2 lg:col-span-7">
            <EmailDiscountForm variant="footer" idPrefix="footer" />
            <p className="mt-2.5 text-[11px] leading-[1.5] text-text-tertiary">
              No spam. Unsubscribe anytime. We&apos;ll only email you about
              pre-order updates.
            </p>
          </div>
        </section>

        <div className="mt-12 grid gap-12 md:mt-14 md:grid-cols-12">
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
