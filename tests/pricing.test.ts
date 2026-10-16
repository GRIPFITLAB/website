import { describe, expect, it } from "vitest";

import { emailDiscount, priceExperiment, productSettings } from "@/lib/admin";
import {
  computePricing,
  defaultPricing,
  formatUSD,
  isValidExperimentPrice,
  superEarlyBirdPrice,
} from "@/lib/pricing";

/**
 * Pricing maths (PRD R-004) — the three tiers and the per-visitor
 * experiment path. Pure functions; no mocks needed.
 */

describe("formatUSD", () => {
  it("drops cents for whole dollars", () => {
    expect(formatUSD(149)).toBe("$149");
  });

  it("keeps cents when present", () => {
    expect(formatUSD(111.75)).toBe("$111.75");
  });

  it("adds thousands separators", () => {
    expect(formatUSD(1249)).toBe("$1,249");
  });
});

describe("default pricing", () => {
  it("uses the admin numbers", () => {
    expect(defaultPricing.retail.amount).toBe(productSettings.retailPriceUSD);
    expect(defaultPricing.kickstarter.amount).toBe(productSettings.kickstarterPriceUSD);
    expect(defaultPricing.isExperimentPrice).toBe(false);
  });

  it("orders tiers Super Early Bird → Kickstarter → Retail", () => {
    expect(defaultPricing.tiers.map((t) => t.key)).toEqual([
      "superEarlyBird",
      "kickstarter",
      "retail",
    ]);
  });

  it("prices strictly increase across tiers", () => {
    const [seb, ks, retail] = defaultPricing.tiers;
    expect(seb.amount).toBeLessThan(ks.amount);
    expect(ks.amount).toBeLessThan(retail.amount);
  });

  it("derives Super Early Bird from Kickstarter × (1 − email%)", () => {
    expect(defaultPricing.superEarlyBird.amount).toBe(
      Math.round(productSettings.kickstarterPriceUSD * (1 - emailDiscount.percentOff)),
    );
    expect(superEarlyBirdPrice(100)).toBe(Math.round(100 * (1 - emailDiscount.percentOff)));
  });

  it("badges are whole-number percents off retail; retail has none", () => {
    expect(defaultPricing.retail.badge).toBe("");
    expect(defaultPricing.kickstarter.badge).toMatch(/^\d+% OFF$/);
    expect(defaultPricing.superEarlyBird.percentOffRetail).toBeGreaterThan(
      defaultPricing.kickstarter.percentOffRetail,
    );
  });
});

describe("experiment pricing", () => {
  it("accepts an in-range integer and flags it", () => {
    const p = computePricing(priceExperiment.minUSD);
    expect(p.kickstarter.amount).toBe(priceExperiment.minUSD);
    expect(p.isExperimentPrice).toBe(true);
    expect(p.superEarlyBird.amount).toBe(superEarlyBirdPrice(priceExperiment.minUSD));
  });

  it("falls back to the default for out-of-range or junk input", () => {
    for (const bad of [priceExperiment.maxUSD + 1, priceExperiment.minUSD - 1, 99.5, NaN, null]) {
      const p = computePricing(bad as number | null);
      expect(p.kickstarter.amount).toBe(productSettings.kickstarterPriceUSD);
      expect(p.isExperimentPrice).toBe(false);
    }
  });

  it("validates experiment prices", () => {
    expect(isValidExperimentPrice(priceExperiment.minUSD)).toBe(true);
    expect(isValidExperimentPrice(priceExperiment.maxUSD)).toBe(true);
    expect(isValidExperimentPrice(priceExperiment.maxUSD + 1)).toBe(false);
    expect(isValidExperimentPrice("100")).toBe(false);
  });

  it("every assignable price stays below retail at every tier", () => {
    for (let n = priceExperiment.minUSD; n <= priceExperiment.maxUSD; n++) {
      const p = computePricing(n);
      expect(p.kickstarter.amount).toBeLessThan(p.retail.amount);
      expect(p.superEarlyBird.amount).toBeLessThan(p.kickstarter.amount);
    }
  });
});
