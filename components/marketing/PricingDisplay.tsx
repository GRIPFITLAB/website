import { discountConfig, getPreorderPricing } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * PricingDisplay — strike-through list price, big sale price, savings
 * pill, and free-shipping note (when applicable).
 *
 * Variants:
 *   - `hero`   72px sale price; flush-left, home-page hero.
 *   - `card`   72px sale price; default, for in-page pricing recaps.
 *   - `pdp`    88px sale price; for the product detail page.
 *
 * Single source of truth for pricing math is `lib/config.ts`. The
 * component is a Server Component — discount values are baked at build.
 */

interface PricingDisplayProps {
  variant?: "hero" | "card" | "pdp";
  className?: string;
}

export function PricingDisplay({
  variant = "card",
  className,
}: PricingDisplayProps) {
  const { formattedSale, formattedList } = getPreorderPricing();
  const { freeShipping } = discountConfig.preorder;

  const sizeClass = {
    hero: "text-[56px] md:text-[72px]",
    card: "text-[56px] md:text-[72px]",
    pdp: "text-[64px] md:text-[88px]",
  }[variant];

  const listSizeClass = {
    hero: "text-base md:text-lg",
    card: "text-base md:text-lg",
    pdp: "text-lg md:text-xl",
  }[variant];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span
          className={cn(
            "font-display font-medium leading-none tracking-[-0.025em] text-text-primary tabular-nums",
            sizeClass,
          )}
        >
          {formattedSale}
        </span>
        <span
          aria-hidden
          className={cn(
            "font-display font-medium tabular-nums text-text-tertiary line-through decoration-text-tertiary/60",
            listSizeClass,
          )}
        >
          {formattedList}
        </span>
        <span className="sr-only">
          Sale price {formattedSale}, originally {formattedList}.
        </span>
        <span className="inline-flex items-center rounded-full bg-promo-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-promo">
          {discountConfig.preorder.label}
        </span>
      </div>
      <p className="mt-3 text-sm text-text-tertiary">
        USD · one-time
        {freeShipping ? " · free US shipping during pre-order" : ""}
      </p>
    </div>
  );
}
