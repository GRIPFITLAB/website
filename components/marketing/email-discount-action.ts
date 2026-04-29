"use server";

import { z } from "zod";

import { discountConfig } from "@/lib/config";
import { isResendConfigured } from "@/lib/env";

/**
 * Email-discount Server Action — Apr 29, 2026 stub.
 *
 * Mirrors the contact form pattern: schema-validated server-side so
 * a direct call to the Action can't bypass validation. The honeypot
 * is a `website` field that's visually hidden in the modal markup —
 * humans never type it, bots fill it in.
 *
 * Step 9 (Decisions.md §15) will:
 *   - Replace the no-Resend branch with a real Resend send to deliver
 *     the discount code (`discountConfig.email.percentOff`).
 *   - Persist captured emails to a list (Resend audience or similar)
 *     for the launch announcement.
 *   - Add per-IP rate limiting.
 */
export const emailDiscountSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(160),
  /** Honeypot — bots fill it in, humans never see it. */
  website: z.string().max(0, "Spam detected").optional(),
});

export type EmailDiscountState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: { email?: string };
    };

export const initialEmailDiscountState: EmailDiscountState = { status: "idle" };

export async function submitEmailDiscount(
  _prev: EmailDiscountState,
  formData: FormData,
): Promise<EmailDiscountState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = emailDiscountSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: { email?: string } = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "email" && !fieldErrors.email) {
        fieldErrors.email = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please enter a valid email address.",
      fieldErrors,
    };
  }

  if (!isResendConfigured) {
    console.warn(
      "[email-discount] Resend not configured — accepted but no email sent.",
      { email: parsed.data.email },
    );
    return {
      status: "success",
      message: discountConfig.email.confirmationCopy,
    };
  }

  // TODO(Step 9): Resend.emails.send() with the discount code template.
  console.warn("[email-discount] Resend integration pending — Step 9.");

  return {
    status: "success",
    message: discountConfig.email.confirmationCopy,
  };
}
