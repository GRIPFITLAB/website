/**
 * Browser-side Meta Pixel helpers. Client-safe; no-ops on the server and
 * when the Pixel isn't loaded (no id configured, blocked by the browser).
 *
 * Rules (see DECISIONS.md §17): never put an email address or any other
 * directly identifying value in event parameters. Prices and the
 * experiment id are fine — they describe the offer, not the person.
 */

type FbqArgs =
  | ["init", string]
  | ["track", string, Record<string, unknown>?, { eventID?: string }?]
  | ["trackCustom", string, Record<string, unknown>?, { eventID?: string }?];

interface Fbq {
  (...args: FbqArgs): void;
  callMethod?: (...args: FbqArgs) => void;
  queue?: FbqArgs[];
  push?: Fbq;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Standard event parameters we attach to every event. */
export interface PixelEventParams {
  assigned_price?: number;
  experiment_id?: string;
  currency?: "USD";
  value?: number;
  content_name?: string;
}

/** Stable per-event id the server reuses for CAPI dedup. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  return window.fbq ?? null;
}

export function trackPageView(params: PixelEventParams, eventId: string): void {
  fbq()?.("track", "PageView", { ...params }, { eventID: eventId });
}

export function trackLead(params: PixelEventParams, eventId: string): void {
  fbq()?.("track", "Lead", { ...params }, { eventID: eventId });
}
