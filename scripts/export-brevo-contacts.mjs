#!/usr/bin/env node
/**
 * Export the website signup list from Brevo to CSV.
 *
 * Brevo is the ONLY store for issued discount codes (EDD D-004). Delete a
 * contact and its code is gone; lose the account and every code goes with it.
 * Until PRD OQ-9 is answered, running this on a schedule and keeping the
 * output somewhere you control IS the backup.
 *
 * Usage:
 *   BREVO_API_KEY=... BREVO_WEBSITE_LIST_ID=... node scripts/export-brevo-contacts.mjs [outfile]
 *
 * Reads .env.local automatically when present, so locally this is just:
 *   node scripts/export-brevo-contacts.mjs
 *
 * Defaults to ./brevo-export-<ISO date>.csv. Prints to stdout with `-`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

/** Minimal .env.local reader — avoids a dependency for a one-file script. */
function loadEnvLocal() {
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue; // a real env var always wins
    process.env[key] = rawValue.replace(/^["']|["']$/g, "").trim();
  }
}

loadEnvLocal();

const apiKey = process.env.BREVO_API_KEY;
const listId = process.env.BREVO_WEBSITE_LIST_ID;

if (!apiKey || !listId) {
  console.error(
    "Missing BREVO_API_KEY or BREVO_WEBSITE_LIST_ID.\n" +
      "Set them in .env.local or pass them inline. See docs/ADMIN.md §4.",
  );
  process.exit(1);
}

const PAGE_SIZE = 500;
const contacts = [];

for (let offset = 0; ; offset += PAGE_SIZE) {
  const url =
    `https://api.brevo.com/v3/contacts/lists/${listId}/contacts` +
    `?limit=${PAGE_SIZE}&offset=${offset}`;

  const response = await fetch(url, {
    headers: { "api-key": apiKey, accept: "application/json" },
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

  const page = await response.json();
  const batch = page.contacts ?? [];
  contacts.push(...batch);
  if (batch.length < PAGE_SIZE) break;
}

/** RFC 4180: quote every field, double any embedded quote. */
function csvField(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const COLUMNS = [
  "EMAIL",
  "DISCOUNT_CODE",
  "DISCOUNT_PCT",
  "SIGNUP_SOURCE",
  "SIGNUP_TS",
  "EMAIL_BLACKLISTED",
];

const rows = [
  COLUMNS.join(","),
  ...contacts.map((contact) =>
    [
      csvField(contact.email),
      csvField(contact.attributes?.DISCOUNT_CODE),
      csvField(contact.attributes?.DISCOUNT_PCT),
      csvField(contact.attributes?.SIGNUP_SOURCE),
      csvField(contact.attributes?.SIGNUP_TS),
      csvField(contact.emailBlacklisted ?? false),
    ].join(","),
  ),
];

const csv = `${rows.join("\n")}\n`;
const target = process.argv[2] ?? `brevo-export-${new Date().toISOString().slice(0, 10)}.csv`;

if (target === "-") {
  process.stdout.write(csv);
} else {
  writeFileSync(target, csv);
  console.error(`Wrote ${contacts.length} contacts to ${target}`);
}

const missing = contacts.filter((c) => !c.attributes?.DISCOUNT_CODE).length;
if (missing > 0) {
  console.error(
    `Warning: ${missing} contact(s) have no DISCOUNT_CODE. That usually means ` +
      "the custom attributes were created after those signups (ADMIN.md §7).",
  );
}
