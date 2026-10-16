import { describe, expect, it } from "vitest";

import { campaignSettings, emailDiscount, priceExperiment, productSettings } from "@/lib/admin";
import { campaignBannerCopy, computePricing, emailDiscountHeadline } from "@/lib/pricing";

/**
 * Copy ↔ number agreement (PRD R-005).
 *
 * Every sentence that quotes a price or a percentage is generated from the
 * numbers in `lib/admin.ts` (via `lib/pricing.ts`). These tests make sure
 * the generated copy actually matches the numbers, and that the terminology
 * the user asked for ("Super Early Bird" / "Kickstarter" / "Retail") is
 * what ships.
 */

const emailPct = Math.round(emailDiscount.percentOff * 100);

/** Every `NN%` in a string, as numbers. */
function percentsIn(copy: string): number[] {
  return [...copy.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => Number(m[1]));
}

describe("email-discount headline", () => {
  it("quotes only the email percentage", () => {
    expect(percentsIn(emailDiscountHeadline())).toEqual([emailPct]);
  });

  it("has no unresolved placeholder", () => {
    expect(emailDiscountHeadline()).not.toContain("{percent}");
  });

  it("says Kickstarter, not pre-order", () => {
    expect(emailDiscountHeadline().toLowerCase()).not.toContain("pre-order");
    expect(emailDiscount.consentCopy.toLowerCase()).not.toContain("pre-order");
    expect(emailDiscount.confirmationCopy.toLowerCase()).not.toContain("pre-order");
  });
});

describe("campaign banner copy", () => {
  const pricing = computePricing(null);
  const copy = campaignBannerCopy(pricing);

  it("quotes the Kickstarter and Super Early Bird prices", () => {
    expect(copy).toContain(pricing.kickstarter.formatted);
    expect(copy).toContain(pricing.superEarlyBird.formatted);
  });

  it("ties Super Early Bird to email signup, not to a headcount", () => {
    expect(copy.toLowerCase()).toContain("email");
    expect(copy).not.toMatch(/first\s+\d+/i);
  });

  it("promises free shipping only when it is switched on", () => {
    expect(/free\s+(us\s+)?shipping/i.test(copy)).toBe(campaignSettings.freeShipping);
  });
});

describe("tier labels", () => {
  it("use the launch terminology", () => {
    expect(campaignSettings.tierLabels).toEqual({
      superEarlyBird: "Super Early Bird",
      kickstarter: "Kickstarter",
      retail: "Retail",
    });
  });

  it("never mention a limited quantity", () => {
    expect(campaignSettings.superEarlyBirdNote).not.toMatch(/\d+\s*(people|backers|units)/i);
  });
});

describe("code prefix", () => {
  it("is short and alphanumeric so it survives an email client", () => {
    expect(emailDiscount.codePrefix).toMatch(/^[A-Z0-9]{1,6}$/);
  });
});

describe("experiment range vs retail", () => {
  it("never shows a Kickstarter price at or above retail", () => {
    expect(priceExperiment.maxUSD).toBeLessThan(productSettings.retailPriceUSD);
    expect(productSettings.kickstarterPriceUSD).toBeLessThan(productSettings.retailPriceUSD);
  });
});
