"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { trackingConfig } from "@/lib/config";
import { routes } from "@/lib/routes";

const STORAGE_KEY = "gripfit:cookie-notice:dismissed-v1";

/**
 * Small, dismissible tracking notice (DECISIONS.md §12). Discloses the
 * first-party pricing cookie and the Meta Pixel; links to /privacy.
 *
 * Reads dismissal via `useSyncExternalStore`: server snapshot is
 * "dismissed" so nothing renders on the server and hydration can't
 * mismatch.
 */
const listeners = new Set<() => void>();
let dismissedInSession = false;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
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
  for (const l of listeners) l();
}

export function CookieNotice() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (dismissed || !trackingConfig.showCookieNotice) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-[55] mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-border-default bg-bg-elevated p-4 shadow-[var(--shadow-card-hover)] sm:flex-row sm:items-center sm:gap-5 sm:p-5"
    >
      <p className="flex-1 text-[13px] leading-[1.55] text-text-secondary">
        {trackingConfig.cookieNoticeCopy}{" "}
        <Link
          href={routes.privacy.href}
          className="text-text-primary underline underline-offset-4 hover:text-accent-bright"
        >
          Privacy
        </Link>
      </p>
      <Button type="button" variant="outline" size="sm" onClick={dismiss} className="h-9 px-4 text-xs">
        Got it
      </Button>
    </div>
  );
}
