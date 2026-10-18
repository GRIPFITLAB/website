import { describe, expect, it } from "vitest";

import { priceExperiment } from "@/lib/admin";
import {
  computePricing,
  defaultPricing,
  discountBadge,
  formatUSD,
  isValidArmId,
  priceArm,
  savingPct,
} from "@/lib/pricing";

/**
 * Pricing maths — the five price arms and the per-visitor path. Pure
 * functions; no mocks needed.
 */

const ARMS = priceExperiment.arms;

describe("formatUSD", () => {
  it("drops cents for whole dollars", () => {
    expect(formatUSD(129)).toBe("$129");
  });

  it("keeps cents when present", () => {
    expect(formatUSD(84.5)).toBe("$84.50");
  });

  it("adds thousands separators", () => {
    expect(formatUSD(1249)).toBe("$1,249");
  });
});

describe("arm table", () => {
  it("matches the agreed arms exactly", () => {
    expect(ARMS.map((a) => [a.id, a.retailUSD, a.kickstarterCeilingUSD, a.emailLockUSD])).toEqual([
      [1, 103, 82, 69],
      [2, 124, 99, 84],
      [3, 162, 129, 109],
      [4, 199, 159, 135],
      [5, 249, 199, 169],
    ]);
  });

  it("prices Kickstarter at a rounded 20% under retail in every arm", () => {
    for (const arm of ARMS) {
      expect(savingPct(arm.kickstarterCeilingUSD, arm.retailUSD)).toBe(20);
    }
  });

  it("numbers arms 1..n in order", () => {
    expect(ARMS.map((a) => a.id)).toEqual(ARMS.map((_, i) => i + 1));
  });

  it("orders lock < ceiling < retail within every arm, in whole dollars", () => {
    for (const arm of ARMS) {
      expect(arm.emailLockUSD).toBeLessThan(arm.kickstarterCeilingUSD);
      expect(arm.kickstarterCeilingUSD).toBeLessThan(arm.retailUSD);
      for (const n of [arm.emailLockUSD, arm.kickstarterCeilingUSD, arm.retailUSD]) {
        expect(Number.isInteger(n)).toBe(true);
      }
    }
  });

  it("has a default arm that exists", () => {
    expect(priceArm(priceExperiment.defaultArmId)).not.toBeNull();
  });
});

describe("computePricing", () => {
  it("shows exactly the assigned arm's three numbers", () => {
    for (const arm of ARMS) {
      const p = computePricing(arm.id);
      expect(p.armId).toBe(arm.id);
      expect(p.isExperimentPrice).toBe(true);
      expect(p.superEarlyBird.amount).toBe(arm.emailLockUSD);
      expect(p.kickstarter.amount).toBe(arm.kickstarterCeilingUSD);
      expect(p.retail.amount).toBe(arm.retailUSD);
    }
  });

  it("orders tiers Super Early Bird → Kickstarter → Expected retail", () => {
    expect(defaultPricing.tiers.map((t) => t.key)).toEqual([
      "superEarlyBird",
      "kickstarter",
      "retail",
    ]);
  });

  it("falls back to the default arm, unflagged, for missing or junk input", () => {
    for (const bad of [null, undefined, 0, ARMS.length + 1, 2.5, NaN, "2"]) {
      const p = computePricing(bad as number | null);
      expect(p.armId).toBe(priceExperiment.defaultArmId);
      expect(p.isExperimentPrice).toBe(false);
    }
  });

  it("badges each tier with its rounded saving against the next tier up", () => {
    const expected: Record<number, [number, number]> = {
      1: [16, 20],
      2: [15, 20],
      3: [16, 20],
      4: [15, 20],
      5: [15, 20],
    };
    for (const arm of ARMS) {
      const [seb, ks, retail] = computePricing(arm.id).tiers;
      const [sebPct, ksPct] = expected[arm.id]!;
      expect([seb.discountPct, ks.discountPct]).toEqual([sebPct, ksPct]);
      expect(retail.discountPct).toBeNull();
      expect(discountBadge(seb)).toBe(`${sebPct}% off`);
      expect(discountBadge(retail)).toBeNull();
    }
  });
});

describe("isValidArmId", () => {
  it("accepts configured arm ids only", () => {
    expect(ARMS.every((a) => isValidArmId(a.id))).toBe(true);
    expect(isValidArmId(0)).toBe(false);
    expect(isValidArmId(ARMS.length + 1)).toBe(false);
    expect(isValidArmId("1")).toBe(false);
  });
});
