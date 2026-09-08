import { z } from "zod";

/**
 * Validation shape and UI state for the email-discount capture form.
 *
 * Deliberately NOT declared in `./email-discount-action.ts`: a `"use server"` module may
 * export only async functions. Exporting a Zod schema or a plain state object
 * from there throws at runtime — "A \"use server\" file can only export async
 * functions, found object" — which 500s every page that renders the form.
 * The Action and the client form both import from here instead.
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
