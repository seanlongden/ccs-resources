import { checkStripeSubscription, SubscriptionStatus } from './stripe';
import { isLifetimeMember } from './lifetime-members';
import { isAdmin } from './admin';

export type AccessStatus = SubscriptionStatus;

/**
 * Access check for CCS Resources login.
 *
 * Runs three checks in this order (first hit wins):
 *   1. Admin bypass (hardcoded emails in src/lib/admin.ts) — always in
 *   2. Google Sheet allowlist (src/lib/lifetime-members.ts) — in
 *   3. Active CCS Stripe subscription (src/lib/stripe.ts) — in
 *
 * Matches ai-ark-list-builder so both tools accept the same members.
 * Admin bypass ensures Sean + Matt can always log in without a sub.
 */
export async function checkAccess(email: string): Promise<AccessStatus> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Admin bypass — hardcoded owner emails skip every downstream
  //    check. Reported as "active" so no UI codepath needs to know
  //    admins are different.
  if (isAdmin(normalizedEmail)) {
    return {
      hasAccess: true,
      status: 'active',
    };
  }

  // 2. Google Sheet allowlist (kept under the historical "lifetime"
  //    naming — same sheet as ai-ark-list-builder).
  const isLifetime = await isLifetimeMember(normalizedEmail);
  if (isLifetime) {
    return {
      hasAccess: true,
      status: 'lifetime',
    };
  }

  // 3. Active CCS Stripe subscription (product ID filtered to
  //    prod_Unz3chWt308EEd only).
  const stripeStatus = await checkStripeSubscription(normalizedEmail);
  return stripeStatus;
}
