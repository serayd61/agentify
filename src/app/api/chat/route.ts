import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatRequest {
  agentId: string;       // template ID (demo) or customer agent API key
  message: string;
  conversationId?: string;
}

/**
 * POST /api/chat
 * Handles chat for both demo agents and provisioned customer agents
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { agentId, message, conversationId } = body;

    if (!agentId || !message) {
      return NextResponse.json({ success: false, error: 'Missing agentId or message' }, { status: 400 });
    }

    const convId = conversationId || crypto.randomUUID();

    // Try to load agent config from Supabase
    let systemPrompt: string | null = null;
    let knowledgeBase: Array<{ q: string; a: string }> = [];
    let agentName = agentId;

    if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // First try: customer agent by API key
      const { data: customerAgent } = await supabase
        .from('customer_agents')
        .select('id, name, custom_prompt, custom_knowledge, template_id, status')
        .eq('api_key', agentId)
        .eq('status', 'active')
        .single();

      if (customerAgent) {
        // Load template for system prompt
        const { data: template } = await supabase
          .from('agent_templates')
          .select('system_prompt, knowledge_base, name')
          .eq('id', customerAgent.template_id)
          .single();

        if (template) {
          systemPrompt = customerAgent.custom_prompt || template.system_prompt;
          knowledgeBase = [
            ...(template.knowledge_base || []),
            ...(customerAgent.custom_knowledge || []),
          ];
          agentName = customerAgent.name;
        }

        // Store message & increment count
        try {
          // Find or create conversation
          let dbConvId = conversationId;
          if (!dbConvId) {
            const { data: conv } = await supabase
              .from('conversations')
              .insert({ agent_id: customerAgent.id, source: 'widget' })
              .select('id')
              .single();
            dbConvId = conv?.id;
          }

          if (dbConvId) {
            await supabase.from('messages').insert({
              conversation_id: dbConvId,
              role: 'user',
              content: message,
            });
          }

          await supabase.rpc('increment_message_count', { agent_uuid: customerAgent.id });
        } catch (e) {
          console.warn('Failed to store message:', e);
        }
      } else {
        // Second try: demo agent by template ID
        const { data: template } = await supabase
          .from('agent_templates')
          .select('system_prompt, knowledge_base, name')
          .eq('id', agentId)
          .single();

        if (template) {
          systemPrompt = template.system_prompt;
          knowledgeBase = template.knowledge_base || [];
          agentName = template.name;
        }
      }
    }

    // Generate response
    let responseText: string;

    if (OPENAI_API_KEY && systemPrompt) {
      // Use OpenAI with agent-specific prompt
      responseText = await generateAIResponse(systemPrompt, knowledgeBase, message);
    } else if (systemPrompt) {
      // Fallback: keyword matching with knowledge base
      responseText = generateFallbackResponse(agentId, message, knowledgeBase);
    } else {
      // No config found: use hardcoded fallbacks
      responseText = generateHardcodedFallback(agentId, message);
    }

    // Store assistant response
    if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http') && conversationId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: responseText,
        });
      } catch (e) {
        console.warn('Failed to store response:', e);
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: convId,
      response: responseText,
      agent: agentName,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Generate AI response using OpenAI
 */
async function generateAIResponse(
  systemPrompt: string,
  knowledgeBase: Array<{ q: string; a: string }>,
  userMessage: string
): Promise<string> {
  // Build knowledge context
  const knowledgeContext = knowledgeBase.length > 0
    ? '\n\nWISSENSBANK:\n' + knowledgeBase.map(k => `F: ${k.q}\nA: ${k.a}`).join('\n\n')
    : '';

  const fullPrompt = systemPrompt + knowledgeContext;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: fullPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
  } catch {
    return 'Entschuldigung, der Service ist momentan nicht verfügbar.';
  }
}

/**
 * Fallback: match user message against knowledge base
 */
function generateFallbackResponse(
  agentId: string,
  userMessage: string,
  knowledgeBase: Array<{ q: string; a: string }>
): string {
  const lower = userMessage.toLowerCase();

  // Search knowledge base
  for (const item of knowledgeBase) {
    const keywords = item.q.toLowerCase().split(/\s+/);
    const matches = keywords.filter(kw => kw.length > 3 && lower.includes(kw));
    if (matches.length >= 1) {
      return item.a;
    }
  }

  // No match → generic
  return generateHardcodedFallback(agentId, userMessage);
}

/**
 * Hardcoded fallbacks when no DB available
 */
function generateHardcodedFallback(agentId: string, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  const id = agentId.replace('-agent', '');

  const fallbacks: Record<string, Record<string, string>> = {
    treuhand: {
      mwst: 'Die aktuellen MWST-Sätze: Normalsatz 8.1%, reduziert 2.6%, Beherbergung 3.8%.',
      steuer: 'Steuererklärung Frist: 31. März (Verlängerung möglich). Gerne berate ich Sie persönlich.',
      termin: 'Gerne! Bitte nennen Sie mir Ihren Namen, Telefonnummer und Ihr Anliegen.',
      buchhaltung: 'Wir bieten laufende Buchhaltung, Jahresabschluss und Lohnbuchhaltung an.',
      default: 'Grüezi! Ich helfe Ihnen bei MWST, Steuern, Buchhaltung und Terminen. Wie kann ich helfen?',
    },
    gesundheit: {
      termin: 'Gerne buche ich einen Termin. Welches Anliegen haben Sie?',
      notfall: '🚨 Bei Notfällen: 144 anrufen. Unsere Notfallnummer: 0800 123 456.',
      öffnungszeit: 'Mo-Fr 08:00-18:00, Sa 09:00-12:00, So geschlossen.',
      default: 'Grüezi! Termin buchen, Öffnungszeiten oder andere Fragen — ich helfe gerne!',
    },
    gastro: {
      reserv: 'Gerne! Bitte nennen Sie Datum, Uhrzeit und Personenzahl.',
      speisekarte: 'Tagesempfehlung: Zürcher Geschnetzeltes CHF 32. Vollständige Karte auf unserer Website.',
      öffnungszeit: 'Di-Sa 11:30-14:00 & 18:00-23:00, So 11:30-15:00 (Brunch), Mo Ruhetag.',
      default: 'Herzlich willkommen! Tisch reservieren, Speisekarte oder Öffnungszeiten — fragen Sie einfach!',
    },
  };

  const agentFallbacks = fallbacks[id] || fallbacks.treuhand;

  for (const [key, response] of Object.entries(agentFallbacks)) {
    if (key !== 'default' && lower.includes(key)) {
      return response;
    }
  }

  return agentFallbacks.default || 'Vielen Dank für Ihre Nachricht. Wie kann ich Ihnen helfen?';
}

/**
 * GET /api/chat - Health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'healthy',
    features: {
      openai: !!OPENAI_API_KEY,
      supabase: !!(supabaseUrl && supabaseServiceKey),
    },
    timestamp: new Date().toISOString(),
  });
}
