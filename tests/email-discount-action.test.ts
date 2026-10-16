import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Email-discount Server Action (PRD R-011, R-012, R-014; DECISIONS.md §17).
 *
 * Brevo, Firestore, and the Meta Conversions API are mocked — these tests
 * assert *our* logic: validation, the honeypot, code reuse on repeat
 * submissions, list membership, the experiment fields that ride along
 * with the lead, dedup event ids, and the graceful branch when nothing
 * is configured yet.
 */

const brevo = vi.hoisted(() => ({
  getContact: vi.fn(),
  upsertContact: vi.fn(),
  sendTransactionalEmail: vi.fn(),
}));

const store = vi.hoisted(() => ({
  recordLead: vi.fn(),
  recordVisitor: vi.fn(),
  recordContact: vi.fn(),
}));

const capi = vi.hoisted(() => ({
  sendMetaEvent: vi.fn(),
}));

const envState = vi.hoisted(() => ({
  isBrevoConfigured: true,
  listId: 7 as number | undefined,
  templateId: undefined as number | undefined,
}));

/** The signed assignment cookie the proxy would have set, if any. */
const request = vi.hoisted(() => ({
  assignmentCookie: undefined as string | undefined,
  attributionCookie: undefined as string | undefined,
}));

const { __resetRateLimits } = await import("@/lib/rate-limit");
const { encodeAssignment } = await import("@/lib/experiment/assignment");
const { encodeAttribution } = await import("@/lib/experiment/attribution");

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  headers: async () =>
    new Map([
      ["x-forwarded-for", "203.0.113.10"],
      ["user-agent", "vitest"],
    ]),
  cookies: async () => ({
    get: (name: string) => {
      const value =
        name === "gf_exp"
          ? request.assignmentCookie
          : name === "gf_attr"
            ? request.attributionCookie
            : undefined;
      return value ? { name, value } : undefined;
    },
  }),
}));

// `after()` runs the callback immediately in tests so side effects are observable.
vi.mock("next/server", () => ({
  after: (cb: () => unknown) => {
    void cb();
  },
}));

vi.mock("@/lib/brevo", () => brevo);
vi.mock("@/lib/experiment/store", () => store);
vi.mock("@/lib/tracking/meta-capi", () => capi);

vi.mock("@/lib/env", () => ({
  get isBrevoConfigured() {
    return envState.isBrevoConfigured;
  },
  isFirebaseConfigured: false,
  isMetaCapiConfigured: false,
  get env() {
    return {
      BREVO_WEBSITE_LIST_ID: envState.listId,
      BREVO_DISCOUNT_TEMPLATE_ID: envState.templateId,
      BREVO_SENDER_NAME: "GripFit",
      FIRESTORE_COLLECTION_PREFIX: "web_",
    };
  },
}));

const { submitEmailDiscount } = await import("@/components/marketing/email-discount-action");
const { initialEmailDiscountState } = await import(
  "@/components/marketing/email-discount-schema"
);
const { discountConfig } = await import("@/lib/config");
const { priceExperiment, productSettings } = await import("@/lib/admin");
const { isValidDiscountCode } = await import("@/lib/discount-code");
const { superEarlyBirdPrice } = await import("@/lib/pricing");

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

beforeEach(() => {
  __resetRateLimits();
  envState.isBrevoConfigured = true;
  envState.listId = 7;
  envState.templateId = undefined;
  request.assignmentCookie = undefined;
  request.attributionCookie = undefined;
  brevo.getContact.mockReset().mockResolvedValue(null);
  brevo.upsertContact.mockReset().mockResolvedValue(undefined);
  brevo.sendTransactionalEmail.mockReset().mockResolvedValue(undefined);
  store.recordLead.mockReset().mockResolvedValue(undefined);
  capi.sendMetaEvent.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
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
    expect(store.recordLead).not.toHaveBeenCalled();
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
      eventId: null,
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

    await submitEmailDiscount(initialEmailDiscountState, form({ email: "new@example.com" }));

    expect(brevo.upsertContact.mock.calls[0]?.[0]).not.toHaveProperty("listIds");
  });

  it("uses the Brevo template when one is configured", async () => {
    envState.templateId = 42;

    await submitEmailDiscount(initialEmailDiscountState, form({ email: "new@example.com" }));

    const send = brevo.sendTransactionalEmail.mock.calls[0]?.[0];
    expect(send.templateId).toBe(42);
    expect(send.params.DISCOUNT_CODE).toBeTruthy();
    expect(send.params.SUPER_EARLY_BIRD_PRICE).toBeTruthy();
    expect(send.htmlContent).toBeUndefined();
  });

  it("quotes the Super Early Bird price in the fallback email", async () => {
    await submitEmailDiscount(initialEmailDiscountState, form({ email: "new@example.com" }));

    const send = brevo.sendTransactionalEmail.mock.calls[0]?.[0];
    const seb = superEarlyBirdPrice(productSettings.kickstarterPriceUSD);
    expect(send.textContent).toContain(`$${seb}`);
    expect(send.textContent.toLowerCase()).not.toContain("pre-order");
  });
});

describe("price experiment", () => {
  it("records the lead with the visitor's assigned price and attribution", async () => {
    const assignment = {
      visitorId: "11111111-2222-4333-8444-555555555555",
      experimentId: priceExperiment.id,
      price: priceExperiment.minUSD,
    };
    request.assignmentCookie = await encodeAssignment(assignment);
    request.attributionCookie = encodeAttribution({
      utm_source: "facebook",
      utm_campaign: "launch",
      campaign_id: "123",
      landing_path: "/",
      first_seen_at: "2026-10-15T00:00:00.000Z",
    });

    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "exp@example.com", event_id: "evt-abc-123", source: "footer" }),
    );

    expect(result).toMatchObject({ status: "success", eventId: "evt-abc-123" });

    const lead = store.recordLead.mock.calls[0]?.[0];
    expect(lead.email).toBe("exp@example.com");
    expect(lead.source).toBe("footer");
    expect(lead.eventId).toBe("evt-abc-123");
    expect(lead.assignment).toEqual(assignment);
    expect(lead.pricing.kickstarter.amount).toBe(priceExperiment.minUSD);
    expect(lead.pricing.isExperimentPrice).toBe(true);
    expect(lead.attribution.utm_campaign).toBe("launch");

    const upsert = brevo.upsertContact.mock.calls[0]?.[0];
    expect(upsert.attributes.VISITOR_ID).toBe(assignment.visitorId);
    expect(upsert.attributes.PRICE_ASSIGNED).toBe(priceExperiment.minUSD);
    expect(upsert.attributes.UTM_CAMPAIGN).toBe("launch");
  });

  it("ignores a forged assignment cookie and falls back to default pricing", async () => {
    request.assignmentCookie = `${"a".repeat(8)}-bbbb-4ccc-8ddd-${"e".repeat(12)}.${priceExperiment.id}.1.forgedsignature000000`;

    await submitEmailDiscount(initialEmailDiscountState, form({ email: "forged@example.com" }));

    const lead = store.recordLead.mock.calls[0]?.[0];
    expect(lead.assignment).toBeNull();
    expect(lead.pricing.kickstarter.amount).toBe(productSettings.kickstarterPriceUSD);
  });

  it("sends a Conversions API Lead with the browser event id and hashed-only identity", async () => {
    await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "capi@example.com", event_id: "evt-dedup-1" }),
    );

    const event = capi.sendMetaEvent.mock.calls[0]?.[0];
    expect(event.eventName).toBe("Lead");
    expect(event.eventId).toBe("evt-dedup-1");
    expect(event.email).toBe("capi@example.com"); // hashed inside sendMetaEvent
    // No raw identity in ordinary event parameters.
    expect(JSON.stringify(event.customData)).not.toContain("capi@example.com");
    expect(event.customData.assigned_price).toBe(productSettings.kickstarterPriceUSD);
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
    expect(brevo.upsertContact.mock.calls[0]?.[0].attributes.DISCOUNT_CODE).toBe("GF-ABCD2345");
    expect(brevo.sendTransactionalEmail.mock.calls[0]?.[0].subject).toContain("GF-ABCD2345");
  });

  it("issues a code when the known contact somehow has none", async () => {
    brevo.getContact.mockResolvedValue({
      id: 1,
      email: "partial@example.com",
      attributes: {},
    });

    await submitEmailDiscount(initialEmailDiscountState, form({ email: "partial@example.com" }));

    const code = brevo.upsertContact.mock.calls[0]?.[0].attributes.DISCOUNT_CODE;
    expect(isValidDiscountCode(code)).toBe(true);
  });
});

describe("degraded modes", () => {
  it("accepts the submission and still records the lead when Brevo is not configured", async () => {
    envState.isBrevoConfigured = false;

    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "early@example.com" }),
    );

    expect(result).toEqual({
      status: "success",
      message: discountConfig.email.confirmationCopy,
      eventId: null,
    });
    expect(brevo.upsertContact).not.toHaveBeenCalled();
    expect(store.recordLead).toHaveBeenCalledTimes(1);
  });

  it("reports a friendly error and leaks nothing when Brevo fails", async () => {
    brevo.upsertContact.mockRejectedValue(new Error("Brevo /contacts failed with 401: bad api key"));

    const result = await submitEmailDiscount(
      initialEmailDiscountState,
      form({ email: "boom@example.com" }),
    );

    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("unreachable");
    expect(result.message).not.toMatch(/brevo|401|api key/i);
    expect(store.recordLead).not.toHaveBeenCalled();
  });
});
