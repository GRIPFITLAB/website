"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { endAdminSession, isAdminAuthenticated, startAdminSession } from "@/lib/dashboard/auth";
import { ADMIN_PATH, credentialsMatch } from "@/lib/dashboard/session";
import { env, isAdminConfigured } from "@/lib/env";
import { LEAD_ID_RE, setLeadExcluded } from "@/lib/experiment/store";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

import { adminSignInSchema, type AdminSignInState } from "./admin-schema";

/** One message for every failure, so the form can't be used to probe
 *  which half of the pair was wrong. */
const REJECTED = "Those details didn't match. Check them and try again.";

export async function signInAdmin(
  _prev: AdminSignInState,
  formData: FormData,
): Promise<AdminSignInState> {
  const email = String(formData.get("email") ?? "").slice(0, 254);
  const fail = (message: string): AdminSignInState => ({ status: "error", message, email });

  const limit = checkRateLimit(await clientKey("admin-signin"), {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
    return fail(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const parsed = adminSignInSchema.safeParse({
    email,
    passcode: String(formData.get("passcode") ?? ""),
  });
  if (!parsed.success) return fail(REJECTED);

  if (!isAdminConfigured || !env.ADMIN_EMAIL || !env.ADMIN_PASSCODE) {
    console.warn("[admin] sign-in attempted but ADMIN_EMAIL / ADMIN_PASSCODE are unset");
    return fail(REJECTED);
  }

  const ok = await credentialsMatch(parsed.data, {
    email: env.ADMIN_EMAIL,
    passcode: env.ADMIN_PASSCODE,
  });
  if (!ok) return fail(REJECTED);

  const proto = (await headers()).get("x-forwarded-proto");
  await startAdminSession(proto === "https" || env.NODE_ENV === "production");
  redirect(ADMIN_PATH);
}

/** Toggle whether a subscriber counts toward the price experiment. */
export async function setSubscriberExcluded(
  leadId: string,
  excluded: boolean,
): Promise<{ ok: boolean }> {
  if (!(await isAdminAuthenticated())) return { ok: false };
  if (typeof leadId !== "string" || !LEAD_ID_RE.test(leadId) || typeof excluded !== "boolean") {
    return { ok: false };
  }
  try {
    const ok = await setLeadExcluded(leadId, excluded);
    if (ok) refresh();
    return { ok };
  } catch (error) {
    console.error("[admin] setSubscriberExcluded failed", error);
    return { ok: false };
  }
}

export async function signOutAdmin(): Promise<void> {
  await endAdminSession();
  redirect(ADMIN_PATH);
}
