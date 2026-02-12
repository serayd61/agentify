import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
  get invoices() { return getStripe().invoices; },
};

// Price IDs for different plans
export const STRIPE_PRICES = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || 'price_basic_monthly',
    yearly: process.env.STRIPE_PRICE_BASIC_YEARLY || 'price_basic_yearly',
    amount: { monthly: 24900, yearly: 249000 }, // in cents CHF
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
    amount: { monthly: 44900, yearly: 449000 },
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
    amount: { monthly: 89900, yearly: 899000 },
  },
} as const;

export type PlanType = keyof typeof STRIPE_PRICES;
export type BillingCycle = 'monthly' | 'yearly';

export function getPriceId(plan: PlanType, cycle: BillingCycle): string {
  return STRIPE_PRICES[plan][cycle];
}

export function getPlanFromPriceId(priceId: string): { plan: PlanType; cycle: BillingCycle } | null {
  for (const [plan, prices] of Object.entries(STRIPE_PRICES)) {
    if (prices.monthly === priceId) {
      return { plan: plan as PlanType, cycle: 'monthly' };
    }
    if (prices.yearly === priceId) {
      return { plan: plan as PlanType, cycle: 'yearly' };
    }
  }
  return null;
}
