import { NextResponse, type NextRequest } from "next/server";

import { priceExperiment } from "@/lib/admin";
import {
  assignmentCookieOptions,
  createAssignment,
  decodeAssignment,
  encodeAssignment,
} from "@/lib/experiment/assignment";
import {
  attributionCookieOptions,
  decodeAttribution,
  encodeAttribution,
  hasAttributionParams,
  parseAttribution,
} from "@/lib/experiment/attribution";
import {
  ASSIGNMENT_COOKIE,
  ASSIGNMENT_HEADER,
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_HEADER,
  NEW_VISITOR_HEADER,
} from "@/lib/experiment/constants";

/**
 * Proxy — runs before every page render (Next.js 16 renamed `middleware`).
 *
 * Two jobs, both for the price experiment (DECISIONS.md §17):
 *
 *   1. **Assign a price arm.** If the visitor has no valid signed
 *      assignment cookie (first visit, forged cookie, or a new experiment
 *      id), draw one of the configured arms at random, mint a visitor id,
 *      and set the signed cookie. The same values are forwarded to the
 *      render as request headers so the *first* page already shows the
 *      assigned prices — a Set-Cookie isn't visible to the request it
 *      rides on.
 *
 *   2. **Capture attribution.** First-touch only: if there's no attribution
 *      cookie yet, or the URL carries UTM / Meta parameters and the cookie
 *      has none, record them.
 *
 * Nothing here talks to a database — the proxy must stay fast. The render
 * sees `x-gf-new: 1` and persists the exposure via `after()`.
 */
export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const secure = request.nextUrl.protocol === "https:";

  let assignmentValue = request.cookies.get(ASSIGNMENT_COOKIE)?.value ?? null;
  let attributionValue = request.cookies.get(ATTRIBUTION_COOKIE)?.value ?? null;
  let setAssignment: string | null = null;
  let setAttribution: string | null = null;

  // ── 1. Price assignment ────────────────────────────────────────────
  if (priceExperiment.enabled) {
    const existing = await decodeAssignment(assignmentValue);
    if (!existing) {
      setAssignment = await encodeAssignment(createAssignment());
      assignmentValue = setAssignment;
      requestHeaders.set(NEW_VISITOR_HEADER, "1");
    }
    if (assignmentValue) requestHeaders.set(ASSIGNMENT_HEADER, assignmentValue);
  }

  // ── 2. Attribution (first touch) ───────────────────────────────────
  const existingAttr = decodeAttribution(attributionValue);
  const urlHasParams = hasAttributionParams(request.nextUrl);
  const existingHasParams =
    existingAttr !== null &&
    Object.keys(existingAttr).some(
      (k) => !["landing_path", "referrer_host", "first_seen_at"].includes(k),
    );
  if (!existingAttr || (urlHasParams && !existingHasParams)) {
    const attr = parseAttribution(request.nextUrl, request.headers.get("referer"));
    setAttribution = encodeAttribution(attr);
    attributionValue = setAttribution;
  }
  if (attributionValue) requestHeaders.set(ATTRIBUTION_HEADER, attributionValue);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (setAssignment) {
    response.cookies.set(ASSIGNMENT_COOKIE, setAssignment, assignmentCookieOptions(secure));
  }
  if (setAttribution) {
    response.cookies.set(ATTRIBUTION_COOKIE, setAttribution, attributionCookieOptions(secure));
  }
  return response;
}

export const config = {
  matcher: [
    // Pages only — skip Next internals, static assets, and metadata files.
    {
      source:
        "/((?!_next/static|_next/image|fonts/|app/|brand/|favicon.ico|icon.png|apple-icon.png|sitemap.xml|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
