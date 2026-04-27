/**
 * Shopify Storefront API types — handwritten subset.
 *
 * We deliberately do not generate types from the schema. The set of fields
 * we read is small (single product, cart drawer) and the indirection of a
 * codegen pipeline isn't worth the maintenance cost in v1.
 *
 * Mirror the field set in `queries.ts` / `mutations.ts`. If you add a
 * field there, add it here too.
 */

// =============================================================
//  Primitives
// =============================================================

export type CurrencyCode =
  | "USD"
  | "CAD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "JPY"
  | string;

export interface Money {
  amount: string;
  currencyCode: CurrencyCode;
}

export interface Image {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface SEO {
  title: string | null;
  description: string | null;
}

export interface UserError {
  field: string[] | null;
  message: string;
  code: string | null;
}

/** Shopify Connection<T> shape, but we only request `nodes`. */
export interface Connection<T> {
  nodes: T[];
}

// =============================================================
//  Product
// =============================================================

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  /** True when the merchant has enabled "continue selling when out of stock" — pre-order. */
  currentlyNotInStock: boolean;
  quantityAvailable: number | null;
  sku: string | null;
  price: Money;
  image: Image | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  images: Connection<Image>;
  variants: Connection<ProductVariant>;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  seo: SEO;
  vendor: string;
  productType: string;
  tags: string[];
}

// =============================================================
//  Cart
// =============================================================

/** Variant payload as it appears nested inside a CartLine.merchandise. */
export interface CartLineMerchandise {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  image: Image | null;
  product: {
    id: string;
    handle: string;
    title: string;
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
  };
}

export interface CartCost {
  subtotalAmount: Money;
  totalAmount: Money;
  totalTaxAmount: Money | null;
  totalDutyAmount: Money | null;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: Connection<CartLine>;
  cost: CartCost;
  createdAt: string;
  updatedAt: string;
}

// =============================================================
//  Cart input shapes (mutation arguments)
// =============================================================

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

// =============================================================
//  GraphQL response envelopes
// =============================================================

export interface ShopifyGraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

export interface ShopifyResponse<T> {
  data?: T;
  errors?: ShopifyGraphQLError[];
}

// =============================================================
//  Query / mutation operation result shapes
//  (one type per top-level field returned by Storefront API)
// =============================================================

export interface ProductByHandleResult {
  product: Product | null;
}

export interface CartByIdResult {
  cart: Cart | null;
}

export interface CartCreateResult {
  cartCreate: {
    cart: Cart | null;
    userErrors: UserError[];
  };
}

export interface CartLinesAddResult {
  cartLinesAdd: {
    cart: Cart | null;
    userErrors: UserError[];
  };
}

export interface CartLinesUpdateResult {
  cartLinesUpdate: {
    cart: Cart | null;
    userErrors: UserError[];
  };
}

export interface CartLinesRemoveResult {
  cartLinesRemove: {
    cart: Cart | null;
    userErrors: UserError[];
  };
}
