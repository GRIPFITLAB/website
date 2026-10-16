import { z } from "zod";

/**
 * Validation shape and UI state for the email-discount capture form.
 *
 * Deliberately NOT declared in `./email-discount-action.ts`: a `"use server"`
 * module may export only async functions. The Action and the client form
 * both import from here instead.
 */
export const emailDiscountSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(160),
  /** Honeypot — bots fill it in, humans never see it. */
  website: z.string().max(0, "Spam detected").optional(),
  /** Browser-generated id shared with the Meta Pixel for CAPI dedup. */
  event_id: z
    .string()
    .trim()
    .max(64)
    .regex(/^[A-Za-z0-9-]*$/)
    .optional(),
  /** Which surface submitted. */
  source: z.enum(["modal", "footer", "kickstarter"]).optional(),
});

export type EmailDiscountState =
  | { status: "idle" }
  | { status: "success"; message: string; eventId: string | null }
  | {
      status: "error";
      message: string;
      fieldErrors?: { email?: string };
    };

export const initialEmailDiscountState: EmailDiscountState = { status: "idle" };
