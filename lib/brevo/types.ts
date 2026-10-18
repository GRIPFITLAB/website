/**
 * Hand-written subset of the Brevo v3 API shapes we actually use.
 *
 * Deliberately narrow — we only model the fields the site reads or
 * writes. Full reference: https://developers.brevo.com/reference
 */

/** Custom contact attributes GripFit writes on every signup. */
export interface GripFitContactAttributes {
  /** The visitor's personal reference code for their locked price. */
  DISCOUNT_CODE?: string;
  /** Where the signup came from — always "website" from this app. */
  SIGNUP_SOURCE?: string;
  /** ISO-8601 timestamp of first capture. */
  SIGNUP_TS?: string;
  /** Price-experiment fields (DECISIONS.md §17). Written once, on the
   *  first website signup for an email, and never overwritten — that is
   *  what keeps a returning email at its original lock. */
  VISITOR_ID?: string;
  EXPERIMENT_ID?: string;
  /** The price arm the visitor saw when they signed up. */
  PRICE_ARM?: number;
  /** The Super Early Bird price the email is locked at, whole USD. */
  PRICE_LOCKED?: number;
  UTM_CAMPAIGN?: string;
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

export interface UnsubscribeContactInput {
  email: string;
  /** Lists to drop the contact from, in addition to the global opt-out. */
  listIds?: number[];
}

/** Brevo's error envelope: `{ code, message }`. */
export interface BrevoErrorBody {
  code?: string;
  message?: string;
}
