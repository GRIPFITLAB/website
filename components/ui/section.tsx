import type { ComponentProps, ReactNode } from "react";

import { Display, Eyebrow, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/**
 * Layout primitives — the only place section rhythm and container width
 * are defined (design.md §4). Marketing components compose these instead
 * of restating padding / max-width classes.
 */

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-5 md:px-10", className)}
      {...props}
    />
  );
}

export interface SectionProps extends ComponentProps<"section"> {
  /** `default` = major section rhythm; `tight` = inner-page rhythm. */
  rhythm?: "default" | "tight";
  /** Surface treatment. `inverted` is the blue band — at most once per page. */
  tone?: "canvas" | "deep" | "inverted";
  /** Add the soft blue radial at the top edge. One per section max. */
  wash?: boolean;
}

export function Section({
  className,
  rhythm = "default",
  tone = "canvas",
  wash = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        rhythm === "default" ? "py-20 md:py-28" : "py-14 md:py-20",
        tone === "deep" && "bg-bg-deep",
        tone === "inverted" && "bg-inverted",
        className,
      )}
      {...props}
    >
      {wash ? (
        <div aria-hidden className="bg-accent-wash pointer-events-none absolute inset-0" />
      ) : null}
      {tone === "inverted" ? (
        <div aria-hidden className="bg-noise pointer-events-none absolute inset-0 opacity-60" />
      ) : null}
      <div className="relative">{children}</div>
    </section>
  );
}

export interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Heading level for the title. Defaults to h2. */
  as?: "h1" | "h2";
  /** Size token for the title. */
  size?: "xl" | "lg";
  onInk?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  as = "h2",
  size = "xl",
  onInk = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <Eyebrow onInk={onInk} className="mb-5">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Display as={as} size={size} onInk={onInk}>
        {title}
      </Display>
      {lead ? (
        <Lead onInk={onInk} className="mt-6">
          {lead}
        </Lead>
      ) : null}
    </div>
  );
}
