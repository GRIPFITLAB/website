/**
 * Email-discount custom-event channel.
 *
 * The `<EmailDiscountModal />` is mounted once at the layout level so it's
 * available on every page. Any teaser button anywhere in the tree can
 * call `openEmailDiscountModal()` to programmatically open it without
 * prop drilling or a Context provider.
 *
 * The localStorage / sessionStorage key is also exported here so the
 * modal (which suppresses auto-open after dismissal) and the footer's
 * inline form (which suppresses auto-open after a successful submit)
 * both write to the same place.
 */

/** Dispatched on `document` when a button anywhere wants to open the modal. */
export const EMAIL_DISCOUNT_OPEN_EVENT = "gripfit:open-email-discount";

/**
 * localStorage / sessionStorage key the modal checks on mount before
 * deciding whether to auto-open. Bumped to `-v1` so we can rotate the
 * suppression window when the offer changes.
 */
export const EMAIL_DISCOUNT_DISMISSED_KEY =
  "gripfit:email-discount:dismissed-v1";

/**
 * Fire-and-forget helper. Safe to call from any client component —
 * no-ops on the server. */
export function openEmailDiscountModal(): void {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new CustomEvent(EMAIL_DISCOUNT_OPEN_EVENT));
}
