#!/usr/bin/env node
/**
 * Export the price-experiment data from Firestore as CSV.
 *
 * Writes two files (default `./exports/`):
 *   visitors-<date>.csv  one row per assigned visitor (impressions)
 *   leads-<date>.csv     one row per captured email (signups)
 *
 * and prints impressions, signups, and conversion by price arm to stdout —
 * straight from the source of truth (DECISIONS.md §17).
 *
 * Usage:
 *   node scripts/export-leads.mjs                          # current experiment
 *   node scripts/export-leads.mjs --experiment ks-arms-2026-10
 *   node scripts/export-leads.mjs --experiment all         # every experiment
 *   node scripts/export-leads.mjs --out ./tmp
 *
 * Needs FIREBASE_SERVICE_ACCOUNT_JSON (raw or base64) and optionally
 * FIRESTORE_COLLECTION_PREFIX (default "web_"). Reads .env.local.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/** Keep in step with `priceExperiment.id` in lib/admin.ts. */
const CURRENT_EXPERIMENT = "ks-arms-2026-10";

const root = fileURLToPath(new URL("..", import.meta.url));

function loadEnvLocal() {
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "").trim();
  }
}
loadEnvLocal();

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!raw) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_JSON. See docs/ADMIN.md.");
  process.exit(1);
}
const json = raw.trim().startsWith("{") ? raw.trim() : Buffer.from(raw.trim(), "base64").toString("utf8");
const sa = JSON.parse(json);
if (typeof sa.private_key === "string") sa.private_key = sa.private_key.replace(/\\n/g, "\n");

const prefix = process.env.FIRESTORE_COLLECTION_PREFIX ?? "web_";
const experimentArg = arg("experiment", CURRENT_EXPERIMENT);
const experiment = experimentArg === "all" ? null : experimentArg;
const outDir = path.resolve(arg("out", path.join(root, "exports")));
mkdirSync(outDir, { recursive: true });

initializeApp({ credential: cert(sa) });
const db = getFirestore();

function ts(v) {
  return v && typeof v.toDate === "function" ? v.toDate().toISOString() : (v ?? "");
}

function csv(rows, columns) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}

async function fetchAll(name) {
  let q = db.collection(`${prefix}${name}`);
  if (experiment) q = q.where("experimentId", "==", experiment);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

const [visitors, leads] = await Promise.all([fetchAll("visitors"), fetchAll("leads")]);

const flatAttr = (a = {}) => ({
  utm_source: a.utm_source ?? "",
  utm_medium: a.utm_medium ?? "",
  utm_campaign: a.utm_campaign ?? "",
  utm_content: a.utm_content ?? "",
  campaign_id: a.campaign_id ?? "",
  adset_id: a.adset_id ?? "",
  ad_id: a.ad_id ?? "",
  placement: a.placement ?? "",
  landing_path: a.landing_path ?? "",
  referrer_host: a.referrer_host ?? "",
});

const visitorRows = visitors.map((v) => ({
  visitorId: v.visitorId ?? v.id,
  experimentId: v.experimentId ?? "",
  priceArm: v.priceArm ?? "",
  emailLockPrice: v.emailLockPrice ?? "",
  kickstarterCeiling: v.kickstarterCeiling ?? "",
  expectedRetail: v.expectedRetail ?? "",
  country: v.country ?? "",
  firstSeenAt: ts(v.firstSeenAt),
  ...flatAttr(v.attribution),
}));

const leadRows = leads.map((l) => ({
  email: l.email ?? "",
  discountCode: l.discountCode ?? "",
  visitorId: l.visitorId ?? "",
  experimentId: l.experimentId ?? "",
  priceArm: l.priceArm ?? "",
  lockedPrice: l.lockedPrice ?? "",
  displayedArm: l.displayedArm ?? "",
  isExperimentPrice: l.isExperimentPrice ?? "",
  firstSource: l.firstSource ?? "",
  submitCount: l.submitCount ?? "",
  createdAt: ts(l.createdAt),
  lastSubmittedAt: ts(l.lastSubmittedAt),
  ...flatAttr(l.attribution),
}));

const stamp = new Date().toISOString().slice(0, 10);
const vFile = path.join(outDir, `visitors-${stamp}.csv`);
const lFile = path.join(outDir, `leads-${stamp}.csv`);
writeFileSync(vFile, csv(visitorRows, Object.keys(visitorRows[0] ?? { visitorId: "" })));
writeFileSync(lFile, csv(leadRows, Object.keys(leadRows[0] ?? { email: "" })));

/* ── Conversion by arm ───────────────────────────────────────────────── */
const byArm = new Map();
function row(v) {
  const existing = byArm.get(v.priceArm);
  if (existing) return existing;
  const fresh = {
    arm: v.priceArm,
    lock: v.emailLockPrice ?? v.lockedPrice ?? "",
    ceiling: v.kickstarterCeiling ?? "",
    retail: v.expectedRetail ?? "",
    impressions: 0,
    signups: 0,
  };
  byArm.set(v.priceArm, fresh);
  return fresh;
}
for (const v of visitorRows) {
  if (v.priceArm === "") continue;
  row(v).impressions += 1;
}
// Only count signups that came from a visitor actually assigned in this
// experiment — a lead with no assignment saw the default arm, not a test arm.
for (const l of leadRows) {
  if (l.priceArm === "" || l.isExperimentPrice !== true) continue;
  row(l).signups += 1;
}
const table = [...byArm.values()]
  .sort((a, b) => a.arm - b.arm)
  .map((r) => ({
    arm: r.arm,
    lock: r.lock === "" ? "" : `$${r.lock}`,
    ceiling: r.ceiling === "" ? "" : `$${r.ceiling}`,
    retail: r.retail === "" ? "" : `$${r.retail}`,
    impressions: r.impressions,
    signups: r.signups,
    conversion: r.impressions ? `${((100 * r.signups) / r.impressions).toFixed(2)}%` : "—",
  }));

console.log(
  `\n${visitors.length} visitors, ${leads.length} leads (experiment ${experiment ?? "all"})`,
);
console.log(`→ ${vFile}\n→ ${lFile}\n`);
if (table.length) console.table(table);
