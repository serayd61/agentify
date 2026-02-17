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

  const { data, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, agentId: data?.id });
}
