import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Email-discount Server Action (PRD R-011, R-012, R-014).
 *
 * Brevo is mocked — these tests assert *our* logic: validation, the
 * honeypot, code reuse on repeat submissions, list membership, and the
 * graceful branch when Brevo isn't configured yet.
 */

const brevo = vi.hoisted(() => ({
  getContact: vi.fn(),
  upsertContact: vi.fn(),
  sendTransactionalEmail: vi.fn(),
}));

const envState = vi.hoisted(() => ({
  isBrevoConfigured: true,
  listId: 7 as number | undefined,
  templateId: undefined as number | undefined,
}));

vi.mock("@/lib/brevo", () => brevo);

vi.mock("@/lib/env", () => ({
  get isBrevoConfigured() {
    return envState.isBrevoConfigured;
  },
  get env() {
    return {
      BREVO_WEBSITE_LIST_ID: envState.listId,
      BREVO_DISCOUNT_TEMPLATE_ID: envState.templateId,
      BREVO_SENDER_NAME: "GripFit",
    };
  },
}));

const { submitEmailDiscount, initialEmailDiscountState } = await import(
  "@/components/marketing/email-discount-action"
);
const { discountConfig } = await import("@/lib/config");
const { isValidDiscountCode } = await import("@/lib/discount-code");

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

beforeEach(() => {
  envState.isBrevoConfigured = true;
  envState.listId = 7;
  envState.templateId = undefined;
  brevo.getContact.mockResolvedValue(null);
  brevo.upsertContact.mockResolvedValue(undefined);
  brevo.sendTransactionalEmail.mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("validation", () => {
  it("rejects a malformed address without calling Brevo", async () => {
    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "not-an-email" }),
    );

    expect(result.status).toBe("error");
    expect(result).toHaveProperty("fieldErrors.email");
    expect(brevo.upsertContact).not.toHaveBeenCalled();
    expect(brevo.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("rejects a filled honeypot", async () => {
    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "bot@example.com", website: "http://spam.example" }),
    );

    expect(result.status).toBe("error");
    expect(brevo.upsertContact).not.toHaveBeenCalled();
  });

  it("normalises the address to lowercase", async () => {
    await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "  Athlete@Example.COM  " }),
    );

    expect(brevo.upsertContact).toHaveBeenCalledWith(
      expect.objectContaining({ email: "athlete@example.com" }),
    );
  });
});

describe("first-time signup", () => {
  it("issues a code, stores it on the contact, and emails it", async () => {
    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "new@example.com" }),
    );

    expect(result).toEqual({
      status: "success",
      message: discountConfig.email.confirmationCopy,
    });

    const upsert = brevo.upsertContact.mock.calls[0]?.[0];
    expect(upsert.email).toBe("new@example.com");
    expect(isValidDiscountCode(upsert.attributes.DISCOUNT_CODE)).toBe(true);
    expect(upsert.attributes.DISCOUNT_PCT).toBe(15);
    expect(upsert.attributes.SIGNUP_SOURCE).toBe("website");
    expect(upsert.listIds).toEqual([7]);

    const send = brevo.sendTransactionalEmail.mock.calls[0]?.[0];
    expect(send.to).toEqual([{ email: "new@example.com" }]);
    expect(send.htmlContent).toContain(upsert.attributes.DISCOUNT_CODE);
    expect(send.subject).toContain(upsert.attributes.DISCOUNT_CODE);
  });

  it("omits listIds when no list is configured", async () => {
    envState.listId = undefined;

    await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "new@example.com" }),
    );

    expect(brevo.upsertContact.mock.calls[0]?.[0]).not.toHaveProperty(
      "listIds",
    );
  });

  it("uses the Brevo template when one is configured", async () => {
    envState.templateId = 42;

    await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "new@example.com" }),
    );

    const send = brevo.sendTransactionalEmail.mock.calls[0]?.[0];
    expect(send.templateId).toBe(42);
    expect(send.params.DISCOUNT_CODE).toBeTruthy();
    expect(send.htmlContent).toBeUndefined();
  });
});

describe("repeat signup", () => {
  it("re-sends the existing code instead of minting a second one", async () => {
    brevo.getContact.mockResolvedValue({
      id: 1,
      email: "repeat@example.com",
      attributes: { DISCOUNT_CODE: "GF-ABCD2345" },
    });

    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "repeat@example.com" }),
    );

    expect(result.status).toBe("success");
    expect(brevo.upsertContact.mock.calls[0]?.[0].attributes.DISCOUNT_CODE).toBe(
      "GF-ABCD2345",
    );
    expect(brevo.sendTransactionalEmail.mock.calls[0]?.[0].subject).toContain(
      "GF-ABCD2345",
    );
  });

  it("issues a code when the known contact somehow has none", async () => {
    brevo.getContact.mockResolvedValue({
      id: 1,
      email: "partial@example.com",
      attributes: {},
    });

    await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "partial@example.com" }),
    );

    const code =
      brevo.upsertContact.mock.calls[0]?.[0].attributes.DISCOUNT_CODE;
    expect(isValidDiscountCode(code)).toBe(true);
  });
});

describe("degraded modes", () => {
  it("accepts the submission when Brevo is not configured", async () => {
    envState.isBrevoConfigured = false;

    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "early@example.com" }),
    );

    expect(result).toEqual({
      status: "success",
      message: discountConfig.email.confirmationCopy,
    });
    expect(brevo.upsertContact).not.toHaveBeenCalled();
  });

  it("reports a friendly error and leaks nothing when Brevo fails", async () => {
    brevo.upsertContact.mockRejectedValue(
      new Error("Brevo /contacts failed with 401: bad api key"),
    );

    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "boom@example.com" }),
    );

    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("unreachable");
    expect(result.message).not.toMatch(/brevo|401|api key/i);
  });
});
