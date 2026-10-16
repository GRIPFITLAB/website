#!/usr/bin/env node
/**
 * Export the price-experiment data from Firestore as CSV.
 *
 * Writes two files (default `./exports/`):
 *   visitors-<date>.csv  one row per assigned visitor (exposures)
 *   leads-<date>.csv     one row per captured email (conversions)
 *
 * and prints a conversion table by assigned price to stdout — the demand
 * curve, straight from the source of truth (DECISIONS.md §17).
 *
 * Usage:
 *   node scripts/export-leads.mjs                 # all experiments
 *   node scripts/export-leads.mjs --experiment ks-price-2026-10
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
const experiment = arg("experiment", null);
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
  assignedPrice: v.assignedPrice ?? "",
  superEarlyBirdPrice: v.superEarlyBirdPrice ?? "",
  country: v.country ?? "",
  firstSeenAt: ts(v.firstSeenAt),
  ...flatAttr(v.attribution),
}));

const leadRows = leads.map((l) => ({
  email: l.email ?? "",
  discountCode: l.discountCode ?? "",
  visitorId: l.visitorId ?? "",
  experimentId: l.experimentId ?? "",
  assignedPrice: l.assignedPrice ?? "",
  isExperimentPrice: l.isExperimentPrice ?? "",
  kickstarterPrice: l.kickstarterPrice ?? "",
  superEarlyBirdPrice: l.superEarlyBirdPrice ?? "",
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

/* ── Demand curve ────────────────────────────────────────────────────── */
const byPrice = new Map();
for (const v of visitorRows) {
  if (v.assignedPrice === "") continue;
  const row = byPrice.get(v.assignedPrice) ?? { price: v.assignedPrice, visitors: 0, leads: 0 };
  row.visitors += 1;
  byPrice.set(v.assignedPrice, row);
}
for (const l of leadRows) {
  if (l.assignedPrice === "") continue;
  const row = byPrice.get(l.assignedPrice) ?? { price: l.assignedPrice, visitors: 0, leads: 0 };
  row.leads += 1;
  byPrice.set(l.assignedPrice, row);
}
const table = [...byPrice.values()]
  .sort((a, b) => a.price - b.price)
  .map((r) => ({
    price: `$${r.price}`,
    visitors: r.visitors,
    leads: r.leads,
    conversion: r.visitors ? `${((100 * r.leads) / r.visitors).toFixed(2)}%` : "—",
    revenueIndex: r.visitors ? ((r.leads / r.visitors) * r.price).toFixed(2) : "—",
  }));

console.log(`\n${visitors.length} visitors, ${leads.length} leads${experiment ? ` (experiment ${experiment})` : ""}`);
console.log(`→ ${vFile}\n→ ${lFile}\n`);
if (table.length) console.table(table);
