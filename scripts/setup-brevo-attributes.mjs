#!/usr/bin/env node
/**
 * Create (or verify) the custom contact attributes GripFit writes on signup.
 *
 * **Why this script exists.** Brevo does NOT reject a write to an attribute it
 * does not know — it accepts the request, returns success, and silently drops
 * the unknown fields. So a signup looks perfect from every angle we can see:
 * the API returns 2xx, the contact appears on the list, the code email sends.
 * The code itself is simply never stored.
 *
 * That failure is invisible and expensive. `DISCOUNT_CODE` is what makes
 * re-submitting idempotent (R-012) and is the only record of what was issued
 * (R-015) — Brevo is the sole store, there is no database. Without it every
 * re-submission mints a fresh code and nothing can be reconciled afterwards.
 *
 * Idempotent: attributes that already exist are reported and left alone, so
 * this is safe to re-run and safe to wire into a setup or deploy check.
 *
 * Usage:
 *   node scripts/setup-brevo-attributes.mjs          # create anything missing
 *   node scripts/setup-brevo-attributes.mjs --check  # verify only, never write
 *
 * Reads .env.local when present. Exits non-zero if anything is missing in
 * --check mode, so it can gate a release.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error("Missing BREVO_API_KEY. See docs/ADMIN.md §4.");
  process.exit(1);
}

const checkOnly = process.argv.includes("--check");

/** Must match `GripFitContactAttributes` in lib/brevo/types.ts. */
const REQUIRED = [
  { name: "DISCOUNT_CODE", type: "text" },
  { name: "DISCOUNT_PCT", type: "float" },
  { name: "SIGNUP_SOURCE", type: "text" },
  { name: "SIGNUP_TS", type: "text" },
];

const headers = { "api-key": apiKey, accept: "application/json" };

const response = await fetch("https://api.brevo.com/v3/contacts/attributes", {
  headers,
});

if (!response.ok) {
  const body = await response.text().catch(() => "");
  console.error(`Brevo returned ${response.status}: ${body}`);
  if (response.status === 401) {
    console.error(
      "A 401 means the key was rejected. Check it is an API key " +
        "(starts `xkeysib-`) and not an SMTP key.",
    );
  }
  process.exit(1);
}

const existing = new Set(
  ((await response.json()).attributes ?? []).map((a) => a.name),
);

const missing = REQUIRED.filter((attr) => !existing.has(attr.name));

for (const attr of REQUIRED) {
  if (existing.has(attr.name)) console.log(`  ok       ${attr.name}`);
}

if (missing.length === 0) {
  console.log("\nAll required attributes exist.");
  process.exit(0);
}

if (checkOnly) {
  console.error(
    `\nMissing ${missing.length} attribute(s): ` +
      `${missing.map((a) => a.name).join(", ")}\n` +
      "Signups will succeed but their discount codes will NOT be stored.\n" +
      "Run this script without --check to create them.",
  );
  process.exit(1);
}

for (const attr of missing) {
  const create = await fetch(
    `https://api.brevo.com/v3/contacts/attributes/normal/${attr.name}`,
    {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ type: attr.type }),
    },
  );

  if (!create.ok && create.status !== 204) {
    const body = await create.text().catch(() => "");
    console.error(`  FAILED   ${attr.name} — ${create.status}: ${body}`);
    process.exit(1);
  }
  console.log(`  created  ${attr.name} (${attr.type})`);
}

console.log(
  "\nDone. Note this does NOT backfill contacts captured before now — their " +
    "codes were dropped on write and cannot be recovered. Re-test with a " +
    "fresh address to confirm storage works.",
);
