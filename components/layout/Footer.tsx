import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { EmailDiscountForm } from "@/components/marketing/EmailDiscountForm";
import { Container } from "@/components/ui/section";
import { Display, Eyebrow } from "@/components/ui/typography";
import { discountConfig, externalLinks, siteConfig } from "@/lib/config";
import { footerRoutes, routes } from "@/lib/routes";

/**
 * Footer — email signup band on top (header + input only, plus the single
 * no-spam line), link grid below, legal line at the bottom.
 */
const linkGroups: Array<{
  heading: string;
  routeKeys: ReadonlyArray<keyof typeof routes>;
}> = [
  { heading: "Product", routeKeys: ["science", "setup"] },
  { heading: "Company", routeKeys: ["kickstarter", "contact"] },
  { heading: "Legal", routeKeys: ["privacy", "terms"] },
];

export function Footer() {
  const year = new Date().getFullYear();
  const allowedKeys = new Set(footerRoutes.map((r) => r.key));

  return (
    <footer className="relative mt-24 border-t border-border-hairline bg-bg-deep">
      <Container className="py-16 md:py-20">
        {/* Email signup band */}
        <section
          id="email-discount"
          aria-labelledby="footer-email-discount-heading"
          className="grid scroll-mt-24 items-center gap-6 border-b border-border-default pb-10 md:grid-cols-12 md:gap-10 md:pb-12"
        >
          <div className="md:col-span-6 lg:col-span-5">
            <Eyebrow promo className="mb-3">
              {discountConfig.campaign.tierLabels.superEarlyBird}
            </Eyebrow>
            <Display id="footer-email-discount-heading" size="md">
              {discountConfig.email.headline}
            </Display>
          </div>
          <div className="md:col-span-6 lg:col-span-7">
            <EmailDiscountForm variant="footer" idPrefix="footer" source="footer" showConsent />
          </div>
        </section>

        <div className="mt-12 grid gap-12 md:mt-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo size={18} />
            <p className="mt-5 max-w-sm text-sm leading-[1.7] text-text-secondary">
              {siteConfig.description}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-[1.7] text-text-secondary">
              {siteConfig.footerBlurb}
            </p>
            <a
              href={`mailto:${externalLinks.supportEmail}`}
              className="mt-6 inline-block text-sm text-text-tertiary transition-colors hover:text-accent-bright"
            >
              {externalLinks.supportEmail}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
            {linkGroups.map((group) => {
              const groupRoutes = group.routeKeys
                .map((k) => routes[k])
                .filter((r) => allowedKeys.has(r.key));
              if (groupRoutes.length === 0) return null;
              return (
                <div key={group.heading}>
                  <Eyebrow className="mb-5">{group.heading}</Eyebrow>
                  <ul className="flex flex-col gap-3">
                    {groupRoutes.map((route) => (
                      <li key={route.key}>
                        <Link
                          href={route.href}
                          className="text-sm text-text-primary transition-colors hover:text-accent-bright"
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
            GripFit is a measurement device, not a medical device. Not intended to
            diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </Container>
    </footer>
  );
}
