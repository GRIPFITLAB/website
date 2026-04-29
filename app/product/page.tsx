import Link from "next/link";
import type { Metadata } from "next";

import { EmailDiscountTeaser } from "@/components/marketing/EmailDiscountTeaser";
import { PricingDisplay } from "@/components/marketing/PricingDisplay";
import { Button } from "@/components/ui/button";
import { discountConfig, externalLinks, productConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Product",
  description:
    "GripFit is a precision hand dynamometer that pairs with iOS to track peak force, endurance, and fatigue.",
};

/**
 * Product Detail Page — Apr 29, 2026 revamp.
 *
 * STATUS — v1 ships pre-orders via the external crowdfunding campaign
 * (Decisions.md §16 Q3). The dormant Shopify client in `lib/shopify/`
 * is intentionally NOT imported here; v2 will reawaken it when
 * commerce relights. Until then this page reads from `productConfig`
 * + `discountConfig` only and routes its single CTA to
 * `externalLinks.crowdfundingUrl`.
 *
 * Specs render as a modern editorial list (label / value rows grouped
 * by category), unchanged from the prior revamp.
 */

interface SpecGroup {
  heading: string;
  rows: ReadonlyArray<{ label: string; value: string }>;
}

const SPECS: ReadonlyArray<SpecGroup> = [
  {
    heading: "Sensing",
    rows: [
      { label: "Force range", value: "0–150 lbs (0–667 N)" },
      { label: "Accuracy", value: "±0.5 lbs across full range" },
      { label: "Sampling rate", value: "100 Hz" },
      { label: "Resolution", value: "0.1 lb" },
      { label: "Sensor", value: "Strain-gauge load cell" },
    ],
  },
  {
    heading: "Connectivity",
    rows: [
      { label: "Wireless", value: "Bluetooth 5.2 LE" },
      { label: "Pairing time", value: "Under 3 seconds" },
      { label: "Range", value: "10 m line-of-sight" },
      { label: "Compatibility", value: "iOS 16 or later · iPhone 12+" },
    ],
  },
  {
    heading: "Power",
    rows: [
      { label: "Battery life", value: "6 hours continuous use" },
      { label: "Standby", value: "30 days" },
      { label: "Charging port", value: "USB-C" },
      { label: "Charge time", value: "90 minutes (0–100%)" },
    ],
  },
  {
    heading: "Build",
    rows: [
      { label: "Body", value: "Anodised aluminium alloy" },
      { label: "Grip surface", value: "Textured silicone" },
      { label: "Weight", value: "185 g (6.5 oz)" },
      { label: "Dimensions", value: "115 × 60 × 32 mm" },
      { label: "Operating temp", value: "0–40 °C (32–104 °F)" },
      { label: "Warranty", value: "1-year limited" },
    ],
  },
];

const description =
  "Engineered for athletes who demand measurement-grade accuracy and real-time readiness intelligence.";

export default function ProductPage() {
  return (
    <article className="mx-auto w-full max-w-7xl px-5 py-20 md:px-10 md:py-28">
      <header className="grid gap-12 md:grid-cols-12">
        {/* Left — title + price + CTA */}
        <div className="md:col-span-7">
          <p className="text-eyebrow mb-6 text-promo">
            Pre-order · {discountConfig.preorder.label}
          </p>
          <h1 className="font-display text-display-xl text-text-primary">
            {productConfig.base.name}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.65] text-text-secondary">
            {description}
          </p>

          <div className="mt-9 max-w-xl">
            <PricingDisplay variant="pdp" />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:max-w-md">
            <Button
              render={<Link href={externalLinks.crowdfundingUrl} />}
              size="lg"
              className="h-12 px-8 text-sm font-semibold uppercase tracking-[0.08em] hover:shadow-[var(--shadow-glow)]"
            >
              {discountConfig.preorder.ctaLabel}
            </Button>
            <EmailDiscountTeaser className="mt-1" />
            <p className="mt-3 text-xs leading-[1.6] text-text-tertiary">
              Pre-orders are handled by our crowdfunding campaign. The
              campaign URL goes live once the campaign launches; the
              link above will route there automatically.
            </p>
          </div>
        </div>

        {/* Right — placeholder photography slot */}
        <div className="md:col-span-5">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border-default bg-bg-elevated shadow-[var(--shadow-card)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-warm-wash opacity-70"
            />
            <p className="relative text-eyebrow text-text-tertiary">
              Product photography · TBD
            </p>
          </div>
        </div>
      </header>

      {/* Specs — modern editorial list */}
      <section className="mt-24 md:mt-32">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-eyebrow mb-5 text-text-tertiary">
              Specifications
            </p>
            <h2 className="font-display text-display-lg text-text-primary">
              Built to be measured.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.65] text-text-secondary">
              Calibrated against laboratory-grade reference loads. Every
              spec below is a tested value, not a marketing rounding.
            </p>
          </div>

          <div className="md:col-span-8">
            <dl className="divide-y divide-border-hairline border-y border-border-hairline">
              {SPECS.map((group) => (
                <SpecRow key={group.heading} group={group} />
              ))}
            </dl>
          </div>
        </div>
      </section>
    </article>
  );
}

function SpecRow({ group }: { group: SpecGroup }) {
  return (
    <div className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-12">
      <h3 className="font-display text-display-sm text-text-primary md:col-span-4">
        {group.heading}
      </h3>
      <ul className="md:col-span-8">
        {group.rows.map((row, i) => (
          <li
            key={row.label}
            className={[
              "flex items-baseline justify-between gap-6 py-3 text-[15px]",
              i === 0 ? "" : "border-t border-border-hairline",
            ].join(" ")}
          >
            <span className="text-text-secondary">{row.label}</span>
            <span className="text-right font-medium text-text-primary tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
