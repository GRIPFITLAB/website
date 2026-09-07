import { describe, expect, it } from "vitest";

import { campaignDiscount, emailDiscount } from "@/lib/admin";
import { getStackedPreorderPricing } from "@/lib/config";

/**
 * Copy ↔ number agreement (PRD R-005).
 *
 * Percentages appear twice in `lib/admin.ts`: once as a number the maths
 * uses, once inside a human sentence. Nothing but this test stops the two
 * from drifting when someone edits one and forgets the other — which is
 * exactly the bug that ships "30% off" banners on a 25%-off product.
 */

const campaignPct = Math.round(campaignDiscount.percentOff * 100);
const emailPct = Math.round(emailDiscount.percentOff * 100);

/** Every `NN%` in a string, as numbers. */
function percentsIn(copy: string): number[] {
  return [...copy.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => Number(m[1]));
}

describe("campaign banner copy", () => {
  it("quotes the campaign percentage and no other", () => {
    expect(percentsIn(campaignDiscount.bannerCopy)).toEqual([campaignPct]);
  });

  it("promises free shipping only when it is switched on", () => {
    const mentionsShipping = /free\s+(us\s+)?shipping/i.test(
      campaignDiscount.bannerCopy,
    );
    expect(mentionsShipping).toBe(campaignDiscount.freeShipping);
  });
});

describe("email-discount copy", () => {
  it("quotes only the email percentage in the headline", () => {
    expect(percentsIn(emailDiscount.headline)).toEqual([emailPct]);
  });

  it("quotes both percentages in the body, in stacking order", () => {
    // The body explains the stack: "extra 15% ... on top of the 25%".
    expect(percentsIn(emailDiscount.body)).toEqual([emailPct, campaignPct]);
  });

  it("describes the offer as stacking, not replacing", () => {
    expect(emailDiscount.body.toLowerCase()).toContain("on top of");
  });
});

describe("code prefix", () => {
  it("is short and alphanumeric so it survives an email client", () => {
    expect(emailDiscount.codePrefix).toMatch(/^[A-Z0-9]{1,6}$/);
  });
});

describe("stacked pricing is worth advertising", () => {
  it("beats the campaign price", () => {
    const { campaignSale, stacked } = getStackedPreorderPricing();
    expect(stacked).toBeLessThan(campaignSale);
  });
});
