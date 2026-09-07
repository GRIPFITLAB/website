/**
 * Hand-written subset of the Brevo v3 API shapes we actually use.
 *
 * Deliberately narrow — we only model the fields the site reads or
 * writes. Full reference: https://developers.brevo.com/reference
 */

/** Custom contact attributes GripFit writes on every signup. */
export interface GripFitContactAttributes {
  /** The visitor's personal, single-use-intent discount code. */
  DISCOUNT_CODE?: string;
  /** Percent off the code grants, as a whole number (e.g. 15). */
  DISCOUNT_PCT?: number;
  /** Where the signup came from — always "website" from this app. */
  SIGNUP_SOURCE?: string;
  /** ISO-8601 timestamp of first capture. */
  SIGNUP_TS?: string;
}

export interface BrevoContact {
  id: number;
  email: string;
  listIds?: number[];
  attributes?: Record<string, unknown> & GripFitContactAttributes;
}

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface SendTransactionalEmailInput {
  to: BrevoRecipient[];
  /** Required unless `templateId` is set (the template carries its own). */
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  /** Brevo template id. When set, `subject`/`htmlContent` are ignored. */
  templateId?: number;
  /** Merge params consumed by a Brevo template. */
  params?: Record<string, unknown>;
  /** Where replies go. Defaults to the sender. */
  replyTo?: BrevoRecipient;
}

export interface UpsertContactInput {
  email: string;
  attributes?: GripFitContactAttributes;
  /** Lists the contact should belong to. */
  listIds?: number[];
}

/** Brevo's error envelope: `{ code, message }`. */
export interface BrevoErrorBody {
  code?: string;
  message?: string;
}
