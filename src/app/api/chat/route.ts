import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { demoScenarios } from "@/lib/demo-scenarios";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://api.openrouter.ai/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "gpt-4o-mini";

const sectorPrompts: Record<string, string> = {
  treuhand: `Du bist der freundliche KI-Assistent der Treuhand Muster AG in Zürich. Du hilfst Kunden bei Fragen zu: - Buchhaltung und Jahresabschlüssen - Steuererklärungen (Privat ab CHF 350.-, Firma ab CHF 800.-) - Lohnbuchhaltung (ab CHF 15.-/Mitarbeiter) - Firmengründungen (Pauschal CHF 1'200.-) - MwSt-Abrechnungen Antworte immer auf Schweizer Hochdeutsch, freundlich und professionell. Verwende "Grüezi" als Begrüssung. Biete konkrete Preise und Terminvorschläge an. Halte Antworten kurz (max 3-4 Sätze), ausser der Kunde fragt nach Details.`,
  handwerk: `Du bist der KI-Assistent von Elektro Brunner GmbH in Zürich. Du hilfst bei: - Notfällen (24/7 Pikett: 044 123 45 67) - Elektrokontrollen (ab CHF 280.-) - Solaranlagen (Offerte auf Anfrage) - Terminvereinbarungen - Smart Home Installation Bei Notfällen (Stromausfall, Brandgeruch, Funken): Sofort Pikett-Nummer geben! Antworte auf Schweizer Hochdeutsch, pragmatisch und lösungsorientiert.`,
  gastronomie: `Du bist der KI-Assistent vom Restaurant Sonnenberg in Zürich. Du hilfst bei: - Tischreservierungen (Di-Sa 11:30-14:00, 18:00-22:00) - Menü-Fragen (3-Gang CHF 58.-, 4-Gang CHF 72.-) - Allergien und Diätwünsche (vegan, glutenfrei verfügbar) - Events und Gruppenreservierungen (ab 10 Personen) - Take-away Bestellungen Sei herzlich und einladend. Frage nach Datum, Uhrzeit und Personenzahl bei Reservierungen.`,
  gesundheit: `Du bist der KI-Assistent der Arztpraxis Dr. med. Sarah Keller in Zürich. Du hilfst bei: - Terminbuchungen (Mo-Fr 08:00-17:00) - Rezeptanfragen (nur für bestehende Patienten) - Allgemeine Fragen zu Öffnungszeiten - Notfall-Weiterleitung WICHTIG: Gib KEINE medizinischen Diagnosen oder Behandlungsempfehlungen! Bei Notfällen: 144 (Ambulanz) oder Notfallstation empfehlen. Sei einfühlsam und professionell.`,
  immobilien: `Du bist der KI-Assistent von Immo Swiss AG in Zürich. Du hilfst bei: - Wohnungssuche (Miete und Kauf) - Besichtigungsterminen - Fragen zu verfügbaren Objekten - Bewerbungsunterlagen Aktuelle Angebote: - 3.5 Zi in Oerlikon, CHF 2'450.-/Mt. - 4.5 Zi in Altstetten, CHF 2'890.-/Mt. - 2 Zi Studio Wiedikon, CHF 1'650.-/Mt. Frage nach Budget, gewünschter Grösse und Bezugstermin.`,
  rechtsberatung: `Du bist der KI-Assistent der Kanzlei Weber & Partner in Zürich. Spezialgebiete: Vertragsrecht, Arbeitsrecht, Familienrecht, Erbrecht. Du hilfst bei: - Terminvereinbarungen (Erstberatung CHF 250.-/Stunde) - Allgemeinen Fragen zum Ablauf - Weiterleitung an den richtigen Anwalt WICHTIG: Gib KEINE konkreten Rechtsberatungen! Empfehle immer ein persönliches Gespräch für rechtliche Fragen. Sei seriös und vertrauenswürdig.`,
};

interface ChatRequest {
  agentId?: string; // template ID or customer agent key
  sector?: string;
  conversationId?: string;
  messages?: Array<{ role: string; content: string }>;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { sector, messages } = body;

    if (sector) {
      return handleDemoChat(sector, messages || []);
    }

    // Fall back to existing logic (OpenAI + Supabase) for real agents
    const { agentId, conversationId, message } = body;
    if (!agentId || !message) {
      return NextResponse.json({ success: false, error: "Missing agentId or message" }, { status: 400 });
    }

    const convId = conversationId || crypto.randomUUID();
    const responsePayload = await handleAgentChat(agentId, message, convId);

    return NextResponse.json({ ...responsePayload, conversationId: convId });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

async function handleDemoChat(sector: string, convo: Array<{ role: string; content: string }>) {
  const prompt = sectorPrompts[sector] || sectorPrompts.treuhand;
  const systemMessages = [{ role: "system", content: prompt }, ...convo];
  let answer: string | null = null;

  try {
    if (GROQ_API_KEY) {
      answer = await callGroq(systemMessages);
    } else if (OPENROUTER_API_KEY) {
      answer = await callOpenRouter(systemMessages);
    }
  } catch (error) {
    console.error("Demo chat AI error:", error);
  }

  if (!answer) {
    const lastUser = convo.slice().reverse().find((msg) => msg.role === "user")?.content || "";
    answer = getFallbackResponse(lastUser, sector);
  }

  return NextResponse.json({ success: true, message: answer });
}

async function callGroq(messages: Array<{ role: string; content: string }>) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function callOpenRouter(messages: Array<{ role: string; content: string }>) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function handleAgentChat(agentId: string, message: string, conversationId?: string) {
  let systemPrompt: string | null = null;
  let knowledgeBase: Array<{ q: string; a: string }> = [];
  let agentName = agentId;

  const supabaseConfigAvailable = !!(supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith("http"));
  if (supabaseConfigAvailable) {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { data: customerAgent } = await supabase
      .from("customer_agents")
      .select("id, name, custom_prompt, custom_knowledge, template_id, status")
      .eq("api_key", agentId)
      .eq("status", "active")
      .single();

    if (customerAgent) {
      const { data: template } = await supabase
        .from("agent_templates")
        .select("system_prompt, knowledge_base, name")
        .eq("id", customerAgent.template_id)
        .single();
      if (template) {
        systemPrompt = customerAgent.custom_prompt || template.system_prompt;
        knowledgeBase = [
          ...(template.knowledge_base || []),
          ...(customerAgent.custom_knowledge || []),
        ];
        agentName = customerAgent.name;
      }

      try {
        let dbConvId = conversationId;
        if (!dbConvId) {
          const { data: conv } = await supabase
            .from("conversations")
            .insert({ agent_id: customerAgent.id, source: "widget" })
            .select("id")
            .single();
          dbConvId = conv?.id;
        }
        if (dbConvId) {
          await supabase.from("messages").insert({
            conversation_id: dbConvId,
            role: "user",
            content: message,
          });
        }
        await supabase.rpc("increment_message_count", { agent_uuid: customerAgent.id });
      } catch (e) {
        console.warn("Failed to store message:", e);
      }
    } else {
      const { data: template } = await supabase
        .from("agent_templates")
        .select("system_prompt, knowledge_base, name")
        .eq("id", agentId)
        .single();
      if (template) {
        systemPrompt = template.system_prompt;
        knowledgeBase = template.knowledge_base || [];
        agentName = template.name;
      }
    }
  }

  let responseText: string;
  if (OPENAI_API_KEY && systemPrompt) {
    responseText = await generateOpenAIResponse(systemPrompt, knowledgeBase, message);
  } else if (systemPrompt) {
    responseText = generateFallbackResponse(agentId, message, knowledgeBase);
  } else {
    responseText = generateHardcodedFallback(agentId, message);
  }

  if (supabaseConfigAvailable && conversationId) {
    try {
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: responseText,
      });
    } catch (e) {
      console.warn("Failed to store response:", e);
    }
  }

  return {
    success: true,
    agent: agentName,
    response: responseText,
  };
}

async function generateOpenAIResponse(
  systemPrompt: string,
  knowledgeBase: Array<{ q: string; a: string }>,
  userMessage: string
): Promise<string> {
  const knowledgeContext = knowledgeBase.length > 0
    ? "\n\nWISSENSBANK:\n" + knowledgeBase.map(k => `F: ${k.q}\nA: ${k.a}`).join("\n\n")
    : "";
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt + knowledgeContext },
          { role: "user", content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "Entschuldigung, ich konnte keine Antwort generieren.";
  } catch (error) {
    console.error("OpenAI chat error:", error);
    return "Entschuldigung, der Service ist momentan nicht verfügbar.";
  }
}

function generateFallbackResponse(
  agentId: string,
  userMessage: string,
  knowledgeBase: Array<{ q: string; a: string }>
): string {
  const lower = userMessage.toLowerCase();
  for (const item of knowledgeBase) {
    const keywords = item.q.toLowerCase().split(/\s+/);
    const matches = keywords.filter((kw) => kw.length > 3 && lower.includes(kw));
    if (matches.length > 0) {
      return item.a;
    }
  }
  return generateHardcodedFallback(agentId, userMessage);
}

function generateHardcodedFallback(agentId: string, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  const id = agentId.replace("-agent", "");
  const fallbacks: Record<string, Record<string, string>> = {
    treuhand: {
      mwst: "Die aktuellen MWST-Sätze: Normalsatz 8.1%, reduziert 2.6%, Beherbergung 3.8%.",
      steuer: "Steuererklärung Frist: 31. März. Gerne berate ich Sie persönlich.",
      termin: "Bitte nennen Sie mir Ihren Namen, Telefonnummer und Anliegen für einen Termin.",
      buchhaltung: "Wir bieten Buchhaltung, Jahresabschluss und Lohnbuchhaltung.",
      default: "Grüezi! Ich helfe bei MWST, Steuern, Buchhaltung und Terminen. Was darf ich für Sie tun?",
    },
  };
  const agentFallbacks = fallbacks[id] || fallbacks.treuhand;
  for (const [key, response] of Object.entries(agentFallbacks)) {
    if (key !== "default" && lower.includes(key)) {
      return response;
    }
  }
  return agentFallbacks.default;
}

function getFallbackResponse(lastUserMessage: string, sector: string): string {
  const scenario = demoScenarios[sector] || demoScenarios.treuhand;
  const lower = lastUserMessage.toLowerCase();
  for (const [key, value] of Object.entries(scenario.responses)) {
    if (key === "default") continue;
    if (lower.includes(key) || lower.includes(key.replace(/\s+/g, ""))) {
      return value;
    }
  }
  return scenario.responses.default;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "healthy",
    features: {
      groq: !!GROQ_API_KEY,
      openrouter: !!OPENROUTER_API_KEY,
      openai: !!OPENAI_API_KEY,
      supabase: !!(supabaseUrl && supabaseServiceKey),
    },
    timestamp: new Date().toISOString(),
  });
}
