import { emailDiscount } from "@/lib/admin";

/**
 * Per-visitor discount codes.
 *
 * Each captured email gets exactly one code, generated server-side and
 * stored on the Brevo contact (EDD D-005). One code per address means a
 * leaked code is traceable to the address it was issued to, which is the
 * point — a single shared code would spread without capturing anyone.
 *
 * The code is an opaque random token, not a hash of the email: deriving
 * it from the address would let anyone who knows the algorithm mint
 * codes for arbitrary emails.
 *
 * Redemption is out of scope for v1 (Decisions.md §16 Q2/Q10) — codes
 * are issued, stored, and exported for reconciliation against the
 * campaign's backer list once the campaign platform is chosen.
 */

/**
 * Crockford base32 — digits and uppercase letters with `I`, `L`, `O`,
 * and `U` removed, so a code read off a screen can't be mistyped as a
 * lookalike character.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Characters after the prefix. 8 × 5 bits = 40 bits of entropy. */
const CODE_LENGTH = 8;

/**
 * Generate a fresh discount code, e.g. `GF-7Q4KX2M9`.
 *
 * Uses `crypto.getRandomValues` (available in the Node and Edge runtimes
 * Next.js targets) so codes are not guessable from one another.
 *
 * 32 divides 256 evenly, so `byte % 32` is already uniform today. The
 * rejection guard costs nothing and keeps it uniform if `ALPHABET` ever
 * changes length.
 */
export function generateDiscountCode(): string {
  const max = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
  let out = "";

  while (out.length < CODE_LENGTH) {
    const bytes = new Uint8Array(CODE_LENGTH);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (out.length >= CODE_LENGTH) break;
      if (byte >= max) continue; // biased tail — draw again
      out += ALPHABET[byte % ALPHABET.length];
    }
  }

  return `${emailDiscount.codePrefix}-${out}`;
}

/** Shape a valid code must have. Used by tests and by input validation. */
export const DISCOUNT_CODE_PATTERN = new RegExp(
  `^${emailDiscount.codePrefix}-[${ALPHABET}]{${CODE_LENGTH}}$`,
);

export function isValidDiscountCode(value: string): boolean {
  return DISCOUNT_CODE_PATTERN.test(value);
}
