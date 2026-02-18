import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  try {
    const { agentId, name, email, phone, message } = (await request.json()) as {
      agentId: string;
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    };

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    const { data: agent } = await supabase
      .from("agents")
      .select("id, customer_id, customers(email)")
      .eq("id", agentId)
      .maybeSingle();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        agent_id: agentId,
        customer_id: agent.customer_id,
        name,
        email,
        phone,
        message,
        status: "new",
      })
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (resend && agent.customers?.email) {
      await resend.emails.send({
        from: "Agentify <noreply@agentify.ch>",
        to: agent.customers.email,
        subject: `🔔 Neuer Lead: ${name ?? "Unbekannt"}`,
        html: `
          <h2>Neuer Kundenanfrage</h2>
          <p><strong>Name:</strong> ${name ?? "-"}</p>
          <p><strong>E-Mail:</strong> ${email ?? "-"}</p>
          <p><strong>Telefon:</strong> ${phone ?? "-"}</p>
          <p><strong>Nachricht:</strong> ${message ?? "-"}</p>
          <hr />
          <p>Antworten Sie schnell für beste Ergebnisse!</p>
          <a href="https://agentify.ch/dashboard/leads">Leads anzeigen</a>
        `,
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch (leadError) {
    console.error("Lead API error:", leadError);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}
