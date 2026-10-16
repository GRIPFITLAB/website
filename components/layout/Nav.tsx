import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/button";
import { campaign, discountConfig } from "@/lib/config";
import { primaryNavRoutes } from "@/lib/routes";

/**
 * Sticky top navigation. Server Component — the mobile menu is the only
 * client island. Hairline bottom border, translucent navy backdrop, one
 * blue campaign CTA on the right.
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-hairline bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-5 md:h-[72px] md:px-10">
        <div className="flex flex-1 items-center">
          <Logo size={16} />
        </div>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-10 md:flex"
        >
          {primaryNavRoutes.map((route) => (
            <Link
              key={route.key}
              href={route.href}
              className="text-[13px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:text-text-primary"
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <Button
            render={<Link href={campaign.href} {...campaign.linkProps} />}
            size="sm"
            className="hidden h-9 px-5 text-[12px] font-semibold uppercase tracking-[0.08em] md:inline-flex"
          >
            {discountConfig.campaign.ctaLabel}
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
