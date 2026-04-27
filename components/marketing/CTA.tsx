import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * Final-CTA section.
 *
 * Visual reference: DESIGN_SYSTEM/ui_kits/website/CTASection.jsx, BUT
 * the original waitlist email-capture form is intentionally replaced
 * per Decisions.md §16 Q3 (pre-order via Shopify, no separate waitlist).
 * The "Pre-order GripFit" button links to the PDP, which is where the
 * real Add-to-Cart action lives once Shopify is wired in Step 6.
 */
export function CTA() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-24">
      <div
        className="relative mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-primary/20 px-8 py-14 text-center md:px-14 md:py-16"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 12%, transparent) 0%, color-mix(in oklab, var(--color-card) 90%, transparent) 40%, color-mix(in oklab, var(--color-chart-5) 8%, transparent) 100%)",
          boxShadow:
            "0 0 80px color-mix(in oklab, var(--color-primary) 8%, transparent)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 h-[200px] w-[300px] max-w-[80vw] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in oklab, var(--color-primary) 20%, transparent) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
            Early access
          </div>
          <h2 className="mb-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-foreground">
            The future of human readiness.
          </h2>
          <p className="mx-auto mb-8 max-w-md text-base leading-[1.7] text-muted-foreground">
            Reserve a unit during pre-order. Shipping and final pricing are
            confirmed at checkout.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              render={<Link href={routes.product.href} />}
              size="lg"
              className="px-8 shadow-[0_0_24px_var(--color-accent-glow)]"
            >
              Pre-order GripFit
            </Button>
            <Button
              render={<Link href={routes.science.href} />}
              size="lg"
              variant="outline"
              className="px-8"
            >
              Read the science
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Pre-orders are processed by Shopify. You can cancel any time before
            shipment.
          </p>
        </div>
      </div>
    </section>
  );
}
