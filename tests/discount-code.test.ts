import { describe, expect, it } from "vitest";

import { emailDiscount } from "@/lib/admin";
import {
  DISCOUNT_CODE_PATTERN,
  generateDiscountCode,
  isValidDiscountCode,
} from "@/lib/discount-code";

/**
 * Discount-code generation (PRD R-012).
 *
 * The security property that matters: codes must not be guessable from
 * one another, because a guessable code defeats the point of trading a
 * code for an email address.
 */

describe("generateDiscountCode", () => {
  it("matches the documented format", () => {
    const code = generateDiscountCode();
    expect(code).toMatch(DISCOUNT_CODE_PATTERN);
    expect(code.startsWith(`${emailDiscount.codePrefix}-`)).toBe(true);
    expect(code).toHaveLength(emailDiscount.codePrefix.length + 1 + 8);
  });

  it("omits lookalike characters so codes survive being retyped", () => {
    const body = generateDiscountCode().split("-")[1] ?? "";
    expect(body).not.toMatch(/[ILOU]/);
  });

  it("does not repeat across many draws", () => {
    const codes = new Set(
      Array.from({ length: 2000 }, () => generateDiscountCode()),
    );
    expect(codes.size).toBe(2000);
  });

  it("varies every position, so codes can't be walked from a known one", () => {
    const codes = Array.from({ length: 500 }, () => generateDiscountCode());
    // A counter-based generator would hold most positions constant.
    for (let i = 0; i < 8; i += 1) {
      const distinct = new Set(codes.map((c) => c.slice(3)[i]));
      expect(distinct.size).toBeGreaterThan(8);
    }
  });
});

describe("isValidDiscountCode", () => {
  it("accepts generated codes", () => {
    expect(isValidDiscountCode(generateDiscountCode())).toBe(true);
  });

  it("rejects malformed input", () => {
    for (const bad of [
      "",
      "GF-",
      "GF-SHORT",
      "GF-TOOLONGCODE",
      "XX-ABCD2345",
      "gf-abcd2345",
      "GF-ABCDIOU1",
    ]) {
      expect(isValidDiscountCode(bad)).toBe(false);
    }
  });
});
