"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useCallback, useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { primaryNavRoutes, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Closing on link click instead of via a route-change effect avoids the
  // cascading re-render flagged by react-hooks/set-state-in-effect. Trade-off:
  // the menu stays open on browser back/forward — acceptable for v1.
  const close = useCallback(() => setOpen(false), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="md:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[88vw] max-w-sm border-l border-border-default bg-background p-0"
      >
        <SheetHeader className="border-b border-border-hairline px-6 py-5">
          <SheetTitle className="m-0 p-0">
            <Logo size={16} asLink={false} />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-6 pt-8">
          {primaryNavRoutes.map((route) => {
            const active =
              pathname === route.href ||
              (route.href !== "/" && pathname.startsWith(route.href));
            return (
              <Link
                key={route.key}
                href={route.href}
                onClick={close}
                className={cn(
                  "border-b border-border-hairline py-5 font-display text-2xl font-medium tracking-[-0.01em] transition-colors",
                  active
                    ? "text-accent"
                    : "text-text-primary hover:text-accent",
                )}
              >
                {route.label}
              </Link>
            );
          })}
          <Link
            href={routes.contact.href}
            onClick={close}
            className="border-b border-border-hairline py-5 font-display text-2xl font-medium tracking-[-0.01em] text-text-primary hover:text-accent"
          >
            {routes.contact.label}
          </Link>
        </nav>

        <div className="px-6 pt-10">
          <Button
            render={<Link href={routes.product.href} onClick={close} />}
            className="h-12 w-full text-sm font-semibold uppercase tracking-[0.08em]"
            size="lg"
          >
            Pre-order GripFit
          </Button>
          <p className="mt-4 text-center text-xs text-text-tertiary">
            Free US shipping during pre-order.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
