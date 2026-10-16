"use server";

import { after } from "next/server";

import { getContact, sendTransactionalEmail, upsertContact } from "@/lib/brevo";
import { discountConfig, siteConfig } from "@/lib/config";
import { generateDiscountCode } from "@/lib/discount-code";
import { env, isBrevoConfigured } from "@/lib/env";
import { getVisitorContext } from "@/lib/experiment/server";
import { recordLead } from "@/lib/experiment/store";
import type { Pricing } from "@/lib/pricing";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { emailTheme } from "@/lib/theme";
import { sendMetaEvent } from "@/lib/tracking/meta-capi";

import { emailDiscountSchema, type EmailDiscountState } from "./email-discount-schema";

/**
 * Super Early Bird email capture — shared by the modal, the footer form,
 * and /kickstarter.
 *
 * Flow:
 *   1. Validate server-side (Zod + honeypot) and rate-limit per IP.
 *   2. Read the visitor's price assignment + attribution (cookies set by
 *      the proxy) — this is what makes the lead analysable by price.
 *   3. Brevo: reuse an existing code or mint one; upsert the contact with
 *      the code AND the experiment fields; email the code.
 *   4. After the response: persist the lead to Firestore (source of truth
 *      for the demand curve) and send the Conversions API `Lead` with the
 *      browser's event id so Meta dedups it against the Pixel.
 *
 * Every integration degrades to a log line when unconfigured, so the form
 * works on a zero-config deploy.
 */
const GENERIC_ERROR = "We couldn't send your code just now. Please try again in a moment.";

export async function submitEmailDiscount(
  _prev: EmailDiscountState,
  formData: FormData,
): Promise<EmailDiscountState> {
  const parsed = emailDiscountSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
    event_id: String(formData.get("event_id") ?? ""),
    source: String(formData.get("source") ?? "modal"),
  });

  if (!parsed.success) {
    const fieldErrors: { email?: string } = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "email" && !fieldErrors.email) fieldErrors.email = issue.message;
    }
    return { status: "error", message: "Please enter a valid email address.", fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const eventId = parsed.data.event_id || null;
  const source = parsed.data.source ?? "modal";

  const limit = checkRateLimit(await clientKey("email-discount"), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.ok) {
    return {
      status: "error",
      message: "That's a few too many tries. Give it a few minutes and try again.",
    };
  }

  // Visitor context: assignment, attribution, pricing, Meta cookies.
  const visitor = await getVisitorContext();
  const { pricing, assignment, attribution } = visitor;

  let code: string;

  if (!isBrevoConfigured) {
    console.warn("[email-discount] Brevo not configured — submission accepted, no code sent.", {
      email,
    });
    code = generateDiscountCode();
  } else {
    try {
      const existing = await getContact(email);
      const existingCode = existing?.attributes?.DISCOUNT_CODE;
      code =
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
          VISITOR_ID: assignment?.visitorId ?? "",
          EXPERIMENT_ID: assignment?.experimentId ?? "",
          PRICE_ASSIGNED: pricing.kickstarter.amount,
          UTM_CAMPAIGN: attribution?.utm_campaign ?? "",
        },
        ...(env.BREVO_WEBSITE_LIST_ID ? { listIds: [env.BREVO_WEBSITE_LIST_ID] } : {}),
      });

      await sendTransactionalEmail({
        to: [{ email }],
        ...(env.BREVO_DISCOUNT_TEMPLATE_ID
          ? {
              templateId: env.BREVO_DISCOUNT_TEMPLATE_ID,
              params: {
                DISCOUNT_CODE: code,
                SUPER_EARLY_BIRD_PRICE: pricing.superEarlyBird.formatted,
                KICKSTARTER_PRICE: pricing.kickstarter.formatted,
              },
            }
          : {
              subject: `Your ${siteConfig.name} Super Early Bird code: ${code}`,
              htmlContent: discountEmailHtml(code, email, pricing),
              textContent: discountEmailText(code, email, pricing),
            }),
      });
    } catch (error) {
      console.error("[email-discount] Brevo call failed", error);
      return { status: "error", message: GENERIC_ERROR };
    }
  }

  // Persist + report after the response so neither slows the visitor down.
  const { fbp, fbc, clientIp, userAgent } = visitor;
  after(async () => {
    await Promise.all([
      recordLead({ email, discountCode: code, source, assignment, pricing, attribution, eventId }),
      sendMetaEvent({
        eventName: "Lead",
        eventId: eventId ?? crypto.randomUUID(),
        eventSourceUrl: siteConfig.url,
        email,
        clientIp,
        userAgent,
        fbp,
        fbc,
        customData: {
          currency: "USD",
          value: pricing.superEarlyBird.amount,
          assigned_price: pricing.kickstarter.amount,
          experiment_id: assignment?.experimentId ?? null,
          content_name: source,
        },
      }),
    ]);
  });

  return { status: "success", message: discountConfig.email.confirmationCopy, eventId };
}

/**
 * Absolute unsubscribe URL, or `null` when `SITE_URL` is unset. The code
 * doubles as ownership proof — see `components/forms/unsubscribe-action.ts`.
 */
function unsubscribeUrl(email: string, code: string): string | null {
  if (!siteConfig.url) return null;
  const url = new URL("/unsubscribe", siteConfig.url);
  url.searchParams.set("e", email);
  url.searchParams.set("c", code);
  return url.toString();
}

/* ── Fallback email body (when no Brevo template is configured) ──────── */

function discountEmailText(code: string, email: string, p: Pricing): string {
  const unsub = unsubscribeUrl(email, code);
  return [
    `Your ${siteConfig.name} ${p.superEarlyBird.label} code: ${code}`,
    "",
    `It takes an extra ${p.emailPercentOff}% off the Kickstarter price — ${p.superEarlyBird.formatted} instead of ${p.kickstarter.formatted} (retail ${p.retail.formatted}).`,
    "",
    "The campaign isn't live yet. Keep this email: we'll write to you the day it opens, with instructions for applying your code.",
    "",
    `— The ${siteConfig.name} team`,
    "",
    unsub
      ? `Don't want these emails? Unsubscribe: ${unsub}`
      : `Don't want these emails? Reply to this message and we'll remove you.`,
  ].join("\n");
}

function discountEmailHtml(code: string, email: string, p: Pricing): string {
  const t = emailTheme;
  const unsub = unsubscribeUrl(email, code);
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:${t.pageBg};font-family:Inter,Helvetica,Arial,sans-serif;color:${t.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.pageBg};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${t.cardBg};border-radius:16px;padding:40px 32px;">
        <tr><td>
          <p style="margin:0 0 24px;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${t.accent};">${siteConfig.name} · ${p.superEarlyBird.label}</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:500;color:${t.text};">Here's your code.</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:${t.textMuted};">
            It takes an extra ${p.emailPercentOff}% off the Kickstarter price —
            <strong style="color:${t.text};">${p.superEarlyBird.formatted}</strong> instead of ${p.kickstarter.formatted}
            (retail ${p.retail.formatted}).
          </p>
          <p style="margin:0 0 28px;padding:20px;background:${t.codeBg};border-radius:12px;text-align:center;font-size:24px;font-weight:600;letter-spacing:0.08em;color:${t.text};">${code}</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:${t.textMuted};">
            The campaign isn't live yet. Keep this email — we'll write to you the day it opens, with instructions for applying your code.
          </p>
          <p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:${t.textFaint};">— The ${siteConfig.name} team</p>
          <p style="margin:0;padding-top:20px;border-top:1px solid ${t.rule};font-size:12px;line-height:1.6;color:${t.textFaint};">
            You're receiving this because you asked for a ${p.superEarlyBird.label} code at ${siteConfig.name}.
            ${
              unsub
                ? `<a href="${unsub}" style="color:${t.textFaint};text-decoration:underline;">Unsubscribe</a>.`
                : `Reply to this message and we'll remove you.`
            }
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
