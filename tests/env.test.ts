import { describe, expect, it } from "vitest";
import { z } from "zod";

import { normalizeSiteUrl } from "@/lib/env";

/**
 * Mirrors the `SITE_URL` field in `lib/env.ts`. The module-level `env`
 * export parses `process.env` at import time and throws on bad input,
 * so the field is re-declared here to test it in isolation.
 */
const siteUrlField = z
  .preprocess(
    (value) => (typeof value === "string" ? normalizeSiteUrl(value) : value),
    z.url({ protocol: /^https?$/ }),
  )
  .optional();

describe("normalizeSiteUrl", () => {
  it("adds https:// to a bare hostname", () => {
    expect(normalizeSiteUrl("gripfit.com")).toBe("https://gripfit.com");
    expect(normalizeSiteUrl("www.gripfit.com")).toBe("https://www.gripfit.com");
  });

  it("leaves an existing scheme alone", () => {
    expect(normalizeSiteUrl("http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
    expect(normalizeSiteUrl("https://gripfit.com")).toBe("https://gripfit.com");
  });

  it("trims whitespace and trailing slashes", () => {
    expect(normalizeSiteUrl("  https://gripfit.com/  ")).toBe(
      "https://gripfit.com",
    );
    expect(normalizeSiteUrl("gripfit.com///")).toBe("https://gripfit.com");
  });

  it("does not manufacture a valid URL out of a scheme-only value", () => {
    // Regression: stripping trailing slashes before the scheme check turned
    // "http://" into "https://http:", which z.url() then accepted.
    expect(normalizeSiteUrl("http://")).toBe("http://");
    expect(normalizeSiteUrl("https://")).toBe("https://");
  });

  it("leaves a non-http scheme for the validator to reject", () => {
    expect(normalizeSiteUrl("ftp://gripfit.com")).toBe("ftp://gripfit.com");
  });
});

describe("SITE_URL schema field", () => {
  it("accepts a bare hostname — the Vercel-dashboard typo that broke the build", () => {
    expect(siteUrlField.parse("gripfit.com")).toBe("https://gripfit.com");
  });

  it("passes an absent value through as undefined", () => {
    expect(siteUrlField.parse(undefined)).toBeUndefined();
  });

  it.each([
    "http://",
    "https://",
    "not a url",
    "javascript:alert(1)",
    "http://a b.com",
    "ftp://gripfit.com",
  ])("still rejects %j", (value) => {
    expect(() => siteUrlField.parse(value)).toThrow();
  });
});

describe("empty values are dropped before validation", () => {
  it("filters blank strings out of a process.env-shaped object", () => {
    const raw = { SITE_URL: "", BREVO_API_KEY: "abc", OTHER: undefined };
    const defined = Object.fromEntries(
      Object.entries(raw).filter(([, value]) => value !== ""),
    );

    expect(defined).not.toHaveProperty("SITE_URL");
    expect(defined.BREVO_API_KEY).toBe("abc");
  });
});
