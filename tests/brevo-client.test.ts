import { describe, expect, it, vi } from "vitest";

// `lib/brevo/client.ts` imports "server-only", which throws outside a React
// Server Component. Every other suite mocks `@/lib/brevo` wholesale and never
// loads the real module; this one tests it directly, so the guard is stubbed.
vi.mock("server-only", () => ({}));

const { describeBrevoAuthFailure } = await import("@/lib/brevo/client");

/**
 * Brevo answers every auth failure with `401: Key not found`, whatever the
 * actual cause. These assertions pin the mapping from key shape to an
 * actionable message so the log line names something to go and fix.
 */
describe("describeBrevoAuthFailure", () => {
  it("identifies an SMTP key used against the REST API", () => {
    const message = describeBrevoAuthFailure("xsmtpsib-abc123");
    expect(message).toContain("SMTP key");
    expect(message).toContain("xkeysib-");
  });

  it("identifies a value that is not a Brevo key at all", () => {
    expect(describeBrevoAuthFailure("hunter2")).toContain("does not look like");
  });

  it("reports a well-formed key as revoked or wrong-account", () => {
    const message = describeBrevoAuthFailure("xkeysib-abc123");
    expect(message).toContain("well-formed");
    expect(message).toMatch(/revoked|different Brevo account/);
  });

  it("never echoes the key itself", () => {
    const secret = "xkeysib-super-secret-value";
    expect(describeBrevoAuthFailure(secret)).not.toContain(secret);
  });
});
