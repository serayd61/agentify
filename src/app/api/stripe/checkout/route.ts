import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPriceId, type PlanType, type BillingCycle } from '@/lib/stripe/client';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, cycle } = body as { plan: PlanType; cycle: BillingCycle };

    if (!plan || !cycle) {
      return NextResponse.json(
        { error: 'Plan und Zahlungszyklus erforderlich' },
        { status: 400 }
      );
    }

    // Get customer from database
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, email, stripe_customer_id, company_name')
      .eq('auth_user_id', user.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId = customer.stripe_customer_id;
    const stripe = getStripe();

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.company_name || undefined,
        metadata: {
          supabase_customer_id: customer.id,
        },
      });

      stripeCustomerId = stripeCustomer.id;

      // Save Stripe customer ID
      await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', customer.id);
    }

    // Get price ID
    const priceId = getPriceId(plan, cycle);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          supabase_customer_id: customer.id,
          plan,
          cycle,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      locale: 'de',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Checkout-Session' },
      { status: 500 }
    );
  }
}

