import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) {
  console.warn("Stripe secret key is not configured. Webhook cannot validate events.");
}

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2023-10-16" })
  : null;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe Webhook not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook verification failed", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const supabase = createServerClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const packageId = session.metadata?.packageId;
    const sectorId = session.metadata?.sectorId;

    if (userId && packageId && sectorId) {
      await supabase.from("agents").insert({
        customer_id: userId,
        sector_id: sectorId,
        package_id: packageId,
        name: session.metadata?.sectorId || "Mein KI-Assistent",
        status: "active",
        stripe_subscription_id: session.subscription,
      });

      await supabase
        .from("customers")
        .update({
          stripe_customer_id: session.customer,
          subscription_status: "active",
        })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase
      .from("agents")
      .update({ status: "cancelled" })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
