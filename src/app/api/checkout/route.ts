import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  console.warn("Stripe secret key is not configured.");
}

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2023-10-16" })
  : null;

type CheckoutPayload = {
  packageId: string;
  sectorId: string;
  billingCycle: "monthly" | "yearly";
};

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 500 });
  }

  try {
    const { packageId, sectorId, billingCycle } = (await request.json()) as CheckoutPayload;
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const { data: pkg } = await supabase
      .from("packages")
      .select("*, sectors(name_de)")
      .eq("id", packageId)
      .maybeSingle();

    if (!pkg) {
      return NextResponse.json({ error: "Paket wurde nicht gefunden" }, { status: 404 });
    }

    const price = billingCycle === "yearly" ? pkg.price_yearly : pkg.price_monthly;
    if (price == null) {
      return NextResponse.json({ error: "Preis fehlt" }, { status: 422 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: `${pkg.sectors?.name_de ?? "Agent"} · ${pkg.name_de}`,
              description: `${pkg.messages_per_month?.toLocaleString() ?? ""} Nachrichten/Monat`,
            },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval: billingCycle === "yearly" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        packageId,
        sectorId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agents/new?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout fehlgeschlagen" }, { status: 500 });
  }
}
