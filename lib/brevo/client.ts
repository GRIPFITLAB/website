import "server-only";

import { requireEnv } from "@/lib/env";

import type { BrevoErrorBody } from "@/lib/brevo/types";

/**
 * Typed `fetch` wrapper for the Brevo v3 REST API.
 *
 * Mirrors the shape of `lib/shopify/client.ts` — no SDK, no extra
 * dependency, explicit error types the Server Actions can branch on.
 *
 * Every call is `cache: "no-store"`: these are mutations or per-visitor
 * reads, never cacheable page data.
 */

const BREVO_API_BASE = "https://api.brevo.com/v3";

/** Give up rather than hold a Server Action open indefinitely. */
const REQUEST_TIMEOUT_MS = 10_000;

/** A non-2xx response from Brevo, with the parsed error envelope. */
export class BrevoHttpError extends Error {
  readonly status: number;
  readonly body: BrevoErrorBody;

  constructor(status: number, body: BrevoErrorBody, path: string) {
    super(
      `Brevo ${path} failed with ${status}: ${body.message ?? "no message"}`,
    );
    this.name = "BrevoHttpError";
    this.status = status;
    this.body = body;
  }
}

/** The request never completed (timeout, DNS, TLS, offline). */
export class BrevoNetworkError extends Error {
  constructor(path: string, cause: unknown) {
    super(`Brevo ${path} did not complete`);
    this.name = "BrevoNetworkError";
    this.cause = cause;
  }
}

interface BrevoFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Status codes to treat as a `null` result instead of throwing. */
  nullOn?: number[];
}

/**
 * Perform one Brevo API call.
 *
 * Returns `null` when the response status is listed in `nullOn` (used for
 * 404 on contact lookup), and `undefined` when Brevo replies 204.
 */
export async function brevoFetch<T>(
  path: string,
  { method = "GET", body, nullOn = [] }: BrevoFetchOptions = {},
): Promise<T | null> {
  const apiKey = requireEnv("BREVO_API_KEY");

  let response: Response;
  try {
    response = await fetch(`${BREVO_API_BASE}${path}`, {
      method,
      headers: {
        "api-key": apiKey,
        accept: "application/json",
        ...(body === undefined
          ? {}
          : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new BrevoNetworkError(path, cause);
  }

  if (nullOn.includes(response.status)) return null;

  if (!response.ok) {
    // Brevo returns JSON errors, but a gateway failure can return HTML —
    // fall back to the raw text so the log line is still useful.
    let errorBody: BrevoErrorBody;
    try {
      errorBody = (await response.json()) as BrevoErrorBody;
    } catch {
      errorBody = { message: await response.text().catch(() => "") };
    }
    throw new BrevoHttpError(response.status, errorBody, path);
  }

  // 204 No Content — e.g. a successful contact update.
  if (response.status === 204) return null;

  return (await response.json()) as T;
}
