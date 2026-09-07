import { describe, expect, it } from "vitest";

import { productSettings, campaignDiscount, emailDiscount } from "@/lib/admin";
import {
  formatUSD,
  getPreorderPricing,
  getStackedPreorderPricing,
} from "@/lib/config";

/**
 * Pricing math (PRD R-002, R-003, R-004).
 *
 * The literal expectations below are the numbers the stakeholder signed
 * off on. They are asserted as literals on purpose: if someone changes a
 * percentage in `lib/admin.ts`, this test must fail loudly rather than
 * quietly recomputing and agreeing with itself.
 */

describe("configured values", () => {
  it("uses the agreed MSRP and discounts", () => {
    expect(productSettings.listPriceUSD).toBe(149);
    expect(campaignDiscount.percentOff).toBe(0.25);
    expect(emailDiscount.percentOff).toBe(0.15);
  });
});

describe("getPreorderPricing", () => {
  it("applies the campaign discount to the list price", () => {
    const { list, sale, savings } = getPreorderPricing();
    expect(list).toBe(149);
    expect(sale).toBeCloseTo(111.75, 10);
    expect(savings).toBeCloseTo(37.25, 10);
  });

  it("formats to the strings shown on the site", () => {
    const { formattedList, formattedSale } = getPreorderPricing();
    expect(formattedList).toBe("$149");
    expect(formattedSale).toBe("$111.75");
  });
});

describe("getStackedPreorderPricing", () => {
  it("stacks the email discount on the campaign price, not the list", () => {
    const { campaignSale, stacked } = getStackedPreorderPricing();
    expect(campaignSale).toBeCloseTo(111.75, 10);
    // 111.75 × 0.85 — NOT 149 × (1 − 0.25 − 0.15)
    expect(stacked).toBeCloseTo(94.9875, 10);
    expect(stacked).not.toBeCloseTo(149 * 0.6, 4);
  });

  it("reports the combined percentage off list", () => {
    const { totalPercentOff } = getStackedPreorderPricing();
    expect(totalPercentOff).toBeCloseTo(0.3625, 10);
  });

  it("formats to the strings shown on the site", () => {
    const { formattedStacked, formattedSavings, formattedList } =
      getStackedPreorderPricing();
    expect(formattedList).toBe("$149");
    expect(formattedStacked).toBe("$94.99");
    expect(formattedSavings).toBe("$54.01");
  });
});

describe("formatUSD", () => {
  it("drops cents on whole dollars and keeps them otherwise", () => {
    expect(formatUSD(149)).toBe("$149");
    expect(formatUSD(111.75)).toBe("$111.75");
    expect(formatUSD(94.9875)).toBe("$94.99");
    expect(formatUSD(0)).toBe("$0");
  });
});
