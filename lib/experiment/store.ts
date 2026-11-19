import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";

import { env, isFirebaseConfigured } from "@/lib/env";
import type { Pricing } from "@/lib/pricing";

import type { Assignment } from "./assignment";
import type { Attribution } from "./attribution";

/**
 * Lead + visitor database — Firestore, in the Firebase project the iOS app
 * already uses. **This is the source of truth for the demand curve.**
 *
 *   {prefix}visitors/{visitorId}   one doc per assigned visitor (exposure)
 *   {prefix}leads/{sha256(email)}  one doc per captured email (conversion)
 *   {prefix}contacts/{auto}        contact-form messages
 *
 * Conversion rate for arm A = leads where priceArm == A ÷ visitors where
 * priceArm == A (visitors = impressions: one per visitor shown the arm).
 * `scripts/export-leads.mjs` dumps both as CSV and prints the per-arm table.
 *
 * Degrades like every other integration here: with no service account the
 * functions log and return, so the site is fully usable before Firebase is
 * wired up. Writes are fire-and-forget from the caller's perspective — the
 * caller wraps them in `after()` so they never block a response.
 */

let app: App | null = null;
let db: Firestore | null = null;

function parseServiceAccount(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const json = trimmed.startsWith("{")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");
  const parsed = JSON.parse(json) as Record<string, unknown>;
  // Vercel's dashboard turns real newlines into the two characters "\n".
  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

function firestore(): Firestore | null {
  if (!isFirebaseConfigured || !env.FIREBASE_SERVICE_ACCOUNT_JSON) return null;
  if (db) return db;
  try {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert(parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT_JSON)),
      });
    db = getFirestore(app);
    return db;
  } catch (error) {
    console.error("[store] Firebase init failed — check FIREBASE_SERVICE_ACCOUNT_JSON", error);
    return null;
  }
}

function col(name: string): string {
  return `${env.FIRESTORE_COLLECTION_PREFIX}${name}`;
}

/* ── Visitors (exposures) ────────────────────────────────────────────── */

export interface VisitorRecordInput {
  assignment: Assignment;
  pricing: Pricing;
  attribution: Attribution | null;
  userAgent: string | null;
  country: string | null;
}

/** Idempotent: re-recording the same visitor merges, never duplicates. */
export async function recordVisitor(input: VisitorRecordInput): Promise<void> {
  const store = firestore();
  if (!store) {
    console.info("[store] visitor (no Firebase)", {
      visitorId: input.assignment.visitorId,
      armId: input.assignment.armId,
    });
    return;
  }
  const { assignment, pricing, attribution } = input;
  try {
    await store
      .collection(col("visitors"))
      .doc(assignment.visitorId)
      .set(
        {
          visitorId: assignment.visitorId,
          experimentId: assignment.experimentId,
          priceArm: assignment.armId,
          emailLockPrice: pricing.superEarlyBird.amount,
          kickstarterCeiling: pricing.kickstarter.amount,
          expectedRetail: pricing.retail.amount,
          attribution: attribution ?? {},
          userAgent: input.userAgent ?? null,
          country: input.country ?? null,
          firstSeenAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  } catch (error) {
    console.error("[store] recordVisitor failed", error);
  }
}

/* ── Leads (conversions) ─────────────────────────────────────────────── */

/** The price an email is locked at, and the arm it came from. */
export interface PriceLock {
  /** `null` when the lock predates arms or names an arm since removed. */
  armId: number | null;
  amount: number;
}

export interface LeadRecordInput {
  email: string;
  discountCode: string;
  /** Which surface submitted: modal | footer | kickstarter. */
  source: string;
  assignment: Assignment | null;
  /** What this visitor is being shown right now. */
  pricing: Pricing;
  /** What the email is locked at — the original lock for a returning email. */
  lock: PriceLock;
  attribution: Attribution | null;
  /** Browser-generated id shared with the Pixel for CAPI dedup. */
  eventId: string | null;
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * One doc per email. Repeat submits bump `submitCount`; the arm, lock, and
 * first-touch fields are written once and never overwritten.
 */
export async function recordLead(input: LeadRecordInput): Promise<void> {
  const store = firestore();
  if (!store) {
    console.info("[store] lead (no Firebase)", {
      email: input.email,
      visitorId: input.assignment?.visitorId ?? null,
      lock: input.lock,
    });
    return;
  }
  try {
    const id = (await sha256Hex(input.email)).slice(0, 40);
    const ref = store.collection(col("leads")).doc(id);
    const existing = await ref.get();
    const base = {
      email: input.email,
      discountCode: input.discountCode,
      lastSource: input.source,
      lastEventId: input.eventId ?? null,
      lastSubmittedAt: FieldValue.serverTimestamp(),
      submitCount: FieldValue.increment(1),
    };
    if (existing.exists) {
      await ref.set(base, { merge: true });
      return;
    }
    await ref.set({
      ...base,
      firstSource: input.source,
      visitorId: input.assignment?.visitorId ?? null,
      experimentId: input.assignment?.experimentId ?? null,
      priceArm: input.lock.armId,
      lockedPrice: input.lock.amount,
      /** Arm on screen at signup; differs from `priceArm` only when the
       *  email was already locked in Brevo before this doc existed. */
      displayedArm: input.pricing.armId,
      isExperimentPrice: input.pricing.isExperimentPrice,
      attribution: input.attribution ?? {},
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("[store] recordLead failed", error);
  }
}

/* ── Reads (admin dashboard) ─────────────────────────────────────────── */

type Data = Record<string, unknown>;

function millis(v: unknown): number | null {
  if (v && typeof (v as { toMillis?: unknown }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  return null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export interface VisitorRow {
  visitorId: string;
  priceArm: number | null;
  firstSeenAt: number | null;
}

/**
 * Every recorded impression for one experiment, projected to the two
 * fields the dashboard aggregates. `null` = Firestore isn't configured.
 * Throws on a Firestore error so the caller can surface it.
 */
export async function listExperimentVisitors(experimentId: string): Promise<VisitorRow[] | null> {
  const store = firestore();
  if (!store) return null;
  const snap = await store
    .collection(col("visitors"))
    .where("experimentId", "==", experimentId)
    .select("priceArm", "firstSeenAt")
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as Data;
    return { visitorId: d.id, priceArm: num(data.priceArm), firstSeenAt: millis(data.firstSeenAt) };
  });
}

export interface LeadAttributionRow {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  campaignId: string | null;
  adsetId: string | null;
  adId: string | null;
  placement: string | null;
  landingPath: string | null;
  referrerHost: string | null;
}

export interface LeadRow extends LeadAttributionRow {
  id: string;
  email: string;
  discountCode: string | null;
  experimentId: string | null;
  visitorId: string | null;
  priceArm: number | null;
  lockedPrice: number | null;
  displayedArm: number | null;
  isExperimentPrice: boolean;
  /** Set from `/admin` for test / team signups: dropped from every
   *  experiment count, along with the visitor that produced it. */
  excludedFromExperiment: boolean;
  firstSource: string | null;
  lastSource: string | null;
  submitCount: number;
  createdAt: number | null;
  lastSubmittedAt: number | null;
}

/** Every lead across all experiments, newest first. `null` = not configured. */
export async function listLeads(): Promise<LeadRow[] | null> {
  const store = firestore();
  if (!store) return null;
  const snap = await store.collection(col("leads")).get();
  return snap.docs
    .map((d): LeadRow => {
      const l = d.data() as Data;
      const a = (l.attribution ?? {}) as Data;
      return {
        id: d.id,
        email: str(l.email) ?? "",
        discountCode: str(l.discountCode),
        experimentId: str(l.experimentId),
        visitorId: str(l.visitorId),
        priceArm: num(l.priceArm),
        lockedPrice: num(l.lockedPrice),
        displayedArm: num(l.displayedArm),
        isExperimentPrice: l.isExperimentPrice === true,
        excludedFromExperiment: l.excludedFromExperiment === true,
        firstSource: str(l.firstSource),
        lastSource: str(l.lastSource),
        submitCount: num(l.submitCount) ?? 1,
        createdAt: millis(l.createdAt),
        lastSubmittedAt: millis(l.lastSubmittedAt),
        utmSource: str(a.utm_source),
        utmMedium: str(a.utm_medium),
        utmCampaign: str(a.utm_campaign),
        utmContent: str(a.utm_content),
        campaignId: str(a.campaign_id),
        adsetId: str(a.adset_id),
        adId: str(a.ad_id),
        placement: str(a.placement),
        landingPath: str(a.landing_path),
        referrerHost: str(a.referrer_host),
      };
    })
    .sort((x, y) => (y.createdAt ?? 0) - (x.createdAt ?? 0));
}

/** Lead doc ids are the first 40 hex chars of sha256(email). */
export const LEAD_ID_RE = /^[0-9a-f]{40}$/;

/** `false` when Firestore isn't configured or the lead doesn't exist. */
export async function setLeadExcluded(leadId: string, excluded: boolean): Promise<boolean> {
  const store = firestore();
  if (!store || !LEAD_ID_RE.test(leadId)) return false;
  const ref = store.collection(col("leads")).doc(leadId);
  if (!(await ref.get()).exists) return false;
  await ref.update({
    excludedFromExperiment: excluded,
    excludedAt: excluded ? FieldValue.serverTimestamp() : FieldValue.delete(),
  });
  return true;
}

/* ── Contact messages ────────────────────────────────────────────────── */

export interface ContactRecordInput {
  name: string;
  email: string;
  message: string;
  visitorId: string | null;
}

export async function recordContact(input: ContactRecordInput): Promise<void> {
  const store = firestore();
  if (!store) {
    console.info("[store] contact (no Firebase)", { email: input.email });
    return;
  }
  try {
    await store.collection(col("contacts")).add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("[store] recordContact failed", error);
  }
}
