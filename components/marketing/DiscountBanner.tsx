"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useSyncExternalStore } from "react";

import { usePricing } from "@/components/experiment/PricingContext";
import { campaign, campaignBannerCopy, discountConfig } from "@/lib/config";

const STORAGE_KEY = "gripfit:discount-banner:dismissed-v2";

/**
 * Site-wide Kickstarter pricing banner — the only flood-fill of the promo
 * colour on the site. Copy is built from the visitor's pricing so the
 * numbers it quotes are always the numbers they'll see below.
 *
 * Dismissal is an external store (localStorage) read via
 * `useSyncExternalStore`; server snapshot = dismissed, so nothing renders
 * on the server and hydration can't mismatch.
 */
const listeners = new Set<() => void>();
let dismissedInSession = false;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
function getSnapshot(): boolean {
  if (dismissedInSession) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function getServerSnapshot(): boolean {
  return true;
}
function dismiss(): void {
  dismissedInSession = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // storage blocked — session flag still hides it
  }
  for (const listener of listeners) listener();
}

export function DiscountBanner() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pricing = usePricing();

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Kickstarter pricing"
      className="relative isolate flex items-center justify-center gap-3 bg-promo px-10 py-2.5 text-promo-foreground"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] font-semibold uppercase leading-tight tracking-[0.08em]">
        <span>{campaignBannerCopy(pricing)}</span>
        <Link
          href={campaign.href}
          {...campaign.linkProps}
          className="group inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
        >
          {discountConfig.campaign.ctaLabel}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-promo-foreground/80 transition-colors hover:bg-black/10 hover:text-promo-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
      >
        <X className="size-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
