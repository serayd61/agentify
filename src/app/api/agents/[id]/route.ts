import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type RouteContext = { params: { id: string } } | { params: Promise<{ id: string }> };

async function getIdFromContext(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params.id;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const id = await getIdFromContext(context);
  const supabase = createServerClient();
  const { data } = await supabase
    .from("agents")
    .select("*, sectors(name_de), packages(name_de), config, status")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const supabase = createServerClient();
  const id = await getIdFromContext(context);
  const payload = await req.json();

  const { error } = await supabase.from("agents").update(payload).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const supabase = createServerClient();
  const id = await getIdFromContext(context);

  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
