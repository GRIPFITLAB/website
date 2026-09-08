"use server";

import { sendTransactionalEmail } from "@/lib/brevo";
import { siteConfig } from "@/lib/config";
import { env, isContactEmailConfigured } from "@/lib/env";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

import {
  contactSchema,
  type ContactFormState,
} from "./contact-schema";

/**
 * Contact form → Brevo transactional email (PRD R-013).
 *
 * Schema lives here (server side) so submissions can't bypass validation
 * by calling the Action directly. The client form re-uses the same shape
 * for instant feedback.
 *
 * `replyTo` is set to the submitter so hitting reply in the support
 * inbox answers them directly. The *sender* stays the verified Brevo
 * address — sending as the visitor's domain would fail SPF/DKIM.
 *
 * When Brevo isn't configured the action still validates, logs, and
 * reports success so the form stays usable pre-launch (PRD R-014).
 */
const SUCCESS_MESSAGE =
  "Thanks — we received your message and will reply within 1–2 business days.";

const GENERIC_ERROR =
  "We couldn't send your message just now. Please try again in a moment.";

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
    const fieldErrors: Partial<Record<"name" | "email" | "message", string>> =
      {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        (key === "name" || key === "email" || key === "message") &&
        !fieldErrors[key]
      ) {
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
      message:
        "You've sent a few messages already. Give it a few minutes before sending another.",
    };
  }

  if (!isContactEmailConfigured || !env.CONTACT_EMAIL_TO) {
    console.warn(
      "[contact] Brevo/CONTACT_EMAIL_TO not configured — submission accepted but no email sent.",
      { name, email },
    );
    return {
      status: "success",
      message:
        "Thanks — we received your message. (Email delivery isn't wired up yet, so we'll follow up once it's live.)",
    };
  }

  try {
    await sendTransactionalEmail({
      to: [{ email: env.CONTACT_EMAIL_TO }],
      replyTo: { email, name },
      subject: `${siteConfig.name} contact form — ${name}`,
      textContent: [
        `From: ${name} <${email}>`,
        "",
        message,
      ].join("\n"),
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
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f3ece2;font-family:Inter,Helvetica,Arial,sans-serif;color:#1c1a17;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#faf6f0;border-radius:12px;padding:28px;">
    <tr><td>
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#8a8378;">Contact form</p>
      <p style="margin:0 0 20px;font-size:16px;font-weight:500;">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p style="margin:0;font-size:15px;line-height:1.65;white-space:pre-wrap;color:#4a453d;">${escapeHtml(message)}</p>
    </td></tr>
  </table>
</body>
</html>`;
}
