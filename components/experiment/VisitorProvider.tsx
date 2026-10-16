import { after } from "next/server";
import type { ReactNode } from "react";

import { PricingProvider } from "@/components/experiment/PricingContext";
import { getVisitorContext } from "@/lib/experiment/server";
import { recordVisitor } from "@/lib/experiment/store";

/**
 * Server Component mounted once in `app/layout.tsx`.
 *
 *   1. Reads the visitor's price assignment + attribution (set by the
 *      proxy) during render — before `after()`, as Next requires.
 *   2. On the request that minted the assignment, persists the exposure to
 *      Firestore *after* the response is sent, so the DB write never slows
 *      the page.
 *   3. Hands the computed pricing to client components via context.
 */
export async function VisitorProvider({ children }: { children: ReactNode }) {
  const ctx = await getVisitorContext();

  if (ctx.isNewVisitor && ctx.assignment) {
    const { assignment, pricing, attribution, userAgent, country } = ctx;
    after(() => recordVisitor({ assignment, pricing, attribution, userAgent, country }));
  }

  return (
    <PricingProvider
      value={{
        pricing: ctx.pricing,
        experimentId: ctx.assignment?.experimentId ?? null,
      }}
    >
      {children}
    </PricingProvider>
  );
}
