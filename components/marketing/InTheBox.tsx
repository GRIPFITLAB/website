import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { productConfig } from "@/lib/config";
import { routes } from "@/lib/routes";

/**
 * InTheBox — replaces WHOOP's three-tier "Choose a membership" grid.
 *
 * GripFit is a single $95 SKU (Decisions.md §5), so the visual real
 * estate goes to a single bold pricing card with a clean "what's
 * included" list. The card is a tier-card-shaped block (consistent with
 * WHOOP visually) but renders the device once, no tier toggles.
 *
 * Pre-order CTA links to /product where the actual Add-to-Cart flow
 * lives once Shopify is wired in Build Order Step 6.
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
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="mb-14 max-w-2xl md:mb-16">
          <p className="text-eyebrow mb-5 text-accent-bright">
            What you get
          </p>
          <h2 className="font-display text-display-xl text-text-primary">
            One device. Everything you need.
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-text-secondary">
            No tiers, no subscriptions, no companion accessories to pair
            with. Pre-order ships with the device, the cable, and the iOS
            app — that&apos;s the whole product.
          </p>
        </div>

        <article
          className="relative overflow-hidden rounded-xl border border-border-default bg-bg-elevated"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-70"
          />
          <div className="grid md:grid-cols-2">
            {/* Left — pricing + CTA */}
            <div className="flex flex-col justify-between border-b border-border-hairline p-8 md:border-b-0 md:border-r md:p-12">
              <div>
                <p className="text-eyebrow mb-5 text-accent-bright">
                  Pre-order
                </p>
                <h3 className="font-display text-display-lg text-text-primary">
                  GripFit
                </h3>

                <div className="mt-8 flex items-baseline gap-3">
                  <span className="font-display text-[64px] font-extrabold leading-none tracking-[-0.04em] text-text-primary tabular-nums md:text-[80px]">
                    ${productConfig.base.fallbackPriceUSD}
                  </span>
                  <span className="text-sm text-text-tertiary">
                    USD · one-time
                  </span>
                </div>
                <p className="mt-3 text-sm text-text-tertiary">
                  Free US shipping during pre-order. Cancel anytime before
                  shipment.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  render={<Link href={routes.product.href} />}
                  size="lg"
                  className="h-12 w-full px-8 text-sm font-bold uppercase tracking-[0.08em] hover:shadow-[var(--shadow-glow)] sm:w-auto"
                >
                  Pre-order now
                </Button>
                <Link
                  href={routes.science.href}
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-accent-bright sm:px-2"
                >
                  Read the science →
                </Link>
              </div>
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
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-bright"
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-10 text-xs leading-[1.7] text-text-tertiary">
                Pre-orders are processed by Shopify on
                checkout.gripfit.com. Pricing and final ship date
                confirmed at checkout.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
