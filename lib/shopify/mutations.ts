/**
 * Shopify Storefront GraphQL mutations — cart-only.
 *
 * The Storefront API exposes a small mutation surface for headless cart
 * management. We use the four below; everything else (checkout, payment,
 * customer accounts) is owned by Shopify-hosted checkout.
 */

import { SHARED_FRAGMENTS } from "@/lib/shopify/queries";

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate {
    cartCreate {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
${SHARED_FRAGMENTS}`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
${SHARED_FRAGMENTS}`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
${SHARED_FRAGMENTS}`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
${SHARED_FRAGMENTS}`;
