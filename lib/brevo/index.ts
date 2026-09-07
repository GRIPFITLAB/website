import "server-only";

import { brevoFetch } from "@/lib/brevo/client";
import { env, requireEnv } from "@/lib/env";

import type {
  BrevoContact,
  SendTransactionalEmailInput,
  UpsertContactInput,
} from "@/lib/brevo/types";

/**
 * Public Brevo surface. Server Actions import from `@/lib/brevo`, never
 * from the underlying modules.
 *
 * Brevo is the system of record for captured emails and their discount
 * codes — there is no local database (EDD D-004).
 *
 * **Setup prerequisite:** the custom contact attributes `DISCOUNT_CODE`
 * (text), `DISCOUNT_PCT` (number), `SIGNUP_SOURCE` (text), and
 * `SIGNUP_TS` (text) must exist in the Brevo account before
 * `upsertContact` will accept them. Brevo rejects writes to attributes
 * it doesn't know about.
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
