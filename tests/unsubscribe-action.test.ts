import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Unsubscribe Server Action (ADMIN.md §10).
 *
 * The discount code is the ownership proof, so the important assertions are
 * the negative ones: a wrong code must not unsubscribe anyone, and the
 * response must not reveal whether an address is on the list.
 */

const brevo = vi.hoisted(() => ({
  getContact: vi.fn(),
  unsubscribeContact: vi.fn(),
}));

const envState = vi.hoisted(() => ({
  isBrevoConfigured: true,
  listId: 7 as number | undefined,
}));

vi.mock("@/lib/brevo", () => brevo);

vi.mock("@/lib/env", () => ({
  get isBrevoConfigured() {
    return envState.isBrevoConfigured;
  },
  get env() {
    return { BREVO_WEBSITE_LIST_ID: envState.listId };
  },
}));

const { submitUnsubscribe } = await import(
  "@/components/forms/unsubscribe-action"
);
const { initialUnsubscribeState } = await import(
  "@/components/forms/unsubscribe-schema"
);

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const KNOWN = { email: "dana@example.com", code: "GF-7Q4KX2M9" };

beforeEach(() => {
  envState.isBrevoConfigured = true;
  envState.listId = 7;
  brevo.getContact.mockResolvedValue({
    id: 1,
    email: KNOWN.email,
    attributes: { DISCOUNT_CODE: KNOWN.code },
  });
  brevo.unsubscribeContact.mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("a valid link", () => {
  it("unsubscribes the contact and drops the list membership", async () => {
    const state = await submitUnsubscribe(initialUnsubscribeState, form(KNOWN));

    expect(state.status).toBe("done");
    expect(brevo.unsubscribeContact).toHaveBeenCalledWith({
      email: KNOWN.email,
      listIds: [7],
    });
  });

  it("normalises the address to lowercase", async () => {
    await submitUnsubscribe(
      initialUnsubscribeState,
      form({ ...KNOWN, email: "Dana@Example.com" }),
    );

    expect(brevo.unsubscribeContact).toHaveBeenCalledWith(
      expect.objectContaining({ email: KNOWN.email }),
    );
  });

  it("omits listIds when no list is configured", async () => {
    envState.listId = undefined;

    await submitUnsubscribe(initialUnsubscribeState, form(KNOWN));

    expect(brevo.unsubscribeContact).toHaveBeenCalledWith({
      email: KNOWN.email,
    });
  });
});

describe("an invalid link", () => {
  it("refuses a wrong code and unsubscribes nobody", async () => {
    const state = await submitUnsubscribe(
      initialUnsubscribeState,
      form({ email: KNOWN.email, code: "GF-00000000" }),
    );

    expect(state.status).toBe("error");
    expect(brevo.unsubscribeContact).not.toHaveBeenCalled();
  });

  it("refuses an unknown address without saying so", async () => {
    brevo.getContact.mockResolvedValue(null);

    const unknown = await submitUnsubscribe(
      initialUnsubscribeState,
      form({ email: "nobody@example.com", code: KNOWN.code }),
    );
    const wrongCode = await submitUnsubscribe(
      initialUnsubscribeState,
      form({ email: KNOWN.email, code: "GF-00000000" }),
    );

    // Identical wording: the response must not disclose list membership.
    expect(unknown).toEqual(wrongCode);
    expect(brevo.unsubscribeContact).not.toHaveBeenCalled();
  });

  it("rejects a malformed email without calling Brevo", async () => {
    const state = await submitUnsubscribe(
      initialUnsubscribeState,
      form({ email: "not-an-email", code: KNOWN.code }),
    );

    expect(state.status).toBe("error");
    expect(brevo.getContact).not.toHaveBeenCalled();
  });
});

describe("degraded modes", () => {
  it("reports done when Brevo is not configured", async () => {
    envState.isBrevoConfigured = false;

    const state = await submitUnsubscribe(initialUnsubscribeState, form(KNOWN));

    expect(state.status).toBe("done");
    expect(brevo.getContact).not.toHaveBeenCalled();
  });

  it("reports a friendly error and leaks nothing when Brevo fails", async () => {
    brevo.getContact.mockRejectedValue(new Error("brevo exploded"));

    const state = await submitUnsubscribe(initialUnsubscribeState, form(KNOWN));

    expect(state.status).toBe("error");
    if (state.status === "error") {
      expect(state.message).not.toContain("brevo exploded");
    }
  });
});
