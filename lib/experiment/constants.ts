/**
 * Names shared by the proxy (which sets cookies / request headers) and the
 * server readers (which consume them). Pure constants — safe anywhere.
 */

/** Signed price assignment: `visitorId.experimentId.price.signature`. */
export const ASSIGNMENT_COOKIE = "gf_exp";
/** First-touch ad attribution, base64url JSON. */
export const ATTRIBUTION_COOKIE = "gf_attr";

/**
 * The proxy forwards the assignment it just created on the *same* request
 * via these request headers, because the Set-Cookie it writes isn't visible
 * to the render that follows. Server code reads headers first, cookies
 * second.
 */
export const ASSIGNMENT_HEADER = "x-gf-exp";
export const ATTRIBUTION_HEADER = "x-gf-attr";
/** `"1"` when the proxy minted the assignment on this request. */
export const NEW_VISITOR_HEADER = "x-gf-new";

/** Meta's own browser cookies — forwarded to the Conversions API for matching. */
export const META_FBP_COOKIE = "_fbp";
export const META_FBC_COOKIE = "_fbc";
