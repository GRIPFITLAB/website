import { z } from "zod";

/**
 * Validation shape and UI state for the unsubscribe confirmation.
 *
 * Deliberately NOT declared in `./unsubscribe-action.ts`: a `"use server"`
 * module may export only async functions.
 *
 * The `code` is the visitor's own discount code, which acts as the proof of
 * ownership — it is unguessable (40 bits), already unique per address, and
 * already in their inbox, so no new secret or token table is needed.
 */
export const unsubscribeSchema = z.object({
  email: z.string().trim().email().max(160),
  code: z.string().trim().min(1).max(32),
});

export type UnsubscribeState =
  | { status: "idle" }
  | { status: "done"; message: string }
  | { status: "error"; message: string };

export const initialUnsubscribeState: UnsubscribeState = { status: "idle" };
