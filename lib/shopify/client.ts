/**
 * Typed `fetch` wrapper for the Shopify Storefront GraphQL API.
 *
 * Decisions.md §2: we use native `fetch` instead of Apollo / urql / etc.
 * Most reads should pass `next: { revalidate, tags }` so they participate
 * in Next.js Data Cache; cart mutations should pass `cache: 'no-store'`.
 */

import { env, requireEnv } from "@/lib/env";
import type { ShopifyGraphQLError, UserError } from "@/lib/shopify/types";

// =============================================================
//  Public types
// =============================================================

export interface ShopifyFetchInit {
  query: string;
  variables?: Record<string, unknown>;
  /**
   * Forwarded to fetch's Next.js extension. Use for product reads:
   *   next: { revalidate: 60, tags: [`product:${handle}`] }
   */
  next?: { revalidate?: number | false; tags?: string[] };
  /**
   * Standard fetch cache hint. For cart mutations, prefer
   * `cache: 'no-store'`. Mutually exclusive with `next`.
   */
  cache?: RequestCache;
}

export interface ShopifyFetchResult<T> {
  data: T;
}

// =============================================================
//  Errors
// =============================================================

/** Network / HTTP error before we got a GraphQL body. */
export class ShopifyHttpError extends Error {
  override readonly name = "ShopifyHttpError";

  constructor(
    message: string,
    readonly status: number,
    readonly body?: string,
  ) {
    super(message);
  }
}

/** GraphQL errors returned in the response `errors` array. */
export class ShopifyGraphQLErrorBag extends Error {
  override readonly name = "ShopifyGraphQLError";

  constructor(readonly errors: ShopifyGraphQLError[]) {
    super(
      errors
        .map((e) => e.message)
        .filter(Boolean)
        .join("; ") || "Storefront API returned errors",
    );
  }
}

/** `userErrors` field returned by Shopify mutations (validation errors). */
export class ShopifyUserError extends Error {
  override readonly name = "ShopifyUserError";

  constructor(readonly userErrors: UserError[]) {
    super(
      userErrors
        .map((e) => e.message)
        .filter(Boolean)
        .join("; ") || "Storefront API returned user errors",
    );
  }
}

// =============================================================
//  Implementation
// =============================================================

function buildEndpoint(): string {
  const domain = requireEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
  const version = env.SHOPIFY_STOREFRONT_API_VERSION;
  // Domain may be "gripfit.myshopify.com" or a custom domain
  // ("shop.gripfit.com"). Both formats accept /api/<version>/graphql.json.
  return `https://${domain}/api/${version}/graphql.json`;
}

/**
 * Single chokepoint for every Storefront API request.
 *
 * Logs and rethrows on failure so a server boundary (Server Component,
 * Server Action) can render a clean error UI without leaking GraphQL
 * internals to the browser.
 */
export async function shopifyFetch<T>(
  init: ShopifyFetchInit,
): Promise<ShopifyFetchResult<T>> {
  const endpoint = buildEndpoint();
  const token = requireEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN");

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number | false; tags?: string[] };
  } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({
      query: init.query,
      variables: init.variables ?? {},
    }),
  };

  if (init.cache) fetchOptions.cache = init.cache;
  if (init.next) fetchOptions.next = init.next;

  let response: Response;
  try {
    response = await fetch(endpoint, fetchOptions);
  } catch (err) {
    throw new ShopifyHttpError(
      `Storefront API fetch failed: ${
        err instanceof Error ? err.message : "unknown network error"
      }`,
      0,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => undefined);
    throw new ShopifyHttpError(
      `Storefront API HTTP ${response.status} ${response.statusText}`,
      response.status,
      body,
    );
  }

  let json: { data?: T; errors?: ShopifyGraphQLError[] };
  try {
    json = (await response.json()) as typeof json;
  } catch {
    throw new ShopifyHttpError(
      "Storefront API returned a non-JSON response",
      response.status,
    );
  }

  if (json.errors && json.errors.length > 0) {
    throw new ShopifyGraphQLErrorBag(json.errors);
  }

  if (!json.data) {
    throw new ShopifyGraphQLErrorBag([
      { message: "Storefront API returned no data" },
    ]);
  }

  return { data: json.data };
}

// =============================================================
//  Cache key helpers (so call sites and webhook handlers agree)
// =============================================================

export const ShopifyCacheTags = {
  product: (handle: string) => `shopify:product:${handle}`,
  cart: (cartId: string) => `shopify:cart:${cartId}`,
  /** Used to bust every product page at once. */
  allProducts: () => `shopify:products`,
} as const;
