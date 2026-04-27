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
 *   • Static fallback (productConfig + the design.md specs grid)
 *     when env is missing — so the site can deploy to Vercel before the
 *     Shopify store exists.
 */

interface DisplayProduct {
  title: string;
  description: string;
  formattedPrice: string;
  source: "shopify" | "fallback";
}

const FALLBACK_SPECS = [
  { label: "Force range", value: "0–150 lbs" },
  { label: "Accuracy", value: "±0.5 lbs" },
  { label: "Sampling rate", value: "100 Hz" },
  { label: "Connectivity", value: "Bluetooth 5.2" },
  { label: "Battery", value: "6h continuous" },
  { label: "Compatibility", value: "iOS 16+" },
  { label: "Weight", value: "185 g" },
  { label: "Materials", value: "Aluminium alloy" },
] as const;

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
          <p className="text-eyebrow mb-6 text-accent-bright">
            {productConfig.base.preorder ? "Pre-order" : "Available now"}
          </p>
          <h1 className="font-display text-display-xl text-text-primary">
            {product.title}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.65] text-text-secondary">
            {product.description}
          </p>
          <p className="mt-8 font-display text-[56px] font-extrabold leading-none tracking-[-0.04em] text-text-primary tabular-nums md:text-[72px]">
            {product.formattedPrice}
          </p>

          {/* Buy box — disabled until Step 6 + Shopify env. */}
          <div className="mt-10 flex flex-col gap-3 sm:max-w-md">
            <Button
              size="lg"
              disabled
              aria-label="Pre-order GripFit (wired in Step 6)"
              className="h-12 px-8 text-sm font-bold uppercase tracking-[0.08em]"
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
              className="pointer-events-none absolute inset-0 bg-amber-bloom opacity-60"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-noise opacity-40 mix-blend-overlay"
            />
            <p className="relative text-eyebrow text-text-tertiary">
              Product photography · TBD
            </p>
          </div>
        </div>
      </header>

      {/* Specs */}
      <section className="mt-24 md:mt-32">
        <p className="text-eyebrow mb-5 text-accent-bright">Hardware</p>
        <h2 className="font-display text-display-lg mb-12 text-text-primary">
          Built like the equipment elite athletes already trust.
        </h2>

        <ul className="grid gap-px overflow-hidden rounded-xl bg-border-hairline sm:grid-cols-2 lg:grid-cols-4">
          {FALLBACK_SPECS.map((spec) => (
            <li
              key={spec.label}
              className="bg-bg-elevated p-7 transition-colors hover:bg-bg-raised"
            >
              <div className="text-eyebrow mb-3 text-text-tertiary">
                {spec.label}
              </div>
              <div className="font-display text-2xl font-bold text-text-primary tabular-nums">
                {spec.value}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
