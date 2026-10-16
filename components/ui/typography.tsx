import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Typography primitives — design.md §3. Components use these instead of
 * repeating font / size / colour class strings.
 */

export interface EyebrowProps extends ComponentProps<"p"> {
  /** Promo-green eyebrow — discount UI only. */
  promo?: boolean;
  onInk?: boolean;
}

export function Eyebrow({ className, promo, onInk, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-eyebrow",
        promo ? "text-promo" : onInk ? "text-text-on-ink-tertiary" : "text-text-tertiary",
        className,
      )}
      {...props}
    />
  );
}

type DisplaySize = "2xl" | "xl" | "lg" | "md" | "sm";

export interface DisplayProps extends ComponentProps<"h2"> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  size?: DisplaySize;
  onInk?: boolean;
}

const displaySize: Record<DisplaySize, string> = {
  "2xl": "text-display-2xl",
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
};

export function Display({
  as: Tag = "h2",
  size = "xl",
  onInk,
  className,
  ...props
}: DisplayProps) {
  return (
    <Tag
      className={cn(
        "font-display",
        displaySize[size],
        onInk ? "text-text-on-ink" : "text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

export interface LeadProps extends ComponentProps<"p"> {
  onInk?: boolean;
  size?: "lg" | "md";
}

/** Intro paragraph under a heading. */
export function Lead({ className, onInk, size = "lg", ...props }: LeadProps) {
  return (
    <p
      className={cn(
        "max-w-xl text-balance leading-[1.65]",
        size === "lg" ? "text-[17px] md:text-[19px]" : "text-[15px] md:text-[16px]",
        onInk ? "text-text-on-ink-secondary" : "text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

/** Small meta / caption text. */
export function Meta({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-[13px] leading-[1.55] text-text-tertiary", className)}
      {...props}
    />
  );
}
