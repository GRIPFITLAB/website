import { describe, expect, it } from "vitest";

import { campaignSettings, emailDiscount, priceExperiment } from "@/lib/admin";
import {
  campaignBannerCopy,
  computePricing,
  emailLockButtonLabel,
  emailLockConfirmation,
  emailLockHeadline,
} from "@/lib/pricing";

/**
 * Copy ↔ number agreement.
 *
 * Every sentence that quotes a price is generated from the visitor's arm
 * (via `lib/pricing.ts`). These tests make sure the generated copy quotes
 * that arm's numbers — and only those — and that the old discount framing
 * (percent off, a fixed retail anchor) is gone.
 */

const ARMS = priceExperiment.arms;

/** Every `$NN` in a string, as numbers. */
function dollarsIn(copy: string): number[] {
  return [...copy.matchAll(/\$(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
}

describe("templates", () => {
  it("each carry exactly one {price} placeholder", () => {
    for (const template of [
      emailDiscount.headline,
      emailDiscount.buttonLabel,
      emailDiscount.confirmationCopy,
    ]) {
      expect(template.split("{price}")).toHaveLength(2);
    }
  });

  it("contain no percentages, hard-coded prices, or pre-order wording", () => {
    const all = [
      emailDiscount.headline,
      emailDiscount.buttonLabel,
      emailDiscount.confirmationCopy,
      emailDiscount.consentCopy,
      ...Object.values(campaignSettings.tierLabels),
      ...Object.values(campaignSettings.tierNotes).filter((note) => note !== null),
    ].join(" | ");
    expect(all).not.toMatch(/%/);
    expect(all).not.toMatch(/\$\d/);
    expect(all.toLowerCase()).not.toContain("pre-order");
  });
});

describe.each(ARMS)("arm $id copy", (arm) => {
  const p = computePricing(arm.id);

  it("headline and button quote only the lock price", () => {
    expect(dollarsIn(emailLockHeadline(p))).toEqual([arm.emailLockUSD]);
    expect(dollarsIn(emailLockButtonLabel(p))).toEqual([arm.emailLockUSD]);
  });

  it("banner quotes this arm's ceiling and lock, nothing else", () => {
    const copy = campaignBannerCopy(p);
    expect(dollarsIn(copy).sort((a, b) => a - b)).toEqual([
      arm.emailLockUSD,
      arm.kickstarterCeilingUSD,
    ]);
    expect(copy.toLowerCase()).toContain("never more than");
    expect(copy).not.toMatch(/%/);
  });
});

describe("confirmation", () => {
  it("quotes the price it is given (the email's actual lock)", () => {
    expect(dollarsIn(emailLockConfirmation(109))).toEqual([109]);
  });
});

describe("banner", () => {
  it("promises free shipping only when it is switched on", () => {
    const copy = campaignBannerCopy(computePricing(null));
    expect(/free\s+(us\s+)?shipping/i.test(copy)).toBe(campaignSettings.freeShipping);
  });

  it("ties the lock to email signup, not to a headcount", () => {
    const copy = campaignBannerCopy(computePricing(null));
    expect(copy.toLowerCase()).toContain("email");
    expect(copy).not.toMatch(/first\s+\d+/i);
  });
});

describe("tier labels", () => {
  it("use the launch terminology", () => {
    expect(campaignSettings.tierLabels).toEqual({
      superEarlyBird: "Early bird",
      kickstarter: "Kickstarter",
      retail: "Expected retail",
    });
  });

  it("tie the early bird price to email signup and nothing else", () => {
    expect(campaignSettings.tierNotes).toEqual({
      superEarlyBird: "With email signup",
      kickstarter: null,
      retail: null,
    });
  });
});

describe("code prefix", () => {
  it("is short and alphanumeric so it survives an email client", () => {
    expect(emailDiscount.codePrefix).toMatch(/^[A-Z0-9]{1,6}$/);
  });
});
