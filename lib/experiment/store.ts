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
