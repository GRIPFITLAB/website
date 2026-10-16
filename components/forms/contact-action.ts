"use server";

import { after } from "next/server";

import { sendTransactionalEmail } from "@/lib/brevo";
import { siteConfig } from "@/lib/config";
import { env, isContactEmailConfigured } from "@/lib/env";
import { getVisitorContext } from "@/lib/experiment/server";
import { recordContact } from "@/lib/experiment/store";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { emailTheme } from "@/lib/theme";

import { contactSchema, type ContactFormState } from "./contact-schema";

/**
 * Contact form → (1) Brevo transactional email to `EMAIL_SUPPORT`, and
 * (2) a Firestore `{prefix}contacts` document so nothing is lost if the
 * inbox is misconfigured. Firestore is written after the response and
 * degrades to a log line when `FIREBASE_SERVICE_ACCOUNT_JSON` is unset.
 *
 * Schema lives in `./contact-schema.ts` so the client form re-uses it.
 * `replyTo` is the submitter so hitting reply answers them directly; the
 * *sender* stays the verified Brevo address (SPF/DKIM).
 */
const SUCCESS_MESSAGE =
  "Thanks — we received your message and will reply within 1–2 business days.";

const GENERIC_ERROR = "We couldn't send your message just now. Please try again in a moment.";

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<"name" | "email" | "message", string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "name" || key === "email" || key === "message") && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the errors below and try again.",
      fieldErrors,
    };
  }

  const { name, email, message } = parsed.data;

  const limit = checkRateLimit(await clientKey("contact"), {
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.ok) {
    return {
      status: "error",
      message: "You've sent a few messages already. Give it a few minutes before sending another.",
    };
  }

  // Persist regardless of email delivery.
  const { assignment } = await getVisitorContext();
  after(() =>
    recordContact({ name, email, message, visitorId: assignment?.visitorId ?? null }),
  );

  if (!isContactEmailConfigured || !env.EMAIL_SUPPORT) {
    console.warn(
      "[contact] Brevo/EMAIL_SUPPORT not configured — submission stored, no email sent.",
      { name, email },
    );
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  try {
    await sendTransactionalEmail({
      to: [{ email: env.EMAIL_SUPPORT }],
      replyTo: { email, name },
      subject: `${siteConfig.name} contact form — ${name}`,
      textContent: [`From: ${name} <${email}>`, "", message].join("\n"),
      htmlContent: contactEmailHtml({ name, email, message }),
    });

    return { status: "success", message: SUCCESS_MESSAGE };
  } catch (error) {
    console.error("[contact] Brevo send failed", error);
    return { status: "error", message: GENERIC_ERROR };
  }
}

/** Escape submitted text before interpolating it into the HTML body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function contactEmailHtml({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): string {
  const t = emailTheme;
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:${t.pageBg};font-family:Inter,Helvetica,Arial,sans-serif;color:${t.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${t.cardBg};border-radius:12px;padding:28px;">
    <tr><td>
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${t.textFaint};">Contact form</p>
      <p style="margin:0 0 20px;font-size:16px;font-weight:500;">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p style="margin:0;font-size:15px;line-height:1.65;white-space:pre-wrap;color:${t.textMuted};">${escapeHtml(message)}</p>
    </td></tr>
  </table>
</body>
</html>`;
}
