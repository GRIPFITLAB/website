"use server";

import { after } from "next/server";

import { getContact, sendTransactionalEmail, upsertContact } from "@/lib/brevo";
import type { BrevoContact, GripFitContactAttributes } from "@/lib/brevo/types";
import { siteConfig } from "@/lib/config";
import { generateDiscountCode } from "@/lib/discount-code";
import { env, isBrevoConfigured } from "@/lib/env";
import { getVisitorContext } from "@/lib/experiment/server";
import { recordLead, type PriceLock } from "@/lib/experiment/store";
import {
  computePricing,
  emailLockConfirmation,
  formatUSD,
  isValidArmId,
  type Pricing,
} from "@/lib/pricing";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { emailTheme } from "@/lib/theme";
import { sendMetaEvent } from "@/lib/tracking/meta-capi";

import { emailDiscountSchema, type EmailDiscountState } from "./email-discount-schema";

/**
 * Super Early Bird email capture — shared by the modal, the footer form,
 * and /kickstarter. Joining the list locks in the visitor's arm's price.
 *
 * Flow:
 *   1. Validate server-side (Zod + honeypot) and rate-limit per IP.
 *   2. Read the visitor's signed arm assignment + attribution (cookies set
 *      by the proxy). The price comes only from that server-side lookup —
 *      nothing in the form can change it.
 *   3. Brevo: an email that already has a lock keeps it (arm, price, code,
 *      first-touch fields untouched); otherwise lock the current arm's
 *      price. Upsert the contact and email the confirmation.
 *   4. After the response: persist the lead to Firestore (source of truth
 *      for conversion by arm) and send the Conversions API `Lead` with the
 *      browser's event id so Meta dedups it against the Pixel.
 *
 * Every integration degrades to a log line when unconfigured, so the form
 * works on a zero-config deploy.
 */
const GENERIC_ERROR = "We couldn't lock in your price just now. Please try again in a moment.";

/** The lock already stored on a Brevo contact, if any. */
function existingLock(contact: BrevoContact | null): PriceLock | null {
  const amount = contact?.attributes?.PRICE_LOCKED;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return null;
  const arm = contact?.attributes?.PRICE_ARM;
  return { armId: isValidArmId(arm) ? arm : null, amount };
}

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
  let lock: PriceLock = { armId: pricing.armId, amount: pricing.superEarlyBird.amount };

  if (!isBrevoConfigured) {
    console.warn("[email-discount] Brevo not configured — submission accepted, no email sent.", {
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

      const prior = existingLock(existing);
      const attributes: GripFitContactAttributes = { DISCOUNT_CODE: code };
      if (prior) {
        lock = prior;
      } else {
        // First lock for this email. A contact may already exist without one
        // (e.g. an iOS-app signup); keep its original signup timestamp.
        Object.assign(attributes, {
          SIGNUP_SOURCE: "website",
          VISITOR_ID: assignment?.visitorId ?? "",
          EXPERIMENT_ID: assignment?.experimentId ?? "",
          PRICE_ARM: lock.armId ?? undefined,
          PRICE_LOCKED: lock.amount,
          UTM_CAMPAIGN: attribution?.utm_campaign ?? "",
        } satisfies GripFitContactAttributes);
        if (typeof existing?.attributes?.SIGNUP_TS !== "string") {
          attributes.SIGNUP_TS = new Date().toISOString();
        }
      }

      await upsertContact({
        email,
        attributes,
        ...(env.BREVO_WEBSITE_LIST_ID ? { listIds: [env.BREVO_WEBSITE_LIST_ID] } : {}),
      });

      const armPricing = lock.armId !== null ? computePricing(lock.armId) : null;
      await sendTransactionalEmail({
        to: [{ email }],
        ...(env.BREVO_DISCOUNT_TEMPLATE_ID
          ? {
              templateId: env.BREVO_DISCOUNT_TEMPLATE_ID,
              params: {
                DISCOUNT_CODE: code,
                SUPER_EARLY_BIRD_PRICE: formatUSD(lock.amount),
                KICKSTARTER_PRICE: armPricing?.kickstarter.formatted ?? "",
                EXPECTED_RETAIL_PRICE: armPricing?.retail.formatted ?? "",
              },
            }
          : {
              subject: `Your ${siteConfig.name} price is locked at ${formatUSD(lock.amount)}`,
              htmlContent: lockEmailHtml(code, email, lock.amount, armPricing),
              textContent: lockEmailText(code, email, lock.amount, armPricing),
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
      recordLead({
        email,
        discountCode: code,
        source,
        assignment,
        pricing,
        lock,
        attribution,
        eventId,
      }),
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
          value: lock.amount,
          price_arm: lock.armId,
          assigned_price: pricing.kickstarter.amount,
          experiment_id: assignment?.experimentId ?? null,
          content_name: source,
        },
      }),
    ]);
  });

  return { status: "success", message: emailLockConfirmation(lock.amount), eventId };
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

function armSentence(p: Pricing): string {
  return `The Kickstarter price will be no more than ${p.kickstarter.formatted}, and expected retail after the campaign is ${p.retail.formatted}.`;
}

function lockEmailText(code: string, email: string, amount: number, p: Pricing | null): string {
  const unsub = unsubscribeUrl(email, code);
  return [
    `Your ${siteConfig.name} Super Early Bird price is locked at ${formatUSD(amount)}.`,
    ...(p ? ["", armSentence(p)] : []),
    "",
    `Your reference code: ${code}`,
    "",
    "The campaign isn't live yet. Keep this email: we'll write to you the day it opens, with instructions for claiming your price.",
    "",
    `— The ${siteConfig.name} team`,
    "",
    unsub
      ? `Don't want these emails? Unsubscribe: ${unsub}`
      : `Don't want these emails? Reply to this message and we'll remove you.`,
  ].join("\n");
}

function lockEmailHtml(code: string, email: string, amount: number, p: Pricing | null): string {
  const t = emailTheme;
  const unsub = unsubscribeUrl(email, code);
  const locked = formatUSD(amount);
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:${t.pageBg};font-family:Inter,Helvetica,Arial,sans-serif;color:${t.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.pageBg};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${t.cardBg};border-radius:16px;padding:40px 32px;">
        <tr><td>
          <p style="margin:0 0 24px;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${t.accent};">${siteConfig.name} · Super Early Bird</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:500;color:${t.text};">Your price is locked at ${locked}.</h1>
          ${
            p
              ? `<p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:${t.textMuted};">${armSentence(p)}</p>`
              : ""
          }
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${t.textMuted};">Your reference code</p>
          <p style="margin:0 0 28px;padding:20px;background:${t.codeBg};border-radius:12px;text-align:center;font-size:24px;font-weight:600;letter-spacing:0.08em;color:${t.text};">${code}</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:${t.textMuted};">
            The campaign isn't live yet. Keep this email — we'll write to you the day it opens, with instructions for claiming your price.
          </p>
          <p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:${t.textFaint};">— The ${siteConfig.name} team</p>
          <p style="margin:0;padding-top:20px;border-top:1px solid ${t.rule};font-size:12px;line-height:1.6;color:${t.textFaint};">
            You're receiving this because you joined the ${siteConfig.name} Kickstarter list.
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
