import Link from "next/link";

import { Button } from "@/components/ui/button";
import { productConfig } from "@/lib/config";
import { routes } from "@/lib/routes";

/**
 * Final CTA section — full-bleed black canvas with a giant headline,
 * one primary buy button, one secondary outline button, and a small
 * support note below.
 *
 * Decisions.md §16 Q3: pre-order via Shopify. The Pre-order button
 * routes to /product where the live cart drawer takes over once
 * Shopify is wired in Build Order Step 6. No waitlist email capture.
 */
export function CTA() {
  return (
    <section className="relative overflow-hidden bg-bg-deep py-28 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-1/3 mx-auto h-[600px] w-[1000px] max-w-[140vw] rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(91,33,182,0.10), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start px-5 md:px-10">
        <p className="text-eyebrow mb-7 text-accent">
          Pre-order ${productConfig.base.fallbackPriceUSD}
        </p>

        <h2 className="font-display text-text-primary text-display-2xl max-w-[14ch]">
          Train with data, not vibes.
        </h2>

        <p className="mt-7 max-w-xl text-[17px] leading-[1.7] text-text-secondary md:text-[19px]">
          Reserve a unit during pre-order. Free US shipping. Cancel any
          time before shipment.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            render={<Link href={routes.product.href} />}
            size="lg"
            className="h-12 px-9 text-sm font-semibold uppercase tracking-[0.08em] hover:shadow-[var(--shadow-glow-lg)]"
          >
            Pre-order GripFit
          </Button>
          <Button
            render={<Link href={routes.contact.href} />}
            variant="outline"
            size="lg"
            className="h-12 border-border-strong bg-transparent px-9 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            Talk to us
          </Button>
        </div>
      </div>
    </section>
  );
}
