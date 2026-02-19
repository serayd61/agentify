import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  try {
    const { agentId, name, email, phone, date, time, service, notes } = (await request.json()) as {
      agentId: string;
      name: string;
      email?: string;
      phone?: string;
      date: string;
      time: string;
      service?: string;
      notes?: string;
    };

    if (!agentId || !name || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: agent } = await supabase
      .from("agents")
      .select("id, customer_id, customers(email, company_name)")
      .eq("id", agentId)
      .maybeSingle();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        agent_id: agentId,
        customer_id: agent.customer_id,
        name,
        email,
        phone,
        date,
        time,
        service,
        notes,
        status: "pending",
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    const customerEmail = agent.customers?.email;
    const sender = "Agentify <noreply@agentify.ch>";
    const subject = `🗓️ Neue Termin-Anfrage von ${name}`;
    const html = `
      <h2>Neue Termin-Anfrage</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> ${email ?? "-"}</p>
      <p><strong>Telefon:</strong> ${phone ?? "-"}</p>
      <p><strong>Datum:</strong> ${date}</p>
      <p><strong>Uhrzeit:</strong> ${time}</p>
      <p><strong>Service:</strong> ${service ?? "-"}</p>
      <p><strong>Notizen:</strong> ${notes ?? "-"}</p>
      <p><strong>Status:</strong> Pending</p>
      <hr />
      <p>Besuche das Dashboard, um den Lead zu bestätigen.</p>
    `;

    if (resend && customerEmail) {
      await resend.emails.send({
        from: sender,
        to: customerEmail,
        subject,
        html,
      });
    }

    if (resend && email) {
      await resend.emails.send({
        from: sender,
        to: email,
        subject: "Ihre Anfrage ist eingegangen",
        html: `
          <p>Danke ${name}, wir haben Ihre Terminanfrage erhalten.</p>
          <p>Wir melden uns schnellstmöglich zur Bestätigung.</p>
        `,
      });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (err) {
    console.error("Appointment error:", err);
    return NextResponse.json({ error: "Failed to save appointment" }, { status: 500 });
  }
}
