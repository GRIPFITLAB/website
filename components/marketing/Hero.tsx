import Link from "next/link";
import { Check } from "lucide-react";

import { EmailDiscountTeaser } from "@/components/marketing/EmailDiscountTeaser";
import { PricingDisplay } from "@/components/marketing/PricingDisplay";
import { Button } from "@/components/ui/button";
import { discountConfig, externalLinks, siteConfig } from "@/lib/config";
import { routes } from "@/lib/routes";

/**
 * Hero — warm-cream editorial section.
 *
 * Composition (Jun 28, 2026 revamp):
 *   - Two-column layout: copy + pricing on the left, product card on
 *     the right. The product card now carries the "what's in the box"
 *     checklist (folded in from the deleted bottom InTheBox section).
 *   - Secondary CTA is "Talk to us" (→ /contact); the "Back the
 *     campaign" primary CTA routes to `externalLinks.crowdfundingUrl`.
 *
 * Tagline / H1 still come from `siteConfig.tagline` so Decisions.md
 * §16 Q5 only requires touching one file.
 */

/** What ships with every GripFit pre-order. */
const includes: ReadonlyArray<string> = [
  "GripFit device — aluminium body, NIST-calibrated load cell",
  "USB-C charging cable",
  "iOS app — real-time force, trends, readiness",
  "1-year limited warranty",
];
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background — soft warm wash bottom-center, hairline divider. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-warm-wash opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[40%] left-1/2 h-[700px] w-[1200px] max-w-[180vw] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(28,26,23,0.06) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-24 pt-20 md:grid-cols-12 md:gap-10 md:px-10 md:pb-32 md:pt-28 lg:min-h-[80vh]">
        {/* Copy column */}
        <div className="flex flex-col justify-center md:col-span-7">
          <span className="text-eyebrow mb-7 inline-flex items-center gap-3 text-promo">
            <span
              aria-hidden
              className="inline-block size-1.5 rounded-full bg-promo"
            />
            Pre-order open · {discountConfig.preorder.label}
          </span>

          <h1 className="font-display text-display-2xl text-text-primary max-w-[15ch]">
            {siteConfig.tagline}
          </h1>

          <p className="mt-7 max-w-xl text-balance text-[17px] leading-[1.7] text-text-secondary md:text-[19px]">
            A precision hand dynamometer calibrated with NIST-certified load
            cells. Track the entire force profile in real time — not just
            your peak.
          </p>

          <div className="mt-9">
            <PricingDisplay variant="hero" />
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button
              render={<Link href={externalLinks.crowdfundingUrl} />}
              size="lg"
              className="h-12 px-9 text-sm font-semibold uppercase tracking-[0.08em] hover:shadow-[var(--shadow-glow)]"
            >
              {discountConfig.preorder.ctaLabel}
            </Button>
            <Button
              render={<Link href={routes.contact.href} />}
              variant="outline"
              size="lg"
              className="h-12 border-border-strong bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary hover:border-accent hover:bg-accent-soft"
            >
              Talk to us
            </Button>
          </div>

          <EmailDiscountTeaser className="mt-5" />
        </div>

        {/* Product card — labelled placeholder until art lands
            (Decisions.md §16 Q11), with the "what's in the box" checklist
            folded in from the deleted bottom pricing section. */}
        <div className="relative flex flex-col justify-center gap-5 md:col-span-5">
          <ProductPlaceholder />
          <div className="rounded-2xl border border-border-default bg-bg-elevated p-6 shadow-[var(--shadow-card)]">
            <p className="text-eyebrow mb-4 text-text-tertiary">
              What&apos;s in the box
            </p>
            <ul className="flex flex-col gap-3">
              {includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14px] leading-[1.5] text-text-primary"
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
      </div>
    </section>
  );
}

function ProductPlaceholder() {
  return (
    <figure
      role="img"
      aria-label="GripFit device — product photography placeholder"
      className="relative w-full overflow-hidden rounded-2xl border border-border-default bg-bg-elevated shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[5/4] w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-warm-wash opacity-80"
        />
        {/* Abstract render glyph — soft rounded rectangle suggesting the
            device, plus a pulse curve. Pure SVG, no real photography. */}
        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 h-full w-full text-accent"
          aria-hidden
        >
          <defs>
            <linearGradient id="hero-device" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="hero-curve" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <rect
            x="120"
            y="80"
            width="160"
            height="340"
            rx="48"
            fill="url(#hero-device)"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <rect
            x="140"
            y="120"
            width="120"
            height="6"
            rx="3"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="140"
            y="138"
            width="90"
            height="6"
            rx="3"
            fill="currentColor"
            opacity="0.45"
          />
          <rect
            x="140"
            y="156"
            width="60"
            height="6"
            rx="3"
            fill="currentColor"
            opacity="0.25"
          />
          <circle
            cx="200"
            cy="320"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          <circle cx="200" cy="320" r="6" fill="currentColor" opacity="0.7" />
          <path
            d="M 30 460 L 80 458 L 130 430 L 180 320 L 230 280 L 280 290 L 330 330 L 370 380"
            fill="none"
            stroke="url(#hero-curve)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <figcaption className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-bg-canvas/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary backdrop-blur-sm">
          Product photography · TBD
        </figcaption>
      </div>
    </figure>
  );
}
