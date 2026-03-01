import { NextRequest, NextResponse } from "next/server";
import { callModalWebhook } from "@/lib/marketing/modal-client";

// Must return 200 within 5 seconds — Instantly's webhook timeout
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  // Validate shared secret to prevent abuse
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.INSTANTLY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Fire-and-forget: Instantly needs an instant 200, Modal handles the rest
  callModalWebhook({
    slug: "instantly-autoreply",
    data: payload,
  }).catch((err) =>
    console.error("[instantly-webhook] Modal call failed:", err)
  );

  return NextResponse.json({ received: true });
}
