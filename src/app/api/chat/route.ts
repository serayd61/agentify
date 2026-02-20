import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { demoScenarios } from "@/lib/demo-scenarios";
import { generateSystemPrompt, AgentConfig } from "@/lib/agent-prompts";
import { buildContextPrompt, extractInfo, ConversationContext } from "@/lib/conversation-memory";
import { startConversation, addMessage } from "@/lib/conversation-service";

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
  visitorId?: string;
  device?: string;
  browser?: string;
  messages?: Array<{ role: string; content: string }>;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { sector } = body;

    if (sector) {
      return handleDemoChat(sector, body.messages || []);
    }

    const messages = body.messages && body.messages.length > 0
      ? body.messages
      : body.message
        ? [{ role: "user", content: body.message }]
        : [];

    if (!body.agentId || messages.length === 0) {
      return NextResponse.json({ success: false, error: "Missing agentId or message" }, { status: 400 });
    }

    const responsePayload = await handleAgentChat(body.agentId, messages, {
      conversationId: body.conversationId,
      visitorId: body.visitorId,
      device: body.device,
      browser: body.browser,
    });

    return NextResponse.json(responsePayload);
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

async function callOpenAI(messages: Array<{ role: string; content: string }>) {
  if (!OPENAI_API_KEY) return null;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function callAiProvider(messages: Array<{ role: string; content: string }>) {
  let provider: string | null = null;
  let response: string | null = null;
  try {
    if (GROQ_API_KEY) {
      provider = "groq";
      response = await callGroq(messages);
    } else if (OPENROUTER_API_KEY) {
      provider = "openrouter";
      response = await callOpenRouter(messages);
    } else if (OPENAI_API_KEY) {
      provider = "openai";
      response = await callOpenAI(messages);
    }
  } catch (error) {
    console.error("AI provider error", { provider, error });
  } finally {
    console.log("AI provider response", { provider, result: response });
  }
  if (!provider) {
    console.warn("No AI API credentials configured. Provide GROQ_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY.");
  }
  return response;
}

async function handleAgentChat(
  agentId: string,
  messages: Array<{ role: string; content: string }>,
  options: {
    visitorId?: string;
    conversationId?: string;
    device?: string;
    browser?: string;
  }
) {
  const { visitorId, conversationId, device, browser } = options;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing");
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: agent } = await supabase
    .from("agents")
    .select("id, customer_id, company_name, sector, services_data, working_hours, company_phone, company_email, faq_data")
    .eq("id", agentId)
    .maybeSingle();

  if (!agent) {
    throw new Error("Agent not found");
  }

  let convId = conversationId ?? null;

  const agentConfig: AgentConfig = {
    companyName: agent.company_name || "Unser Unternehmen",
    sector: agent.sector || "treuhand",
    services: agent.services_data || [],
    workingHours: agent.working_hours || "Mo-Fr 08:00-17:00",
    contactPhone: agent.company_phone || "",
    contactEmail: agent.company_email || "",
    faqData: agent.faq_data || [],
    personality: "professional",
    language: "de",
  };

  const systemPrompt = generateSystemPrompt(agentConfig);
  const lastUserMessage = messages.slice().reverse().find((msg) => msg.role === "user")?.content || "";
  const extractedInfo = extractInfo(lastUserMessage);

  const context: ConversationContext = {
    extractedData: extractedInfo.extractedData || {},
    previousMessages: messages.slice(-10),
    visitorName: extractedInfo.visitorName,
    visitorPhone: extractedInfo.visitorPhone,
    visitorEmail: extractedInfo.visitorEmail,
    intent: extractedInfo.intent,
    sentiment: extractedInfo.sentiment,
    topic: extractedInfo.topic,
  };

  const contextPrompt = buildContextPrompt(context);
  const fullSystemPrompt = `${systemPrompt}\n${contextPrompt}`;
  const payloadMessages = [
    { role: "system", content: fullSystemPrompt },
    ...messages,
  ];

  const aiMessage = (await callAiProvider(payloadMessages))
    ?? getFallbackResponse(lastUserMessage, agent.sector || "treuhand");

  const metadataPayload: Record<string, unknown> = {
    ...(extractedInfo.extractedData || {}),
    visitorName: extractedInfo.visitorName,
    visitorEmail: extractedInfo.visitorEmail,
    visitorPhone: extractedInfo.visitorPhone,
    intent: extractedInfo.intent,
    sentiment: extractedInfo.sentiment,
    topic: extractedInfo.topic,
  };

  if (!convId) {
    try {
      convId = await startConversation({
        agentId: agent.id,
        customerId: agent.customer_id,
        visitorId: visitorId || crypto.randomUUID(),
        visitorInfo: {
          name: extractedInfo.visitorName,
          email: extractedInfo.visitorEmail,
          phone: extractedInfo.visitorPhone,
          device,
          browser,
        },
      });
    } catch (startError) {
      console.error("Failed to start conversation", startError);
    }
  }

  if (convId) {
    try {
      await addMessage(convId, { role: "user", content: lastUserMessage, timestamp: new Date().toISOString() }, metadataPayload);
      await addMessage(convId, { role: "assistant", content: aiMessage, timestamp: new Date().toISOString() });
    } catch (addError) {
      console.error("Failed to record conversation messages", addError);
    }
  }

  return { success: true, message: aiMessage, extractedInfo, conversationId: convId };
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
