import Link from "next/link";

import { brandConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Mark size in px. Wordmark text scales relative to this. */
  size?: number;
  /** Hide the wordmark and show only the icon mark. */
  iconOnly?: boolean;
  /** Wrap in a Link to "/" — defaults to true; pass false in nav drawers. */
  asLink?: boolean;
}

/**
 * Inline-SVG GripFit mark + wordmark, rebuilt from
 * `DESIGN_SYSTEM/ui_kits/website/Nav.jsx`. Drop-in safe for both Server
 * and Client components.
 *
 * TODO(Decisions.md §16 Q6): when the final logo lands in
 * `DESIGN_SYSTEM/assets/`, swap the inline SVG for an `<Image>` and
 * point at `brandConfig.logoMarkPath` / `logoFullPath`.
 */
export function Logo({
  className,
  size = 28,
  iconOnly = false,
  asLink = true,
}: LogoProps) {
  const wordmarkSize = Math.round(size * 0.65);

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        asLink && "transition-opacity hover:opacity-90",
        className,
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect x="8" y="12" width="22" height="28" rx="5" fill="url(#gf-grad)" />
        <rect
          x="12"
          y="17"
          width="14"
          height="3"
          rx="1.5"
          fill="rgba(255,255,255,0.55)"
        />
        <rect
          x="12"
          y="23"
          width="14"
          height="3"
          rx="1.5"
          fill="rgba(255,255,255,0.38)"
        />
        <rect
          x="12"
          y="29"
          width="9"
          height="3"
          rx="1.5"
          fill="rgba(255,255,255,0.22)"
        />
        <path
          d="M34 17 Q39 26 34 35"
          stroke="var(--color-primary)"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="gf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent-strong)" />
            <stop offset="100%" stopColor="var(--color-accent-muted)" />
          </linearGradient>
        </defs>
      </svg>
      {!iconOnly && (
        <span
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: wordmarkSize }}
        >
          {brandConfig.wordmark.strong}
          <span className="font-light text-primary">
            {brandConfig.wordmark.light}
          </span>
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
