import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/button";
import { primaryNavRoutes, routes } from "@/lib/routes";

/**
 * Sticky top navigation. Server component — interactivity (mobile menu,
 * cart drawer) is delegated to small client islands.
 *
 * Visual reference: DESIGN_SYSTEM/ui_kits/website/Nav.jsx. We use a
 * permanent translucent backdrop instead of toggling on scroll so this
 * stays a Server Component (no scroll listener required).
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 md:h-[68px] md:px-8">
        <div className="flex flex-1 items-center">
          <Logo size={28} />
        </div>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-8 md:flex"
        >
          {primaryNavRoutes.map((route) => (
            <Link
              key={route.key}
              href={route.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            render={<Link href={routes.product.href} />}
            size="sm"
            className="hidden shadow-[0_0_24px_var(--color-accent-glow)] md:inline-flex"
          >
            Pre-order
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
