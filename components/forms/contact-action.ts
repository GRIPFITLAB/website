"use server";

import { z } from "zod";

import { isResendConfigured } from "@/lib/env";

/**
 * Contact form Server Action — Step-4 stub.
 *
 * Step 9 will:
 *   - Replace the no-Resend branch with a real Resend send.
 *   - Add IP-based rate limiting.
 *   - Send a confirmation email back to the submitter.
 *
 * Schema lives here (server side) so submissions can't bypass validation
 * by calling the Action directly. The client form re-uses the same schema
 * via a small re-export to give us instant feedback.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email address").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
  /** Honeypot — bots fill it in, humans never see it. */
  website: z.string().max(0, "Spam detected").optional(),
});

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
    };

export const initialContactState: ContactFormState = { status: "idle" };

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<"name" | "email" | "message", string>> =
      {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        (key === "name" || key === "email" || key === "message") &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the errors below and try again.",
      fieldErrors,
    };
  }

  if (!isResendConfigured) {
    // Step-4 deploy mode: log and return success-ish so the UI can be
    // exercised on Vercel before Resend is wired up.
    console.warn(
      "[contact] Resend not configured — submission accepted but no email sent.",
      { name: parsed.data.name, email: parsed.data.email },
    );
    return {
      status: "success",
      message:
        "Thanks — we received your message. (Email delivery isn't wired up yet, so we'll follow up once it's live.)",
    };
  }

  // TODO(Step 9): replace this block with a Resend.emails.send() call
  // using RESEND_API_KEY + CONTACT_EMAIL_TO + CONTACT_EMAIL_FROM.
  console.warn("[contact] Resend integration pending — Step 9.");

  return {
    status: "success",
    message: "Thanks — we received your message and will reply within 1–2 business days.",
  };
}
