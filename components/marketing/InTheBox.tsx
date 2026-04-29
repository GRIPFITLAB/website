import Link from "next/link";
import { Check } from "lucide-react";

import { EmailDiscountTeaser } from "@/components/marketing/EmailDiscountTeaser";
import { PricingDisplay } from "@/components/marketing/PricingDisplay";
import { Button } from "@/components/ui/button";
import { discountConfig, externalLinks } from "@/lib/config";
import { routes } from "@/lib/routes";

/**
 * InTheBox — single bold pricing card for the GripFit base SKU.
 *
 * Apr 29, 2026 revamp:
 *   - Moved to the bottom of the home page (replaces the deleted CTA
 *     section, which duplicated this block's job).
 *   - "Talk to us" link folded in here so the home page still ends
 *     with a contact affordance.
 *   - Pre-order CTA now routes to `externalLinks.crowdfundingUrl`.
 *   - Pricing comes from `<PricingDisplay variant="card" />`, which
 *     reads `discountConfig` so the discount %, savings pill, and
 *     free-shipping note are owned by `lib/config.ts`.
 *   - Removed the "Pre-orders are processed by Shopify on
 *     checkout.gripfit.com" line; Shopify is parked in v1.
 */
const includes: ReadonlyArray<string> = [
  "GripFit device — aluminium body, strain-gauge load cell",
  "USB-C charging cable",
  "iOS app — peak force, RFD, fatigue index, readiness score",
  "Lifetime firmware updates",
  "1-year limited warranty",
];

export function InTheBox() {
  return (
    <section className="bg-bg-canvas py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-14 max-w-2xl md:mb-16">
          <p className="text-eyebrow mb-5 text-text-tertiary">What you get</p>
          <h2 className="font-display text-display-xl text-text-primary">
            One device. Everything you need.
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-text-secondary">
            No tiers, no subscriptions, no companion accessories to pair
            with. Pre-order ships with the device, the cable, and the iOS
            app — that&apos;s the whole product.
          </p>
        </div>

        <article className="relative overflow-hidden rounded-2xl border border-border-default bg-bg-elevated">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-promo/50 to-transparent"
          />
          <div className="grid md:grid-cols-2">
            {/* Left — pricing + CTA */}
            <div className="flex flex-col justify-between border-b border-border-hairline p-8 md:border-b-0 md:border-r md:p-12">
              <div>
                <p className="text-eyebrow mb-5 text-promo">
                  Pre-order · {discountConfig.preorder.label}
                </p>
                <h3 className="font-display text-display-lg text-text-primary">
                  GripFit
                </h3>

                <div className="mt-7">
                  <PricingDisplay variant="card" />
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  render={<Link href={externalLinks.crowdfundingUrl} />}
                  size="lg"
                  className="h-12 w-full px-8 text-sm font-semibold uppercase tracking-[0.08em] hover:shadow-[var(--shadow-glow)] sm:w-auto"
                >
                  {discountConfig.preorder.ctaLabel}
                </Button>
                <Button
                  render={<Link href={routes.contact.href} />}
                  variant="outline"
                  size="lg"
                  className="h-12 w-full border-border-strong bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary hover:border-accent hover:bg-accent-soft sm:w-auto"
                >
                  Talk to us
                </Button>
              </div>

              <EmailDiscountTeaser className="mt-5" />
            </div>

            {/* Right — what's included */}
            <div className="bg-bg-deep p-8 md:p-12">
              <p className="text-eyebrow mb-6 text-text-tertiary">
                What&apos;s in the box
              </p>
              <ul className="flex flex-col gap-4">
                {includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3.5 text-[15px] leading-[1.5] text-text-primary"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
