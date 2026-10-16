"use client";

import { createContext, useContext, type ReactNode } from "react";

import { defaultPricing, type Pricing } from "@/lib/pricing";

/**
 * Client-side access to the visitor's pricing (and the ids the Pixel is
 * allowed to see). Populated once at the layout level by
 * `<VisitorProvider />`; read anywhere with `usePricing()`.
 *
 * The visitor id is deliberately NOT exposed here — nothing in the browser
 * needs it, and keeping it server-only means it can't leak into Pixel
 * events by accident.
 */
export interface PricingContextValue {
  pricing: Pricing;
  experimentId: string | null;
}

const PricingContext = createContext<PricingContextValue>({
  pricing: defaultPricing,
  experimentId: null,
});

export function PricingProvider({
  value,
  children,
}: {
  value: PricingContextValue;
  children: ReactNode;
}) {
  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing(): Pricing {
  return useContext(PricingContext).pricing;
}

export function useExperiment(): PricingContextValue {
  return useContext(PricingContext);
}
