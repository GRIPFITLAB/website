"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { discountConfig, externalLinks } from "@/lib/config";

const STORAGE_KEY = "gripfit:discount-banner:dismissed-v1";

/**
 * Site-wide pre-order discount banner.
 *
 * - Renders at the very top of every page (above the sticky nav).
 * - Reads the pre-order discount config from `lib/config.ts` so swapping
 *   the percent / free-shipping toggle / CTA target only touches that
 *   file (Decisions.md §16 Q3).
 * - Dismiss state lives in localStorage so it persists across pages
 *   without round-tripping a cookie. Uses an SSR-friendly mount gate to
 *   avoid hydration drift.
 *
 * Visual: warm terracotta (`bg-promo`) with cream text. This is the
 * only place the promo accent is allowed to flood-fill — every other
 * promo usage is outline / text-only.
 */
export function DiscountBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    if (dismissed) setVisible(false);
  }, []);

  if (!mounted || !visible) return null;

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }

  return (
    <div
      role="region"
      aria-label="Pre-order discount"
      className="relative isolate flex items-center justify-center gap-3 bg-promo px-4 py-2.5 text-promo-foreground"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] font-semibold uppercase leading-tight tracking-[0.08em]">
        <span>{discountConfig.preorder.bannerCopy}</span>
        <Link
          href={externalLinks.crowdfundingUrl}
          className="group inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
        >
          {discountConfig.preorder.ctaLabel}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss discount banner"
        className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-promo-foreground/80 transition-colors hover:bg-white/10 hover:text-promo-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <X className="size-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
