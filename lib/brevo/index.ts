import "server-only";

import { brevoFetch } from "@/lib/brevo/client";
import { env, requireEnv } from "@/lib/env";

import type {
  BrevoContact,
  SendTransactionalEmailInput,
  UnsubscribeContactInput,
  UpsertContactInput,
} from "@/lib/brevo/types";

/**
 * Public Brevo surface. Server Actions import from `@/lib/brevo`, never
 * from the underlying modules.
 *
 * Brevo is the system of record for captured emails and their discount
 * codes — there is no local database (EDD D-004).
 *
 * **Setup prerequisite — silent failure if skipped.** The custom contact
 * attributes `DISCOUNT_CODE` (text), `DISCOUNT_PCT` (number),
 * `SIGNUP_SOURCE` (text), and `SIGNUP_TS` (text) must exist in the Brevo
 * account first.
 *
 * Brevo does **not** reject a write to an attribute it does not know. It
 * returns 2xx and silently drops the unknown fields, so the signup looks
 * entirely successful — contact created, code emailed — while the code is
 * never stored. That breaks idempotency (R-012: every re-submit mints a new
 * code) and leaves no record to reconcile against (R-015), because Brevo is
 * the only store. This was live in production on 2026-09-08.
 *
 * `npm run brevo:check` verifies the attributes exist; `npm run brevo:setup`
 * creates any that are missing.
 */

export {
  BrevoHttpError,
  BrevoNetworkError,
  brevoFetch,
} from "@/lib/brevo/client";
export type * from "@/lib/brevo/types";

/**
 * Look up one contact by email address.
 * Returns `null` when Brevo has never seen the address (404).
 */
export async function getContact(email: string): Promise<BrevoContact | null> {
  return brevoFetch<BrevoContact>(
    `/contacts/${encodeURIComponent(email)}`,
    { nullOn: [404] },
  );
}

/**
 * Create or update a contact.
 *
 * `updateEnabled: true` makes this idempotent — Brevo merges the given
 * attributes and list memberships into an existing contact instead of
 * failing with `duplicate_parameter`.
 */
export async function upsertContact({
  email,
  attributes,
  listIds,
}: UpsertContactInput): Promise<void> {
  await brevoFetch<{ id: number }>("/contacts", {
    method: "POST",
    body: {
      email,
      updateEnabled: true,
      ...(attributes ? { attributes } : {}),
      ...(listIds && listIds.length > 0 ? { listIds } : {}),
    },
  });
}

/**
 * Opt a contact out of all email.
 *
 * `emailBlacklisted` is Brevo's own global opt-out flag, so it survives
 * being re-added to a list later — safer than only dropping the list
 * membership, which a subsequent `upsertContact` would silently undo.
 * The list is removed too, so exports stop including them.
 *
 * Idempotent: unsubscribing an already-unsubscribed contact is a no-op.
 */
export async function unsubscribeContact({
  email,
  listIds,
}: UnsubscribeContactInput): Promise<void> {
  await brevoFetch(`/contacts/${encodeURIComponent(email)}`, {
    method: "PUT",
    body: {
      emailBlacklisted: true,
      ...(listIds && listIds.length > 0 ? { unlinkListIds: listIds } : {}),
    },
  });
}

/**
 * Send one transactional email.
 *
 * The sender is always `BREVO_SENDER_EMAIL` — it must be a verified
 * sender in Brevo or the message is rejected.
 */
export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
  textContent,
  templateId,
  params,
  replyTo,
}: SendTransactionalEmailInput): Promise<void> {
  const senderEmail = requireEnv("BREVO_SENDER_EMAIL");

  await brevoFetch<{ messageId: string }>("/smtp/email", {
    method: "POST",
    body: {
      sender: { email: senderEmail, name: env.BREVO_SENDER_NAME },
      to,
      ...(templateId
        ? { templateId, ...(params ? { params } : {}) }
        : {
            ...(subject ? { subject } : {}),
            ...(htmlContent ? { htmlContent } : {}),
            ...(textContent ? { textContent } : {}),
          }),
      ...(replyTo ? { replyTo } : {}),
    },
  });
}
