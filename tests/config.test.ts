import { describe, expect, it } from "vitest";

import {
  campaignDiscount,
  emailDiscount,
  links,
  productSettings,
  siteIdentity,
} from "@/lib/admin";
import {
  campaign,
  discountConfig,
  externalLinks,
  productConfig,
  siteConfig,
} from "@/lib/config";

/**
 * `lib/admin.ts` → `lib/config.ts` invariants (PRD R-001).
 *
 * `admin.ts` is the control panel a non-developer edits. These tests
 * assert every value actually reaches the typed config the components
 * read, so an edit there can't silently fail to take effect.
 */

describe("admin values reach the typed config", () => {
  it("passes product settings through", () => {
    expect(productConfig.base.name).toBe(productSettings.name);
    expect(productConfig.base.handle).toBe(productSettings.handle);
    expect(productConfig.base.fallbackPriceUSD).toBe(
      productSettings.listPriceUSD,
    );
    expect(productConfig.base.preorder).toBe(productSettings.preorder);
  });

  it("passes site identity through", () => {
    expect(siteConfig.name).toBe(siteIdentity.name);
    expect(siteConfig.tagline).toBe(siteIdentity.tagline);
    expect(siteConfig.description).toBe(siteIdentity.description);
  });

  it("passes both discounts through", () => {
    expect(discountConfig.preorder.percentOff).toBe(campaignDiscount.percentOff);
    expect(discountConfig.preorder.freeShipping).toBe(
      campaignDiscount.freeShipping,
    );
    expect(discountConfig.preorder.bannerCopy).toBe(campaignDiscount.bannerCopy);
    expect(discountConfig.preorder.ctaLabel).toBe(campaignDiscount.ctaLabel);

    expect(discountConfig.email.percentOff).toBe(emailDiscount.percentOff);
    expect(discountConfig.email.headline).toBe(emailDiscount.headline);
    expect(discountConfig.email.body).toBe(emailDiscount.body);
  });

  it("re-exports the link surface unchanged", () => {
    expect(externalLinks).toBe(links);
  });
});

describe("computed discount labels", () => {
  it("derives the badge text from the percentage", () => {
    expect(discountConfig.preorder.label).toBe("25% OFF");
    expect(discountConfig.email.label).toBe("EXTRA 15% OFF");
  });
});

describe("campaign link", () => {
  it("falls back to the on-site holding page while the URL is unset", () => {
    if (links.crowdfundingUrl === null) {
      expect(campaign.isLive).toBe(false);
      expect(campaign.href).toBe("/kickstarter");
      // An internal route must not open in a new tab.
      expect(campaign.linkProps.target).toBeUndefined();
    } else {
      expect(campaign.isLive).toBe(true);
      expect(campaign.href).toBe(links.crowdfundingUrl);
      expect(campaign.linkProps.target).toBe("_blank");
      expect(campaign.linkProps.rel).toBe("noopener noreferrer");
    }
  });

  it("never points a CTA at a dead anchor", () => {
    expect(campaign.href).not.toBe("");
    expect(campaign.href).not.toBe("#");
  });
});

describe("no placeholder values ship as live config", () => {
  it("has a real support email", () => {
    expect(externalLinks.supportEmail).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("has a non-empty tagline and description", () => {
    expect(siteConfig.tagline.trim().length).toBeGreaterThan(0);
    expect(siteConfig.description.trim().length).toBeGreaterThan(0);
    // Meta descriptions get truncated by search engines past ~160 chars.
    expect(siteConfig.description.length).toBeLessThanOrEqual(160);
  });
});
