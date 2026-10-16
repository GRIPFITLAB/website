import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { computePricing, type Pricing } from "@/lib/pricing";

import { decodeAssignment, type Assignment } from "./assignment";
import { decodeAttribution, type Attribution } from "./attribution";
import {
  ASSIGNMENT_COOKIE,
  ASSIGNMENT_HEADER,
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_HEADER,
  META_FBC_COOKIE,
  META_FBP_COOKIE,
  NEW_VISITOR_HEADER,
} from "./constants";

/**
 * Everything the server knows about the current visitor.
 *
 * Read once per request (React `cache`) from the request headers the proxy
 * forwarded, falling back to cookies for requests the proxy didn't touch
 * (Server Action POSTs carry cookies, not the forwarded headers).
 */
export interface VisitorContext {
  assignment: Assignment | null;
  attribution: Attribution | null;
  /** True only on the request where the proxy minted the assignment. */
  isNewVisitor: boolean;
  pricing: Pricing;
  /** Meta's browser cookies, if present — for Conversions API matching. */
  fbp: string | null;
  fbc: string | null;
  userAgent: string | null;
  clientIp: string | null;
  /** Vercel geo header, when deployed there. */
  country: string | null;
}

export const getVisitorContext = cache(async (): Promise<VisitorContext> => {
  const [h, c] = await Promise.all([headers(), cookies()]);

  const assignment = await decodeAssignment(
    h.get(ASSIGNMENT_HEADER) ?? c.get(ASSIGNMENT_COOKIE)?.value,
  );
  const attribution = decodeAttribution(
    h.get(ATTRIBUTION_HEADER) ?? c.get(ATTRIBUTION_COOKIE)?.value,
  );

  const forwarded = h.get("x-forwarded-for");
  const clientIp = forwarded?.split(",")[0]?.trim() || null;

  return {
    assignment,
    attribution,
    isNewVisitor: h.get(NEW_VISITOR_HEADER) === "1",
    pricing: computePricing(assignment?.price ?? null),
    fbp: c.get(META_FBP_COOKIE)?.value ?? null,
    fbc: c.get(META_FBC_COOKIE)?.value ?? null,
    userAgent: h.get("user-agent"),
    clientIp,
    country: h.get("x-vercel-ip-country"),
  };
});

/** Convenience for components that only need prices. */
export async function getVisitorPricing(): Promise<Pricing> {
  return (await getVisitorContext()).pricing;
}
