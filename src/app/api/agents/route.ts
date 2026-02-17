import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!customer?.id) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { data } = await supabase
    .from("agents")
    .select("*, sectors(name_de), packages(name_de)")
    .eq("customer_id", customer.id);

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!customer?.id) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const payload = await req.json();
  const { sector_id, package_id, name, formData, content } = payload;

  if (!sector_id || !package_id) {
    return NextResponse.json({ error: "Sector and package are required" }, { status: 400 });
  }

  const { data: agent, error } = await supabase
    .from("agents")
    .insert(
      {
        customer_id: customer.id,
        sector_id,
        package_id,
        name,
        status: "draft",
        config: { form: formData },
      },
      { returning: "representation" }
    )
    .select("id")
    .maybeSingle();

  if (error || !agent?.id) {
    return NextResponse.json({ error: error?.message ?? "Agent creation failed" }, { status: 500 });
  }

  if (content?.services) {
    await supabase.from("agent_content").insert({
      agent_id: agent.id,
      content_type: "services",
      content_key: "services",
      content_value_de: content.services,
    });
  }

  if (content?.faqs) {
    await supabase.from("agent_content").insert({
      agent_id: agent.id,
      content_type: "faqs",
      content_key: "faqs",
      content_value_de: content.faqs,
    });
  }

  return NextResponse.json({ agent_id: agent.id });
}
