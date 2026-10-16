import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Surface — the one card treatment (design.md §6). Solid navy panel,
 * hairline border, deep shadow. No blur, no gradient fills.
 */
export interface SurfaceProps extends ComponentProps<"div"> {
  padding?: "none" | "md" | "lg";
  /** Lift on hover — for interactive / linked cards only. */
  interactive?: boolean;
}

export function Surface({
  className,
  padding = "md",
  interactive = false,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-default bg-bg-elevated shadow-[var(--shadow-card)]",
        padding === "md" && "p-6 md:p-8",
        padding === "lg" && "p-8 md:p-12",
        interactive &&
          "transition-[box-shadow,border-color] duration-300 hover:border-border-strong hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
      {...props}
    />
  );
}
