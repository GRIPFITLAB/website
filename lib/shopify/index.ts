/**
 * Public Storefront API surface used by the rest of the app.
 *
 * App code should import from `@/lib/shopify`, not from the underlying
 * `client.ts`, `queries.ts`, or `mutations.ts`. Keeps the GraphQL surface
 * area replaceable (e.g. if we ever swap the client).
 */

import {
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_CREATE_MUTATION,
} from "@/lib/shopify/mutations";
import {
  CART_BY_ID_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "@/lib/shopify/queries";
import {
  ShopifyCacheTags,
  ShopifyUserError,
  shopifyFetch,
} from "@/lib/shopify/client";
import type {
  Cart,
  CartByIdResult,
  CartCreateResult,
  CartLineInput,
  CartLineUpdateInput,
  CartLinesAddResult,
  CartLinesRemoveResult,
  CartLinesUpdateResult,
  Product,
  ProductByHandleResult,
} from "@/lib/shopify/types";

export {
  ShopifyHttpError,
  ShopifyGraphQLErrorBag,
  ShopifyUserError,
} from "@/lib/shopify/client";

export type * from "@/lib/shopify/types";

// =============================================================
//  Reads (cached, taggable)
// =============================================================

/**
 * Fetch a product by its Shopify handle. Returns null if no product with
 * that handle exists or if the product is unpublished on the Storefront
 * API channel.
 *
 * Cached for 60 seconds. Tagged with `shopify:product:{handle}` so a
 * Shopify webhook → Server Action can call
 * `revalidateTag(ShopifyCacheTags.product(handle), 'max')` to bust on
 * inventory or price changes.
 */
export async function getProductByHandle(
  handle: string,
): Promise<Product | null> {
  const { data } = await shopifyFetch<ProductByHandleResult>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    next: {
      revalidate: 60,
      tags: [ShopifyCacheTags.product(handle)],
    },
  });
  return data.product;
}

/**
 * Fetch an existing cart by its Storefront ID. Returns null if Shopify
 * has expired or invalidated the cart (10-day rolling TTL on Shopify's
 * side). Caller should treat null as "create a fresh cart".
 *
 * Not cached — cart contents must always be live for the drawer.
 */
export async function getCart(cartId: string): Promise<Cart | null> {
  const { data } = await shopifyFetch<CartByIdResult>({
    query: CART_BY_ID_QUERY,
    variables: { cartId },
    cache: "no-store",
  });
  return data.cart;
}

// =============================================================
//  Cart mutations (always uncached)
// =============================================================

function unwrapCart(
  cart: Cart | null,
  userErrors: { field: string[] | null; message: string; code: string | null }[],
  op: string,
): Cart {
  if (userErrors.length > 0) throw new ShopifyUserError(userErrors);
  if (!cart) {
    throw new Error(`Storefront API returned no cart from ${op}`);
  }
  return cart;
}

/** Create an empty Shopify cart and return its ID + checkoutUrl. */
export async function createCart(): Promise<Cart> {
  const { data } = await shopifyFetch<CartCreateResult>({
    query: CART_CREATE_MUTATION,
    cache: "no-store",
  });
  return unwrapCart(data.cartCreate.cart, data.cartCreate.userErrors, "cartCreate");
}

/** Add line items to an existing cart. */
export async function addToCart(
  cartId: string,
  lines: CartLineInput[],
): Promise<Cart> {
  const { data } = await shopifyFetch<CartLinesAddResult>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
  });
  return unwrapCart(
    data.cartLinesAdd.cart,
    data.cartLinesAdd.userErrors,
    "cartLinesAdd",
  );
}

/** Update quantities (or other line fields) on existing cart lines. */
export async function updateCartLines(
  cartId: string,
  lines: CartLineUpdateInput[],
): Promise<Cart> {
  const { data } = await shopifyFetch<CartLinesUpdateResult>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
  });
  return unwrapCart(
    data.cartLinesUpdate.cart,
    data.cartLinesUpdate.userErrors,
    "cartLinesUpdate",
  );
}

/** Remove cart lines by ID. Pass an array of CartLine.id values. */
export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<Cart> {
  const { data } = await shopifyFetch<CartLinesRemoveResult>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
    cache: "no-store",
  });
  return unwrapCart(
    data.cartLinesRemove.cart,
    data.cartLinesRemove.userErrors,
    "cartLinesRemove",
  );
}

// =============================================================
//  Re-exports for convenience
// =============================================================

export { ShopifyCacheTags } from "@/lib/shopify/client";
