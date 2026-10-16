import { describe, expect, it } from "vitest";

import { priceExperiment } from "@/lib/admin";
import {
  createAssignment,
  decodeAssignment,
  encodeAssignment,
  randomPrice,
} from "@/lib/experiment/assignment";
import {
  decodeAttribution,
  encodeAttribution,
  hasAttributionParams,
  parseAttribution,
} from "@/lib/experiment/attribution";

/**
 * Price-experiment primitives (DECISIONS.md §17).
 *
 * The assignment cookie is the only thing standing between a visitor and
 * a self-chosen price, so the signing path gets the most attention.
 */

const SECRET = "test-secret-at-least-16-chars";

describe("randomPrice", () => {
  it("stays inside the configured range and is an integer", () => {
    for (let i = 0; i < 500; i++) {
      const p = randomPrice();
      expect(Number.isInteger(p)).toBe(true);
      expect(p).toBeGreaterThanOrEqual(priceExperiment.minUSD);
      expect(p).toBeLessThanOrEqual(priceExperiment.maxUSD);
    }
  });

  it("hits both ends of a small range", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(randomPrice(1, 3));
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });
});

describe("assignment signing", () => {
  it("round-trips", async () => {
    const a = createAssignment();
    const cookie = await encodeAssignment(a, SECRET);
    expect(cookie.split(".")).toHaveLength(4);
    expect(await decodeAssignment(cookie, SECRET)).toEqual(a);
  });

  it("rejects a tampered price", async () => {
    const a = { ...createAssignment(), price: priceExperiment.minUSD };
    const cookie = await encodeAssignment(a, SECRET);
    const forged = cookie.replace(`.${a.price}.`, `.${a.price + 1}.`);
    expect(forged).not.toBe(cookie);
    expect(await decodeAssignment(forged, SECRET)).toBeNull();
  });

  it("rejects a cookie signed with a different secret", async () => {
    const cookie = await encodeAssignment(createAssignment(), "another-secret-123456");
    expect(await decodeAssignment(cookie, SECRET)).toBeNull();
  });

  it("rejects a stale experiment id even with a valid signature", async () => {
    const a = { ...createAssignment(), experimentId: "old-experiment" };
    const cookie = await encodeAssignment(a, SECRET);
    expect(await decodeAssignment(cookie, SECRET)).toBeNull();
  });

  it("rejects an out-of-range price even with a valid signature", async () => {
    const a = { ...createAssignment(), price: priceExperiment.maxUSD + 50 };
    const cookie = await encodeAssignment(a, SECRET);
    expect(await decodeAssignment(cookie, SECRET)).toBeNull();
  });

  it("rejects garbage", async () => {
    for (const bad of ["", "a.b", "a.b.c.d", "x".repeat(300), null, undefined]) {
      expect(await decodeAssignment(bad, SECRET)).toBeNull();
    }
  });
});

describe("attribution", () => {
  const url = new URL(
    "https://gripfit.example/?utm_source=facebook&utm_medium=paid&utm_campaign=launch&campaign_id=1&adset_id=2&ad_id=3&fbclid=abc",
  );

  it("detects campaign parameters", () => {
    expect(hasAttributionParams(url)).toBe(true);
    expect(hasAttributionParams(new URL("https://gripfit.example/science"))).toBe(false);
  });

  it("captures Meta ids, UTMs, landing path and external referrer", () => {
    const a = parseAttribution(url, "https://l.facebook.com/l.php", new Date("2026-10-15"));
    expect(a).toMatchObject({
      utm_source: "facebook",
      utm_campaign: "launch",
      campaign_id: "1",
      adset_id: "2",
      ad_id: "3",
      fbclid: "abc",
      landing_path: "/",
      referrer_host: "l.facebook.com",
      first_seen_at: "2026-10-15T00:00:00.000Z",
    });
  });

  it("ignores a same-site referrer", () => {
    const a = parseAttribution(url, "https://gripfit.example/setup");
    expect(a.referrer_host).toBeUndefined();
  });

  it("round-trips through the cookie encoding", () => {
    const a = parseAttribution(url, null);
    expect(decodeAttribution(encodeAttribution(a))).toEqual(a);
  });

  it("returns null for junk cookies", () => {
    expect(decodeAttribution("not base64 json!")).toBeNull();
    expect(decodeAttribution(undefined)).toBeNull();
  });
});
