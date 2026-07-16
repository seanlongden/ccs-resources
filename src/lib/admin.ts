/**
 * Admin Configuration
 *
 * Emails in this list get:
 *   1. Login bypass — always allowed in, even without a Stripe sub or
 *      being on the lifetime allowlist sheet (see src/lib/auth.ts)
 *   2. Admin-only content access (see src/app/admin/*)
 *
 * Kept as a hardcoded list rather than an env var so we can never ship
 * an empty allowlist by accident.
 */
const ADMIN_EMAILS = [
  'seanlongden0@gmail.com',
  'mattcerasia@gmail.com',
];

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
