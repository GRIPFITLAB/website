import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import mark from "@/public/brand/gripfit-g.png";

interface LogoProps {
  className?: string;
  /** Wordmark cap height in px; the mark scales with it. */
  size?: number;
  /** Hide the wordmark and show only the "G". */
  iconOnly?: boolean;
  /** Wrap in a Link to "/" — defaults to true; pass false in nav drawers. */
  asLink?: boolean;
}

/**
 * GripFit mark + wordmark.
 *
 * The mark is the iOS app icon's "G" (`public/brand/gripfit-g.png`, background
 * removed). The wordmark is Inter Tight medium. This is the only file that
 * references the logo asset.
 */
export function Logo({ className, size = 18, iconOnly = false, asLink = true }: LogoProps) {
  const markSize = Math.round(size * 1.2);

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-text-primary",
        asLink && "transition-opacity hover:opacity-80",
        className,
      )}
    >
      <Image
        src={mark}
        alt=""
        aria-hidden
        width={markSize}
        height={markSize}
        priority
        className="shrink-0 select-none"
      />
      {!iconOnly && (
        <span
          className="font-display font-medium leading-none tracking-[-0.02em]"
          style={{ fontSize: size * 1.15 }}
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
