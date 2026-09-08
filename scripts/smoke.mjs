#!/usr/bin/env node
/**
 * Post-build smoke test: serve the production build and request every page.
 *
 * `next build` proves a page compiles and prerenders. It does not prove the
 * page can be *served*: a module can compile, prerender, and still throw when
 * a request evaluates it. This script closes that gap for GET requests.
 *
 * **Known limit — read before trusting a green run.** This only issues GETs.
 * It does NOT invoke Server Actions, so it cannot catch a fault that only
 * appears on submit. The `"use server"` export bug that shipped to production
 * was exactly that: it was verified here against the original broken code and
 * every route still returned 200, because the fault surfaced on the Action
 * POST. `tests/server-actions.test.ts` is the guard for that defect, and it
 * was verified to fail when the bad export is reintroduced. Covering Action
 * invocation properly needs a browser-driven test we have not written.
 *
 * Routes are discovered from the `app/` tree rather than `lib/routes.ts`, so
 * a page deliberately kept out of the nav (e.g. /unsubscribe) is still
 * covered, and a new page is covered the moment it exists.
 *
 * Usage: npm run smoke   (expects `npm run build` to have run first)
 */
import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const PORT = process.env.SMOKE_PORT ?? "3123";
const BASE = `http://127.0.0.1:${PORT}`;
const READY_TIMEOUT_MS = 60_000;

/** Every page in the app tree, as a route path. Route groups collapse. */
function discoverRoutes(dir = path.join(root, "app"), prefix = "") {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === "page.tsx") found.push(prefix || "/");
    if (!entry.isDirectory()) continue;
    // Skip private folders and dynamic segments (no known param to request).
    if (entry.name.startsWith("_") || entry.name.startsWith("[")) continue;
    const segment = /^\(.+\)$/.test(entry.name) ? "" : `/${entry.name}`;
    found.push(
      ...discoverRoutes(path.join(dir, entry.name), `${prefix}${segment}`),
    );
  }
  return found;
}

const routes = [...new Set(discoverRoutes())].sort();
// Metadata routes are generated, not pages, but must not throw either.
const targets = [...routes, "/sitemap.xml", "/robots.txt"];

const server = spawn("npm", ["start", "--", "--port", PORT], {
  cwd: root,
  env: {
    ...process.env,
    // A real origin so sitemap/robots render their absolute-URL branch.
    SITE_URL: process.env.SITE_URL ?? "https://smoke.test",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverLog = "";
server.stdout.on("data", (chunk) => (serverLog += chunk));
server.stderr.on("data", (chunk) => (serverLog += chunk));

function shutdown() {
  if (!server.killed) server.kill("SIGTERM");
}
process.on("exit", shutdown);
process.on("SIGINT", () => process.exit(130));

async function waitForReady() {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`server exited early (${server.exitCode})\n${serverLog}`);
    }
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw new Error(`server not ready in ${READY_TIMEOUT_MS}ms\n${serverLog}`);
}

const failures = [];

try {
  await waitForReady();

  for (const route of targets) {
    let status = 0;
    let body = "";
    try {
      const response = await fetch(`${BASE}${route}`, {
        signal: AbortSignal.timeout(15_000),
      });
      status = response.status;
      body = await response.text();
    } catch (error) {
      failures.push(`${route} — request failed: ${error.message}`);
      continue;
    }

    if (status !== 200) {
      failures.push(`${route} — expected 200, got ${status}`);
      continue;
    }

    // A 200 alone is not enough: Next can serve its error shell with a 200
    // once the response has begun streaming, so assert on the body too.
    if (
      body.includes("A server error occurred") ||
      body.includes("page could") // "This page couldn't load", any escaping
    ) {
      failures.push(`${route} — 200 but rendered the error shell`);
      continue;
    }

    console.log(`  ok  ${status}  ${route}`);
  }
} catch (error) {
  failures.push(error.message);
} finally {
  shutdown();
}

if (failures.length > 0) {
  console.error(`\nsmoke: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  if (serverLog.trim()) console.error(`\n--- server output ---\n${serverLog}`);
  process.exit(1);
}

console.log(`\nsmoke: ${targets.length} routes OK`);
