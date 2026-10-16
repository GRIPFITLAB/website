"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useCallback, useState } from "react";

import { usePricing } from "@/components/experiment/PricingContext";
import { Logo } from "@/components/layout/Logo";
import { EmailDiscountTeaser } from "@/components/marketing/EmailDiscountTeaser";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { campaign, campaignBannerCopy, discountConfig } from "@/lib/config";
import { primaryNavRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const pricing = usePricing();

  // Close on link click rather than a route-change effect (avoids the
  // react-hooks/set-state-in-effect cascade).
  const close = useCallback(() => setOpen(false), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden" />
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

        <nav className="flex flex-col px-6 pt-6">
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
                  "border-b border-border-hairline py-5 font-display text-2xl font-medium tracking-[-0.02em] transition-colors",
                  active ? "text-accent-bright" : "text-text-primary hover:text-accent-bright",
                )}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 pt-10">
          <Button
            render={<Link href={campaign.href} onClick={close} {...campaign.linkProps} />}
            className="w-full"
            size="lg"
          >
            {discountConfig.campaign.ctaLabel}
          </Button>
          <div className="mt-5 flex justify-center">
            <EmailDiscountTeaser onClick={close} />
          </div>
          <p className="mt-5 text-center text-xs leading-[1.6] text-text-tertiary">
            {campaignBannerCopy(pricing)}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
