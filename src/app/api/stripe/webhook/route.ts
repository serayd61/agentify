import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPlanFromPriceId } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Type for resolved Supabase client
type SupabaseAdminClient = Awaited<ReturnType<typeof createAdminClient>>;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          await handleSubscriptionCreated(supabase, subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Helper function to safely get subscription period
function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  // Type assertion for accessing period fields
  const sub = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    trial_start?: number | null;
    trial_end?: number | null;
    canceled_at?: number | null;
  };
  
  return {
    currentPeriodStart: sub.current_period_start 
      ? new Date(sub.current_period_start * 1000).toISOString() 
      : null,
    currentPeriodEnd: sub.current_period_end 
      ? new Date(sub.current_period_end * 1000).toISOString() 
      : null,
    trialStart: sub.trial_start 
      ? new Date(sub.trial_start * 1000).toISOString() 
      : null,
    trialEnd: sub.trial_end 
      ? new Date(sub.trial_end * 1000).toISOString() 
      : null,
    canceledAt: sub.canceled_at 
      ? new Date(sub.canceled_at * 1000).toISOString() 
      : null,
  };
}

async function handleSubscriptionCreated(
  supabase: SupabaseAdminClient,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.metadata?.supabase_customer_id;
  const priceId = subscription.items.data[0]?.price.id;
  const planInfo = getPlanFromPriceId(priceId);
  const period = getSubscriptionPeriod(subscription);

  let dbCustomerId = customerId;

  if (!dbCustomerId) {
    // Try to find customer by Stripe customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();
    
    if (!customer) {
      console.error('Customer not found for subscription:', subscription.id);
      return;
    }
    dbCustomerId = customer.id;
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      customer_id: dbCustomerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan: planInfo?.plan || 'basic',
      billing_cycle: planInfo?.cycle || 'monthly',
      status: subscription.status as string,
      current_period_start: period.currentPeriodStart,
      current_period_end: period.currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: period.trialStart,
      trial_end: period.trialEnd,
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionUpdated(
  supabase: SupabaseAdminClient,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;
  const planInfo = getPlanFromPriceId(priceId);
  const period = getSubscriptionPeriod(subscription);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      plan: planInfo?.plan || 'basic',
      billing_cycle: planInfo?.cycle || 'monthly',
      status: subscription.status as string,
      current_period_start: period.currentPeriodStart,
      current_period_end: period.currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: period.canceledAt,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(
  supabase: SupabaseAdminClient,
  subscription: Stripe.Subscription
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error deleting subscription:', error);
  }
}

async function handleInvoicePaid(
  supabase: SupabaseAdminClient,
  invoice: Stripe.Invoice
) {
  // Get customer ID from Stripe customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (!customer) return;

  const { error } = await supabase
    .from('invoices')
    .upsert({
      customer_id: customer.id,
      stripe_invoice_id: invoice.id,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      period_start: invoice.period_start 
        ? new Date(invoice.period_start * 1000).toISOString() 
        : null,
      period_end: invoice.period_end 
        ? new Date(invoice.period_end * 1000).toISOString() 
        : null,
    }, {
      onConflict: 'stripe_invoice_id',
    });

  if (error) {
    console.error('Error saving invoice:', error);
  }
}

async function handleInvoicePaymentFailed(
  supabase: SupabaseAdminClient,
  invoice: Stripe.Invoice
) {
  // Update subscription status to past_due
  // Type assertion for subscription field
  const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string | null };
  
  if (invoiceWithSub.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoiceWithSub.subscription);

    if (error) {
      console.error('Error updating subscription status:', error);
    }
  }
}
