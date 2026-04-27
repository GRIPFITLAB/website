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
 *   • Static fallback (productConfig + the design-system specs grid)
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
    <article className="mx-auto w-full max-w-4xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
        Technical specs
      </div>
      <h1 className="mb-4 font-display text-[clamp(30px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-foreground">
        {product.title}{" "}
        {productConfig.base.preorder && (
          <span className="align-middle text-base font-medium text-primary">
            · Pre-order
          </span>
        )}
      </h1>
      <p className="mb-2 max-w-xl text-base leading-[1.7] text-muted-foreground">
        {product.description}
      </p>
      <p className="mb-10 font-display text-2xl font-bold text-foreground">
        {product.formattedPrice}
      </p>

      {/* Buy box — disabled until Step 6 + Shopify env. */}
      <div className="mb-12 flex flex-col gap-3 sm:max-w-md">
        <Button
          size="lg"
          disabled
          aria-label="Pre-order GripFit (wired in Step 6)"
        >
          {productConfig.base.preorder ? "Pre-order GripFit" : "Add to cart"}
        </Button>
        <p className="text-xs text-muted-foreground/70">
          {product.source === "shopify"
            ? "Add-to-cart wires up to the Shopify cart in Build Order Step 6."
            : "Configure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN + NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN to enable checkout."}
        </p>
      </div>

      <h2 className="mb-4 font-display text-xl font-bold text-foreground">
        Specs
      </h2>
      <ul className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FALLBACK_SPECS.map((spec) => (
          <li
            key={spec.label}
            className="rounded-2xl border border-border bg-card/70 p-5"
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground/70">
              {spec.label}
            </div>
            <div className="font-display text-lg font-bold text-foreground">
              {spec.value}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex h-56 items-center justify-center rounded-3xl border border-primary/10 bg-card/40">
        <p className="text-sm text-muted-foreground/50">
          Product photography placeholder · TBD
        </p>
      </div>
    </article>
  );
}
