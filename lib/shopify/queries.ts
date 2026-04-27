/**
 * Shopify Storefront GraphQL queries.
 *
 * Field set must match `lib/shopify/types.ts`. Two shared fragments
 * (PRODUCT_FRAGMENT, CART_FRAGMENT) are reused across queries and
 * mutations — keep them in sync.
 */

// =============================================================
//  Fragments
// =============================================================

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = /* GraphQL */ `
  fragment ProductVariantFragment on ProductVariant {
    id
    title
    availableForSale
    currentlyNotInStock
    quantityAvailable
    sku
    price {
      ...MoneyFragment
    }
    image {
      ...ImageFragment
    }
  }
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    vendor
    productType
    tags
    seo {
      title
      description
    }
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
    images(first: 10) {
      nodes {
        ...ImageFragment
      }
    }
    variants(first: 10) {
      nodes {
        ...ProductVariantFragment
      }
    }
  }
`;

export const CART_LINE_FRAGMENT = /* GraphQL */ `
  fragment CartLineFragment on CartLine {
    id
    quantity
    cost {
      totalAmount {
        ...MoneyFragment
      }
      subtotalAmount {
        ...MoneyFragment
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        availableForSale
        price {
          ...MoneyFragment
        }
        image {
          ...ImageFragment
        }
        product {
          id
          handle
          title
        }
      }
    }
  }
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    createdAt
    updatedAt
    lines(first: 100) {
      nodes {
        ...CartLineFragment
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
    }
  }
`;

/**
 * Bundle of all fragments shared between queries and mutations.
 * Concatenate this once at the bottom of every operation string so the
 * Storefront API can resolve all fragment refs in a single round trip.
 */
const SHARED_FRAGMENTS =
  MONEY_FRAGMENT +
  IMAGE_FRAGMENT +
  PRODUCT_VARIANT_FRAGMENT +
  PRODUCT_FRAGMENT +
  CART_LINE_FRAGMENT +
  CART_FRAGMENT;

// =============================================================
//  Operations
// =============================================================

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
${SHARED_FRAGMENTS}`;

export const CART_BY_ID_QUERY = /* GraphQL */ `
  query CartById($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
${SHARED_FRAGMENTS}`;

// Re-exported so mutations.ts can use them without re-declaring fragments.
export { SHARED_FRAGMENTS };
