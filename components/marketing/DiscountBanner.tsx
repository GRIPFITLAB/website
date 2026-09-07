"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useSyncExternalStore } from "react";

import { campaign, discountConfig } from "@/lib/config";

const STORAGE_KEY = "gripfit:discount-banner:dismissed-v1";

/**
 * Site-wide pre-order discount banner.
 *
 * - Renders at the very top of every page (above the sticky nav).
 * - Reads the pre-order discount config from `lib/config.ts` so swapping
 *   the percent / free-shipping toggle / CTA target only touches
 *   `lib/admin.ts`.
 * - Dismissal lives in localStorage so it persists across pages without
 *   round-tripping a cookie.
 *
 * Dismissal is modelled as an external store rather than
 * `useState` + `useEffect`: localStorage *is* external state, and
 * `useSyncExternalStore` gives us the SSR-safe read (server snapshot =
 * "dismissed", so the server renders nothing and hydration can't
 * mismatch) without a setState-in-effect cascade.
 *
 * Visual: warm terracotta (`bg-promo`) with cream text. This is the
 * only place the promo accent is allowed to flood-fill — every other
 * promo usage is outline / text-only.
 */

/** Same-tab dismissals don't fire `storage`, so we notify explicitly. */
const listeners = new Set<() => void>();

/**
 * Fallback for browsers that block site data: dismissal still works for
 * the rest of the page session, it just doesn't survive a reload.
 */
let dismissedInSession = false;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // `storage` covers the other-tab case.
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
    // Private mode or blocked site data — show the banner rather than
    // swallowing the offer.
    return false;
  }
}

/** Server render: treat as dismissed so nothing is emitted to hydrate. */
function getServerSnapshot(): boolean {
  return true;
}

function dismiss(): void {
  dismissedInSession = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Storage unavailable — `dismissedInSession` still hides the banner.
  }
  for (const listener of listeners) listener();
}

export function DiscountBanner() {
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Pre-order discount"
      className="relative isolate flex items-center justify-center gap-3 bg-promo px-4 py-2.5 text-promo-foreground"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] font-semibold uppercase leading-tight tracking-[0.08em]">
        <span>{discountConfig.preorder.bannerCopy}</span>
        <Link
          href={campaign.href}
          {...campaign.linkProps}
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
