import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { externalLinks, siteConfig } from "@/lib/config";
import { footerRoutes } from "@/lib/routes";

/**
 * Footer. Visual reference: DESIGN_SYSTEM/ui_kits/website/Footer.jsx.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8 md:py-12">
        <Logo size={22} className="text-muted-foreground" />

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {footerRoutes.map((route) => (
            <Link
              key={route.key}
              href={route.href}
              className="text-sm text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {route.label}
            </Link>
          ))}
          <a
            href={`mailto:${externalLinks.supportEmail}`}
            className="text-sm text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            {externalLinks.supportEmail}
          </a>
        </nav>

        <p className="text-xs text-muted-foreground/50">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
