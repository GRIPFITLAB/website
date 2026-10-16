import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Contact form Server Action (PRD R-013, R-014).
 */

const brevo = vi.hoisted(() => ({
  sendTransactionalEmail: vi.fn(),
}));

const store = vi.hoisted(() => ({
  recordContact: vi.fn(),
}));

const envState = vi.hoisted(() => ({
  isContactEmailConfigured: true,
  contactEmailTo: "support@example.com" as string | undefined,
}));

// Server Actions consult a per-IP rate limiter, which reads request headers.
// There is no request scope under Vitest, so the header bag is stubbed and the
// limiter is reset per test; `tests/rate-limit.test.ts` covers the limiter.
const { __resetRateLimits } = await import("@/lib/rate-limit");

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "203.0.113.10"]]),
  cookies: async () => ({ get: () => undefined }),
}));

vi.mock("next/server", () => ({
  after: (cb: () => unknown) => {
    void cb();
  },
}));

vi.mock("@/lib/brevo", () => brevo);
vi.mock("@/lib/experiment/store", () => store);

vi.mock("@/lib/env", () => ({
  get isContactEmailConfigured() {
    return envState.isContactEmailConfigured;
  },
  isFirebaseConfigured: false,
  get env() {
    return { EMAIL_SUPPORT: envState.contactEmailTo, FIRESTORE_COLLECTION_PREFIX: "web_" };
  },
}));

const { submitContact } = await import("@/components/forms/contact-action");
const { initialContactState } = await import(
  "@/components/forms/contact-schema"
);

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const valid = {
  name: "Dana Reyes",
  email: "dana@example.com",
  message: "Do you ship to Canada during the Kickstarter?",
};

beforeEach(() => {
  __resetRateLimits();
  envState.isContactEmailConfigured = true;
  envState.contactEmailTo = "support@example.com";
  brevo.sendTransactionalEmail.mockReset().mockResolvedValue(undefined);
  store.recordContact.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("validation", () => {
  it("reports per-field errors without sending", async () => {
    const result = await submitContact(
      initialContactState,
      form({ name: "", email: "nope", message: "short" }),
    );

    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("unreachable");
    expect(result.fieldErrors?.name).toBeTruthy();
    expect(result.fieldErrors?.email).toBeTruthy();
    expect(result.fieldErrors?.message).toBeTruthy();
    expect(brevo.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("rejects a filled honeypot", async () => {
    const result = await submitContact(
      initialContactState,
      form({ ...valid, website: "http://spam.example" }),
    );

    expect(result.status).toBe("error");
    expect(brevo.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("rejects an over-long message", async () => {
    const result = await submitContact(
      initialContactState,
      form({ ...valid, message: "x".repeat(2001) }),
    );

    expect(result.status).toBe("error");
    expect(brevo.sendTransactionalEmail).not.toHaveBeenCalled();
  });
});

describe("delivery", () => {
  it("sends to the configured inbox with the submitter as reply-to", async () => {
    const result = await submitContact(initialContactState, form(valid));

    expect(result.status).toBe("success");

    const send = brevo.sendTransactionalEmail.mock.calls[0]?.[0];
    expect(send.to).toEqual([{ email: "support@example.com" }]);
    expect(send.replyTo).toEqual({ email: valid.email, name: valid.name });
    expect(send.subject).toContain(valid.name);
    expect(send.textContent).toContain(valid.message);
  });

  it("persists the message to the contacts store", async () => {
    await submitContact(initialContactState, form(valid));

    expect(store.recordContact).toHaveBeenCalledWith(
      expect.objectContaining({ name: valid.name, email: valid.email, message: valid.message }),
    );
  });

  it("escapes submitted HTML so a message can't inject markup", async () => {
    await submitContact(
      initialContactState,
      form({
        ...valid,
        name: '<img src=x onerror="alert(1)">',
        message: "<script>alert('xss')</script> please advise",
      }),
    );

    const { htmlContent } = brevo.sendTransactionalEmail.mock.calls[0]?.[0];
    expect(htmlContent).not.toContain("<script>");
    expect(htmlContent).not.toContain("<img src=x");
    expect(htmlContent).toContain("&lt;script&gt;");
  });
});

describe("degraded modes", () => {
  it("accepts the message when Brevo is not configured", async () => {
    envState.isContactEmailConfigured = false;

    const result = await submitContact(initialContactState, form(valid));

    expect(result.status).toBe("success");
    expect(brevo.sendTransactionalEmail).not.toHaveBeenCalled();
    // Still stored, so nothing is lost before the inbox is wired up.
    expect(store.recordContact).toHaveBeenCalledTimes(1);
  });

  it("reports a friendly error and leaks nothing when Brevo fails", async () => {
    brevo.sendTransactionalEmail.mockRejectedValue(
      new Error("Brevo /smtp/email failed with 401: bad api key"),
    );

    const result = await submitContact(initialContactState, form(valid));

    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("unreachable");
    expect(result.message).not.toMatch(/brevo|401|api key/i);
  });
});
