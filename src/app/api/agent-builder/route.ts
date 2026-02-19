import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type BuilderPayload = {
  sector: string;
  plan: string;
  company: {
    name: string;
    address: string;
    phone: string;
    website: string;
    email: string;
  };
  logoName?: string;
  content: {
    welcome: string;
    hours: string;
    contactEmail: string;
    contactPhone: string;
  };
  faqs: Array<{ question: string; answer: string }>;
};

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!customer?.id) {
    return NextResponse.json({ error: "Kunde nicht gefunden" }, { status: 404 });
  }

  const payload: BuilderPayload = await request.json();
  const { sector, plan, company, logoName, content, faqs } = payload;
  const customerId = customer.id;

  const { data: sectorRow } = await supabase
    .from("sectors")
    .select("id")
    .eq("slug", sector)
    .maybeSingle();

  if (!sectorRow?.id) {
    return NextResponse.json({ error: "Sektor nicht gefunden" }, { status: 400 });
  }

  const { data: packageRow } = await supabase
    .from("packages")
    .select("id")
    .eq("sector_id", sectorRow.id)
    .eq("tier", plan)
    .maybeSingle();

  if (!packageRow?.id) {
    return NextResponse.json({ error: "Paket nicht gefunden" }, { status: 400 });
  }

  const { data: customerAgent, error: customerAgentError } = await supabase
    .from("customer_agents")
    .insert({
      customer_id: customer.id,
      name: company.name,
      system_prompt: `Builder goldener Pfad für ${sector}`,
      custom_settings: {
        sector,
        plan,
        company,
        logoName,
        content,
        faqs,
      },
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (customerAgentError || !customerAgent?.id) {
    console.error("Customer agent creation failed", customerAgentError);
    return NextResponse.json({ error: "Agent konnte nicht erstellt werden" }, { status: 500 });
  }

  // agents tablosuna da ekle - basitleştirilmiş
  const { error: agentError } = await supabase
    .from("agents")
    .insert({
      customer_id: customerId,
      name: company.name || "Mein Agent",
      status: "active",
    })
    .select()
    .single();

  if (agentError) {
    console.error("Agents insert error:", agentError);
  }

  return NextResponse.json({ success: true, agentId: customerAgent.id });
}
