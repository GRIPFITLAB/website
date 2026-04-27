import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Wordmark height in px. The mark scales with it. */
  size?: number;
  /** Hide the wordmark and show only the icon mark. */
  iconOnly?: boolean;
  /** Wrap in a Link to "/" — defaults to true; pass false in nav drawers. */
  asLink?: boolean;
}

/**
 * GripFit mark + wordmark.
 *
 * Pure inline SVG (no external image asset) — same pattern the old logo
 * used, but rebuilt around the new amber accent and the WHOOP-style
 * editorial wordmark: heavy uppercase Geist, single letter-spaced word,
 * no decorative tagline.
 *
 * The mark is a stylised grip-bar: three horizontal force lines
 * compressing toward the right, hinting at squeeze + release.
 */
export function Logo({
  className,
  size = 18,
  iconOnly = false,
  asLink = true,
}: LogoProps) {
  const markSize = Math.round(size * 1.4);

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-foreground",
        asLink && "transition-colors hover:text-accent-bright",
        className,
      )}
    >
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect
          x="2"
          y="5"
          width="14"
          height="2.4"
          rx="1.2"
          fill="currentColor"
          opacity="0.95"
        />
        <rect
          x="2"
          y="10.8"
          width="20"
          height="2.4"
          rx="1.2"
          fill="var(--accent)"
        />
        <rect
          x="2"
          y="16.6"
          width="11"
          height="2.4"
          rx="1.2"
          fill="currentColor"
          opacity="0.55"
        />
      </svg>
      {!iconOnly && (
        <span
          className="font-display font-extrabold uppercase leading-none tracking-[0.04em]"
          style={{ fontSize: size }}
        >
          GripFit
        </span>
      )}
      <span className="sr-only">GripFit home</span>
    </span>
  );

  if (!asLink) return inner;

  return (
    <Link href="/" aria-label="GripFit home" className="inline-flex">
      {inner}
    </Link>
  );
}
