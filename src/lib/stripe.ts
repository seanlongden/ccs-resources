import Stripe from 'stripe';

/**
 * CCS Stripe subscription check.
 *
 * Access is granted ONLY for subscriptions on the single CCS product
 * ID below. Legacy CCG products, Consulting Calls, DFY Leadgen, and
 * other Sean-owned products are deliberately excluded — the CCS
 * Resources site is for CCS members only.
 *
 * Matches the pattern used in ai-ark-list-builder — same product ID,
 * same filter shape.
 */

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw at import time — Next.js's build step imports every
  // route module to discover routes and the runtime env vars aren't
  // available then. Fail loudly at first actual use instead.
  console.warn('STRIPE_SECRET_KEY is not set. Auth will fail until it is.');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

export type SubscriptionStatus = {
  hasAccess: boolean;
  status: 'active' | 'trialing' | 'canceled_with_access' | 'no_subscription' | 'lifetime';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
};

// The single CCS product ID. Only subs on this product grant access.
// Match ai-ark-list-builder so the two tools accept the same members.
const ALLOWED_PRODUCT_IDS = new Set([
  'prod_Unz3chWt308EEd', // CCS
]);

type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end: number;
  cancel_at_period_end: boolean;
};

function subscriptionIsOnAllowedProduct(sub: Stripe.Subscription): boolean {
  return sub.items.data.some((item) => {
    const product = item.price.product;
    const productId = typeof product === 'string' ? product : product.id;
    return ALLOWED_PRODUCT_IDS.has(productId);
  });
}

export async function checkStripeSubscription(email: string): Promise<SubscriptionStatus> {
  if (!stripe) {
    console.error('checkStripeSubscription called but stripe is not initialised');
    return { hasAccess: false, status: 'no_subscription' };
  }

  try {
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return { hasAccess: false, status: 'no_subscription' };
    }

    const customer = customers.data[0];

    // Get all subscriptions for this customer (any status)
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return { hasAccess: false, status: 'no_subscription' };
    }

    // Prefer active / trialing subs on the CCS product.
    for (const subscription of subscriptions.data) {
      const sub = subscription as SubscriptionWithPeriod;
      if (!subscriptionIsOnAllowedProduct(sub)) continue;

      if (sub.status === 'active') {
        return {
          hasAccess: true,
          status: sub.cancel_at_period_end ? 'canceled_with_access' : 'active',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
      }

      if (sub.status === 'trialing') {
        return {
          hasAccess: true,
          status: 'trialing',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
      }
    }

    // Fall back to any canceled CCS sub still within its paid period.
    for (const subscription of subscriptions.data) {
      const sub = subscription as SubscriptionWithPeriod;
      if (!subscriptionIsOnAllowedProduct(sub)) continue;

      if (sub.status === 'canceled') {
        const periodEnd = new Date(sub.current_period_end * 1000);
        if (periodEnd > new Date()) {
          return {
            hasAccess: true,
            status: 'canceled_with_access',
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: true,
          };
        }
      }
    }

    return { hasAccess: false, status: 'no_subscription' };
  } catch (error) {
    console.error('Error checking Stripe subscription:', error);
    return { hasAccess: false, status: 'no_subscription' };
  }
}
