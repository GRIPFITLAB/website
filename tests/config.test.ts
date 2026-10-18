import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  campaignSettings,
  emailDiscount,
  links,
  priceExperiment,
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
    expect(productConfig.base.preorder).toBe(productSettings.preorder);
  });

  it("passes site identity through", () => {
    expect(siteConfig.name).toBe(siteIdentity.name);
    expect(siteConfig.tagline).toBe(siteIdentity.tagline);
    expect(siteConfig.description).toBe(siteIdentity.description);
  });

  it("passes campaign + email settings through", () => {
    expect(discountConfig.campaign.freeShipping).toBe(campaignSettings.freeShipping);
    expect(discountConfig.campaign.ctaLabel).toBe(campaignSettings.ctaLabel);
    expect(discountConfig.campaign.tierLabels).toBe(campaignSettings.tierLabels);
    expect(discountConfig.campaign.tierNotes).toBe(campaignSettings.tierNotes);

    expect(discountConfig.email.consentCopy).toBe(emailDiscount.consentCopy);
    expect(discountConfig.email.codePrefix).toBe(emailDiscount.codePrefix);
    expect(discountConfig.experiment).toBe(priceExperiment);
  });

  it("re-exports the link surface, mailboxes defaulting to admin values", () => {
    expect(externalLinks).toEqual(links);
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

describe("price experiment settings", () => {
  it("has five arms", () => {
    expect(priceExperiment.arms).toHaveLength(5);
  });

  it("has a cookie-safe experiment id", () => {
    expect(priceExperiment.id).toMatch(/^[a-z0-9-]+$/);
  });

  it("is the experiment the export script reports on by default", () => {
    const script = readFileSync(
      fileURLToPath(new URL("../scripts/export-leads.mjs", import.meta.url)),
      "utf8",
    );
    expect(script).toContain(`const CURRENT_EXPERIMENT = "${priceExperiment.id}";`);
  });
});

describe("no placeholder values ship as live config", () => {
  it("has a real support email", () => {
    expect(externalLinks.supportEmail).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("has a real legal email", () => {
    expect(externalLinks.legalEmail).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("has a non-empty tagline and description", () => {
    expect(siteConfig.tagline.trim().length).toBeGreaterThan(0);
    expect(siteConfig.description.trim().length).toBeGreaterThan(0);
    // Meta descriptions get truncated by search engines past ~160 chars.
    expect(siteConfig.description.length).toBeLessThanOrEqual(160);
  });
});
