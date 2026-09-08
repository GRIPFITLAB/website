import { z } from "zod";

/**
 * Validation shape and UI state for the contact form.
 *
 * Deliberately NOT declared in `./contact-action.ts`: a `"use server"` module may
 * export only async functions. Exporting a Zod schema or a plain state object
 * from there throws at runtime — "A \"use server\" file can only export async
 * functions, found object" — which 500s every page that renders the form.
 * The Action and the client form both import from here instead.
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
