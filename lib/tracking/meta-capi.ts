import "server-only";

import { env, isMetaCapiConfigured } from "@/lib/env";

/**
 * Meta Conversions API — server-side mirror of the browser Pixel.
 *
 * Why both: ad blockers and Safari drop a meaningful share of Pixel events;
 * CAPI reports from the server regardless. Meta deduplicates the two when
 * they share `event_name` + `event_id`, so the browser generates the id and
 * sends it along with the form.
 *
 * What is sent to Meta:
 *   - the event name, time, id, source URL
 *   - `user_data`: SHA-256 **hashed** email (never the plaintext — Meta's
 *     spec requires the hash), client IP + UA, and Meta's own `_fbp` /
 *     `_fbc` cookies. Hashing is the documented CAPI contract; nothing
 *     identifying goes in ordinary event parameters.
 *   - `custom_data`: assigned price + experiment id, so Meta-side
 *     breakdowns can be sliced by price too (the site DB stays canonical).
 *
 * Degrades to a log line without `META_CAPI_ACCESS_TOKEN`.
 */

const GRAPH_VERSION = "v21.0";

export interface MetaEventInput {
  eventName: "PageView" | "Lead" | "ViewContent";
  eventId: string;
  eventSourceUrl: string | null;
  email?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  customData?: Record<string, string | number | boolean | null>;
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sendMetaEvent(input: MetaEventInput): Promise<void> {
  if (!isMetaCapiConfigured || !env.NEXT_PUBLIC_META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) {
    console.info("[meta-capi] not configured — skipped", {
      event: input.eventName,
      eventId: input.eventId,
    });
    return;
  }

  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [await sha256Hex(input.email.trim().toLowerCase())];
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
        user_data: userData,
        ...(input.customData ? { custom_data: input.customData } : {}),
      },
    ],
  };
  if (env.META_TEST_EVENT_CODE) body.test_event_code = env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${env.NEXT_PUBLIC_META_PIXEL_ID}/events?access_token=${encodeURIComponent(env.META_CAPI_ACCESS_TOKEN)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      console.error("[meta-capi] rejected", res.status, await res.text().catch(() => ""));
    }
  } catch (error) {
    console.error("[meta-capi] request failed", error);
  }
}
