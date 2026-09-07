"use server";

import { z } from "zod";

import { getContact, sendTransactionalEmail, upsertContact } from "@/lib/brevo";
import { discountConfig, getStackedPreorderPricing, siteConfig } from "@/lib/config";
import { generateDiscountCode } from "@/lib/discount-code";
import { env, isBrevoConfigured } from "@/lib/env";

/**
 * Email-discount capture — the extra-15%-off flow shared by the modal,
 * the footer form, and every teaser button.
 *
 * Flow (PRD R-011, R-012):
 *   1. Validate server-side (Zod + honeypot) so a direct call to the
 *      Action can't bypass the client form's checks.
 *   2. Look the address up in Brevo. If it already has a DISCOUNT_CODE,
 *      reuse it — re-submitting must never mint a second code.
 *   3. Upsert the contact into the signup list with the code attached.
 *   4. Email the code.
 *
 * Brevo is the only store (EDD D-004); there is no database.
 *
 * When Brevo isn't configured yet the action still validates, logs, and
 * reports success — the site has to stay deployable and demoable before
 * credentials land (PRD R-014).
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

const GENERIC_ERROR =
  "We couldn't send your code just now. Please try again in a moment.";

export async function submitEmailDiscount(
  _prev: EmailDiscountState,
  formData: FormData,
): Promise<EmailDiscountState> {
  const parsed = emailDiscountSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
  });

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

  const email = parsed.data.email.toLowerCase();

  if (!isBrevoConfigured) {
    console.warn(
      "[email-discount] Brevo not configured — submission accepted, no code sent.",
      { email },
    );
    return { status: "success", message: discountConfig.email.confirmationCopy };
  }

  try {
    // Reuse an existing code so a repeat submit re-sends rather than
    // issuing a second code for the same address (PRD R-012).
    const existing = await getContact(email);
    const existingCode = existing?.attributes?.DISCOUNT_CODE;
    const code =
      typeof existingCode === "string" && existingCode.length > 0
        ? existingCode
        : generateDiscountCode();

    await upsertContact({
      email,
      attributes: {
        DISCOUNT_CODE: code,
        DISCOUNT_PCT: Math.round(discountConfig.email.percentOff * 100),
        SIGNUP_SOURCE: "website",
        SIGNUP_TS: new Date().toISOString(),
      },
      ...(env.BREVO_WEBSITE_LIST_ID
        ? { listIds: [env.BREVO_WEBSITE_LIST_ID] }
        : {}),
    });

    await sendTransactionalEmail({
      to: [{ email }],
      ...(env.BREVO_DISCOUNT_TEMPLATE_ID
        ? {
            templateId: env.BREVO_DISCOUNT_TEMPLATE_ID,
            params: { DISCOUNT_CODE: code },
          }
        : {
            subject: `Your ${siteConfig.name} pre-order code: ${code}`,
            htmlContent: discountEmailHtml(code),
            textContent: discountEmailText(code),
          }),
    });

    return { status: "success", message: discountConfig.email.confirmationCopy };
  } catch (error) {
    // Never surface Brevo internals to the visitor; log for triage.
    console.error("[email-discount] Brevo call failed", error);
    return { status: "error", message: GENERIC_ERROR };
  }
}

/* ── Fallback email body ──────────────────────────────────────────────
 * Used when BREVO_DISCOUNT_TEMPLATE_ID is unset. Inline styles only —
 * email clients ignore <style> blocks and external CSS.
 * ------------------------------------------------------------------ */

function discountEmailText(code: string): string {
  const { formattedList, formattedStacked } = getStackedPreorderPricing();
  const campaignPct = Math.round(discountConfig.preorder.percentOff * 100);
  const emailPct = Math.round(discountConfig.email.percentOff * 100);

  return [
    `Your ${siteConfig.name} code: ${code}`,
    "",
    `This code takes an extra ${emailPct}% off on top of the ${campaignPct}% Kickstarter pre-order discount — ${formattedStacked} instead of ${formattedList}.`,
    "",
    "The campaign isn't live yet. Keep this email: we'll write to you the day it opens, with instructions for applying your code.",
    "",
    `— The ${siteConfig.name} team`,
  ].join("\n");
}

function discountEmailHtml(code: string): string {
  const { formattedList, formattedStacked } = getStackedPreorderPricing();
  const campaignPct = Math.round(discountConfig.preorder.percentOff * 100);
  const emailPct = Math.round(discountConfig.email.percentOff * 100);

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f3ece2;font-family:Inter,Helvetica,Arial,sans-serif;color:#1c1a17;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ece2;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#faf6f0;border-radius:16px;padding:40px 32px;">
        <tr><td>
          <p style="margin:0 0 24px;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#b54a30;">${siteConfig.name}</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:500;color:#1c1a17;">Here's your code.</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a453d;">
            It takes an extra ${emailPct}% off on top of the ${campaignPct}% Kickstarter pre-order discount —
            <strong style="color:#1c1a17;">${formattedStacked}</strong> instead of ${formattedList}.
          </p>
          <p style="margin:0 0 28px;padding:20px;background:#f3ece2;border-radius:12px;text-align:center;font-size:24px;font-weight:600;letter-spacing:0.08em;color:#1c1a17;">${code}</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a453d;">
            The campaign isn't live yet. Keep this email — we'll write to you the day it opens, with instructions for applying your code.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#8a8378;">— The ${siteConfig.name} team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
