import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { productConfig } from "@/lib/config";
import { isShopifyConfigured } from "@/lib/env";
import { getProductByHandle } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Product",
  description:
    "GripFit is a precision hand dynamometer that pairs with iOS to track peak force, endurance, and fatigue.",
};

/**
 * Product Detail Page.
 *
 * STATUS — Step-4 stub. The full PDP (live Shopify product, image gallery,
 * variant picker, real Add-to-Cart wired to the cart drawer) is Build
 * Order Step 6.
 *
 * For now this page renders:
 *   • Live Shopify data when env is configured.
 *   • Static fallback (productConfig + the design.md specs list)
 *     when env is missing — so the site can deploy to Vercel before the
 *     Shopify store exists.
 *
 * Specs are rendered as a modern editorial list (label / value rows
 * grouped by category) per the Apr 26, 2026 revamp brief.
 */

interface DisplayProduct {
  title: string;
  description: string;
  formattedPrice: string;
  source: "shopify" | "fallback";
}

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

async function loadProduct(): Promise<DisplayProduct> {
  if (!isShopifyConfigured) {
    return {
      title: productConfig.base.name,
      description:
        "Engineered for athletes who demand measurement-grade accuracy and real-time readiness intelligence.",
      formattedPrice: `$${productConfig.base.fallbackPriceUSD.toFixed(2)} USD`,
      source: "fallback",
    };
  }

  // Once Shopify env is set, fetch live data. Failures fall back to the
  // static config so a misconfigured deploy still renders something useful.
  try {
    const product = await getProductByHandle(productConfig.base.handle);
    if (!product) throw new Error("Product not found in Shopify");
    const price = product.priceRange.minVariantPrice;
    return {
      title: product.title,
      description: product.description,
      formattedPrice: `$${Number(price.amount).toFixed(2)} ${price.currencyCode}`,
      source: "shopify",
    };
  } catch {
    return {
      title: productConfig.base.name,
      description:
        "Engineered for athletes who demand measurement-grade accuracy and real-time readiness intelligence.",
      formattedPrice: `$${productConfig.base.fallbackPriceUSD.toFixed(2)} USD`,
      source: "fallback",
    };
  }
}

export default async function ProductPage() {
  const product = await loadProduct();

  return (
    <article className="mx-auto w-full max-w-7xl px-5 py-20 md:px-10 md:py-28">
      <header className="grid gap-12 md:grid-cols-12">
        {/* Left — title + price + buy box */}
        <div className="md:col-span-7">
          <p className="text-eyebrow mb-6 text-accent">
            {productConfig.base.preorder ? "Pre-order" : "Available now"}
          </p>
          <h1 className="font-display text-display-xl text-text-primary">
            {product.title}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.65] text-text-secondary">
            {product.description}
          </p>
          <p className="mt-8 font-display text-[56px] font-medium leading-none tracking-[-0.025em] text-text-primary tabular-nums md:text-[72px]">
            {product.formattedPrice}
          </p>

          {/* Buy box — disabled until Step 6 + Shopify env. */}
          <div className="mt-10 flex flex-col gap-3 sm:max-w-md">
            <Button
              size="lg"
              disabled
              aria-label="Pre-order GripFit (wired in Step 6)"
              className="h-12 px-8 text-sm font-semibold uppercase tracking-[0.08em]"
            >
              {productConfig.base.preorder ? "Pre-order GripFit" : "Add to cart"}
            </Button>
            <p className="text-xs leading-[1.6] text-text-tertiary">
              {product.source === "shopify"
                ? "Add-to-cart wires up to the Shopify cart in Build Order Step 6."
                : "Configure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN + NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN to enable checkout."}
            </p>
          </div>
        </div>

        {/* Right — placeholder photography slot */}
        <div className="md:col-span-5">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border-default bg-bg-elevated">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-purple-wash opacity-70"
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
            <p className="text-eyebrow mb-5 text-accent">Specifications</p>
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

            <p className="mt-8 text-xs leading-[1.6] text-text-tertiary">
              Specifications are subject to minor change before the
              production run ships. Hardware revisions, if any, will be
              published here and on /science.
            </p>
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
