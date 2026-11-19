import { describe, expect, it } from "vitest";

import { priceExperiment } from "@/lib/admin";
import {
  armStats,
  breakdown,
  dailySeries,
  inRange,
  parseDateRange,
  parseExperimentSelection,
  rangeBounds,
  summarize,
  wilsonInterval,
} from "@/lib/dashboard/metrics";
import {
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
  credentialsMatch,
  isAdminPath,
  verifySessionToken,
} from "@/lib/dashboard/session";
import type { LeadRow, VisitorRow } from "@/lib/experiment/store";

/**
 * `/admin` — session tokens must not be forgeable or outlive their TTL,
 * and the dashboard numbers must count the same way `export-leads.mjs` does.
 */

const KEY = { secret: "test-secret-0123456789", email: "Owner@Example.com", passcode: "hunter2-pass" };

describe("admin session tokens", () => {
  it("round-trips a fresh token", async () => {
    const token = await createSessionToken(KEY);
    expect(await verifySessionToken(token, KEY)).toBe(true);
  });

  it("rejects an expired token", async () => {
    const issued = Date.now() - (ADMIN_SESSION_TTL_SECONDS + 1) * 1000;
    const token = await createSessionToken(KEY, issued);
    expect(await verifySessionToken(token, KEY)).toBe(false);
  });

  it("rejects a token with an extended expiry", async () => {
    const token = await createSessionToken(KEY);
    const [v, exp, sig] = token.split(".");
    const forged = `${v}.${Number(exp) + 86_400}.${sig}`;
    expect(await verifySessionToken(forged, KEY)).toBe(false);
  });

  it("is invalidated by rotating the passcode", async () => {
    const token = await createSessionToken(KEY);
    expect(await verifySessionToken(token, { ...KEY, passcode: "rotated" })).toBe(false);
  });

  it("rejects junk", async () => {
    for (const junk of [null, undefined, "", "v1", "v1.1.2.3", "v2.9999999999.abc"]) {
      expect(await verifySessionToken(junk, KEY)).toBe(false);
    }
  });
});

describe("credentialsMatch", () => {
  const expected = { email: "owner@example.com", passcode: "S3cret!" };

  it("accepts the pair, email case-insensitively", async () => {
    expect(await credentialsMatch({ email: " Owner@Example.com ", passcode: "S3cret!" }, expected)).toBe(true);
  });

  it("rejects a wrong half", async () => {
    expect(await credentialsMatch({ email: "owner@example.com", passcode: "s3cret!" }, expected)).toBe(false);
    expect(await credentialsMatch({ email: "other@example.com", passcode: "S3cret!" }, expected)).toBe(false);
  });
});

describe("isAdminPath", () => {
  it("matches /admin and below only", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/x")).toBe(true);
    expect(isAdminPath("/administrator")).toBe(false);
    expect(isAdminPath("/")).toBe(false);
  });
});

function lead(overrides: Partial<LeadRow>): LeadRow {
  return {
    id: Math.random().toString(36),
    email: "a@example.com",
    discountCode: "GF-TEST",
    experimentId: priceExperiment.id,
    visitorId: null,
    priceArm: 1,
    lockedPrice: 69,
    displayedArm: 1,
    isExperimentPrice: true,
    excludedFromExperiment: false,
    firstSource: "modal",
    lastSource: "modal",
    submitCount: 1,
    createdAt: Date.now(),
    lastSubmittedAt: Date.now(),
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    campaignId: null,
    adsetId: null,
    adId: null,
    placement: null,
    landingPath: null,
    referrerHost: null,
    ...overrides,
  };
}

describe("dashboard metrics", () => {
  const current = { id: priceExperiment.id, arms: priceExperiment.arms };
  const visitor = (visitorId: string, priceArm: number, overrides: Partial<VisitorRow> = {}): VisitorRow => ({
    visitorId,
    experimentId: priceExperiment.id,
    priceArm,
    kickstarterCeiling: null,
    emailLockPrice: null,
    expectedRetail: null,
    firstSeenAt: Date.now(),
    ...overrides,
  });
  const visitors: VisitorRow[] = [
    ...Array.from({ length: 100 }, (_, i) => visitor(`v1-${i}`, 1)),
    ...Array.from({ length: 50 }, (_, i) => visitor(`v5-${i}`, 5)),
  ];
  const leads: LeadRow[] = [
    ...Array.from({ length: 10 }, () => lead({ priceArm: 1 })),
    ...Array.from({ length: 4 }, () => lead({ priceArm: 5 })),
    // Not counted: a default-arm visitor, and an arm with no known prices.
    lead({ priceArm: 3, isExperimentPrice: false }),
    lead({ priceArm: 2, experimentId: "older-experiment" }),
  ];

  const stats = armStats(current, visitors, leads, true);

  it("merges experiments by the Kickstarter price each arm actually showed", () => {
    const old = [
      // Old arm 7 showed $99 — the same price as current arm 2.
      ...Array.from({ length: 20 }, (_, i) =>
        visitor(`old-${i}`, 7, { experimentId: "old", kickstarterCeiling: 99, emailLockPrice: 80, expectedRetail: 120 }),
      ),
    ];
    const oldLeads = [lead({ experimentId: "old", priceArm: 7 }), lead({ priceArm: 2 })];
    const merged = armStats(current, [...old, visitor("c2", 2)], oldLeads, true).find((s) => s.key === 99);
    expect(merged).toMatchObject({ impressions: 21, signups: 2, armId: null });
    expect(merged?.experimentIds).toEqual(["old", priceExperiment.id].sort());
  });

  it("omits current arms with no traffic when the current experiment isn't selected", () => {
    expect(armStats(current, [], [], false)).toEqual([]);
    expect(armStats(current, [], [], true)).toHaveLength(priceExperiment.arms.length);
  });

  it("counts impressions and experiment signups per arm", () => {
    const byId = new Map(stats.map((s) => [s.armId, s]));
    expect(byId.get(1)).toMatchObject({ impressions: 100, signups: 10, rate: 0.1 });
    expect(byId.get(5)).toMatchObject({ impressions: 50, signups: 4, rate: 0.08 });
    expect(byId.get(2)).toMatchObject({ impressions: 0, signups: 0, rate: null, revenueIndex: null });
    expect(byId.get(3)?.signups).toBe(0);
  });

  it("drops an excluded signup and its visitor's impression", () => {
    const withExcluded = [...leads, lead({ priceArm: 1, visitorId: "v1-0", excludedFromExperiment: true })];
    const arm1 = armStats(current, visitors, withExcluded, true).find(
      (s) => s.armId === 1,
    );
    expect(arm1).toMatchObject({ impressions: 99, signups: 10 });
  });

  it("brackets the rate with the Wilson interval", () => {
    for (const s of stats) {
      if (s.rate === null) continue;
      expect(s.ciLow!).toBeLessThanOrEqual(s.rate);
      expect(s.ciHigh!).toBeGreaterThanOrEqual(s.rate);
    }
    expect(wilsonInterval(0, 0)).toBeNull();
    const [lo, hi] = wilsonInterval(0, 20)!;
    expect(lo).toBe(0);
    expect(hi).toBeGreaterThan(0);
  });

  it("picks the revenue-optimal arm, not the highest rate", () => {
    const kpis = summarize(stats, leads);
    // Arm 1: 10% × $82 = $8,200/1k; arm 5: 8% × $199 = $15,920/1k.
    expect(kpis.bestArm?.armId).toBe(5);
    expect(kpis.totalSubscribers).toBe(leads.length);
    expect(kpis.impressions).toBe(150);
    expect(kpis.experimentSignups).toBe(14);
  });

  it("zero-fills the daily series across the range", () => {
    const now = Date.now();
    const series = dailySeries(visitors, leads, now - 29 * 86_400_000, now);
    expect(series).toHaveLength(30);
    expect(series.at(-1)).toMatchObject({ visitors: 150, signups: leads.length });
    expect(series[0]).toMatchObject({ visitors: 0, signups: 0 });
  });

  it("folds the long tail into Other", () => {
    const rows = ["a", "b", "c", "d", "e", "f", "g"].map((s) => lead({ firstSource: s }));
    const items = breakdown(rows, (l) => l.firstSource ?? "", 3);
    expect(items).toHaveLength(4);
    expect(items.at(-1)).toEqual({ label: "Other", count: 4 });
  });
});

describe("dashboard filters", () => {
  it("keeps only known experiment ids; empty means no filter", () => {
    const known = ["a", "b"];
    expect(parseExperimentSelection(undefined, known)).toBeNull();
    expect(parseExperimentSelection(["a", "zzz", "a"], known)).toEqual(["a"]);
    expect(parseExperimentSelection("a,b", known)).toEqual(["a", "b"]);
    expect(parseExperimentSelection("zzz", known)).toBeNull();
  });

  it("validates and orders the date range", () => {
    expect(parseDateRange("2026-11-01", "2026-11-18")).toEqual({ from: "2026-11-01", to: "2026-11-18" });
    expect(parseDateRange("2026-11-18", "2026-11-01")).toEqual({ from: "2026-11-01", to: "2026-11-18" });
    expect(parseDateRange("2026-02-30", "nope")).toEqual({ from: null, to: null });
  });

  it("treats `to` as inclusive of the whole UTC day", () => {
    const bounds = rangeBounds({ from: "2026-11-01", to: "2026-11-01" });
    expect(inRange(Date.parse("2026-11-01T00:00:00Z"), bounds)).toBe(true);
    expect(inRange(Date.parse("2026-11-01T23:59:59Z"), bounds)).toBe(true);
    expect(inRange(Date.parse("2026-11-02T00:00:00Z"), bounds)).toBe(false);
    expect(inRange(null, bounds)).toBe(false);
    expect(inRange(null, rangeBounds({ from: null, to: null }))).toBe(true);
  });
});
