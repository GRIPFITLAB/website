"use server";

import { getContact, unsubscribeContact } from "@/lib/brevo";
import { env, isBrevoConfigured } from "@/lib/env";

import {
  unsubscribeSchema,
  type UnsubscribeState,
} from "./unsubscribe-schema";

/**
 * Unsubscribe a captured email (R-014 obligations, ADMIN.md §10).
 *
 * Ownership is proved with the discount code from the visitor's own email,
 * checked against the code stored on the Brevo contact. Without that check
 * the endpoint would let anyone unsubscribe any address they can guess.
 *
 * The response is deliberately identical whether or not the address exists,
 * so this cannot be used to test which addresses are on the list.
 */

const DONE =
  "You're unsubscribed. You won't receive any more email from us. Your pre-order discount code stays valid.";

const MISMATCH =
  "That unsubscribe link isn't valid. Use the link from the bottom of your discount email, or contact us and we'll remove you.";

export async function submitUnsubscribe(
  _prev: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const parsed = unsubscribeSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    code: String(formData.get("code") ?? ""),
  });

  if (!parsed.success) return { status: "error", message: MISMATCH };

  const email = parsed.data.email.toLowerCase();

  if (!isBrevoConfigured) {
    console.warn("[unsubscribe] Brevo not configured — nothing to remove.", {
      email,
    });
    return { status: "done", message: DONE };
  }

  try {
    const contact = await getContact(email);
    const storedCode = contact?.attributes?.DISCOUNT_CODE;

    // Unknown address and wrong code are the same answer on purpose.
    if (typeof storedCode !== "string" || storedCode !== parsed.data.code) {
      return { status: "error", message: MISMATCH };
    }

    await unsubscribeContact({
      email,
      ...(env.BREVO_WEBSITE_LIST_ID
        ? { listIds: [env.BREVO_WEBSITE_LIST_ID] }
        : {}),
    });

    return { status: "done", message: DONE };
  } catch (error) {
    console.error("[unsubscribe] Brevo call failed", error);
    return {
      status: "error",
      message:
        "We couldn't complete that just now. Please try again in a moment.",
    };
  }
}
