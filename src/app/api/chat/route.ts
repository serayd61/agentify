import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// OpenClaw Gateway URL
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:18789';

// Supabase client for message storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface ChatRequest {
  agentId: string;
  message: string;
  conversationId?: string;
  metadata?: {
    language?: string;
    source?: string;
  };
}

interface OpenClawResponse {
  response: string;
  suggestedActions?: string[];
  confidence?: number;
}

// Map agent IDs to OpenClaw skill names
const AGENT_SKILL_MAP: Record<string, string> = {
  'treuhand-agent': 'treuhand-agent',
  'treuhand': 'treuhand-agent',
  'fiduciary': 'treuhand-agent',
  // Add more mappings as needed
};

/**
 * POST /api/chat
 * Proxy chat messages to OpenClaw gateway and store in Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { agentId, message, conversationId, metadata } = body;

    // Validate request
    if (!agentId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing agentId or message' },
        { status: 400 }
      );
    }

    // Get skill name from agent ID
    const skillName = AGENT_SKILL_MAP[agentId] || agentId;

    // Generate or use existing conversation ID
    const convId = conversationId || crypto.randomUUID();

    // Store user message in Supabase (if configured)
    if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http')) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'user',
          content: message,
          metadata: metadata || {},
        });
      } catch (dbError) {
        console.warn('Failed to store user message:', dbError);
      }
    }

    // Call OpenClaw gateway
    let openclawResponse: OpenClawResponse;
    
    try {
      const openclawResult = await fetch(`${OPENCLAW_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill: skillName,
          message: message,
          context: {
            conversationId: convId,
            agentId: agentId,
            ...metadata,
          },
        }),
      });

      if (!openclawResult.ok) {
        // If OpenClaw is not available, use fallback response
        console.warn(`OpenClaw returned ${openclawResult.status}, using fallback`);
        openclawResponse = await getFallbackResponse(skillName, message);
      } else {
        openclawResponse = await openclawResult.json();
      }
    } catch (fetchError) {
      // OpenClaw not reachable, use fallback
      console.warn('OpenClaw not reachable, using fallback:', fetchError);
      openclawResponse = await getFallbackResponse(skillName, message);
    }

    // Store assistant response in Supabase (if configured)
    if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http')) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'assistant',
          content: openclawResponse.response,
          metadata: {
            suggestedActions: openclawResponse.suggestedActions,
            confidence: openclawResponse.confidence,
          },
        });
      } catch (dbError) {
        console.warn('Failed to store assistant message:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: convId,
      response: openclawResponse.response,
      suggestedActions: openclawResponse.suggestedActions,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * Fallback response when OpenClaw is not available
 * Uses skill-specific knowledge to provide basic responses
 */
async function getFallbackResponse(skillName: string, userMessage: string): Promise<OpenClawResponse> {
  const lowerMessage = userMessage.toLowerCase();

  // Treuhand-specific fallback responses
  if (skillName === 'treuhand-agent') {
    // MWST questions
    if (lowerMessage.includes('mwst') || lowerMessage.includes('mehrwertsteuer')) {
      return {
        response: 'Die aktuellen MWST-Sätze in der Schweiz sind:\n\n• Normalsatz: 8.1%\n• Reduzierter Satz: 2.6% (Lebensmittel, Bücher)\n• Sondersatz Beherbergung: 3.8%\n\nMöchten Sie einen Beratungstermin vereinbaren?',
        suggestedActions: ['termin_buchen', 'mehr_info'],
        confidence: 0.85,
      };
    }

    // Termin/appointment questions
    if (lowerMessage.includes('termin') || lowerMessage.includes('beratung')) {
      return {
        response: 'Gerne helfe ich Ihnen bei der Terminbuchung. Wir bieten folgende Optionen:\n\n• Erstberatung (30 Min, kostenlos)\n• Steuerberatung (60 Min)\n• MWST-Beratung (45 Min)\n• Jahresabschluss-Besprechung (90 Min)\n\nWelche Option interessiert Sie?',
        suggestedActions: ['erstberatung', 'steuerberatung', 'mwst_beratung'],
        confidence: 0.9,
      };
    }

    // Steuern/tax questions
    if (lowerMessage.includes('steuer') || lowerMessage.includes('steuererklärung')) {
      return {
        response: 'Bei Steuerfragen helfen wir Ihnen gerne. Unsere Dienstleistungen umfassen:\n\n• Steuererklärung für Privatpersonen\n• Steuererklärung für Unternehmen\n• Steueroptimierung\n• Steuerplanung\n\nDie Frist für die Steuererklärung im Kanton Zürich ist der 31. März. Eine Verlängerung bis 30. September ist möglich.',
        suggestedActions: ['termin_buchen', 'mehr_info'],
        confidence: 0.85,
      };
    }

    // Buchhaltung questions
    if (lowerMessage.includes('buchhaltung') || lowerMessage.includes('jahresabschluss')) {
      return {
        response: 'Unsere Buchhaltungsdienstleistungen:\n\n• Laufende Buchhaltung\n• Jahresabschluss nach OR/Swiss GAAP FER\n• Lohnbuchhaltung\n• Debitoren-/Kreditorenbuchhaltung\n\nMöchten Sie mehr erfahren oder einen Beratungstermin vereinbaren?',
        suggestedActions: ['termin_buchen', 'preise'],
        confidence: 0.85,
      };
    }

    // Default Treuhand response
    return {
      response: 'Grüezi! Ich bin Ihr Treuhand-Assistent. Ich kann Ihnen bei folgenden Themen helfen:\n\n• MWST und Mehrwertsteuer\n• Buchhaltung und Jahresabschluss\n• Steuererklärung und Steuerberatung\n• Terminbuchung\n\nWie kann ich Ihnen behilflich sein?',
      suggestedActions: ['mwst', 'buchhaltung', 'steuern', 'termin'],
      confidence: 0.7,
    };
  }

  // Gesundheit/Praxis-specific fallback responses
  if (skillName === 'gesundheit-agent') {
    // Termin questions
    if (lowerMessage.includes('termin') || lowerMessage.includes('buchen') || lowerMessage.includes('anmelden')) {
      return {
        response: 'Gerne helfe ich Ihnen bei der Terminbuchung.\n\n📅 Verfügbare Termine diese Woche:\n• Montag 14:00, 15:30\n• Dienstag 09:00, 11:00\n• Mittwoch 10:00, 14:30\n\nWelcher Termin passt Ihnen am besten?',
        suggestedActions: ['montag', 'dienstag', 'mittwoch'],
        confidence: 0.9,
      };
    }

    // Öffnungszeiten
    if (lowerMessage.includes('öffnungszeit') || lowerMessage.includes('offen') || lowerMessage.includes('geöffnet')) {
      return {
        response: 'Unsere Öffnungszeiten:\n\n🕐 Montag - Freitag: 08:00 - 18:00\n🕐 Samstag: 09:00 - 12:00\n🚫 Sonntag: Geschlossen\n\nFür Notfälle ausserhalb der Öffnungszeiten: 0800 123 456',
        suggestedActions: ['termin_buchen', 'notfall'],
        confidence: 0.95,
      };
    }

    // Notfall
    if (lowerMessage.includes('notfall') || lowerMessage.includes('dringend') || lowerMessage.includes('schmerz')) {
      return {
        response: '🚨 Bei einem medizinischen Notfall:\n\n• Notfall-Hotline: 144\n• Unsere Notfall-Nummer: 0800 123 456\n• Nächste Notaufnahme: Universitätsspital\n\nBitte schildern Sie kurz Ihre Symptome, damit wir Sie optimal beraten können.',
        suggestedActions: ['anrufen', 'symptome_beschreiben'],
        confidence: 0.95,
      };
    }

    // Default Gesundheit response
    return {
      response: 'Grüezi! Willkommen in unserer Praxis. Ich kann Ihnen helfen bei:\n\n• 📅 Terminbuchung\n• 🕐 Öffnungszeiten\n• 🚨 Notfall-Informationen\n• ❓ Allgemeine Fragen\n\nWie kann ich Ihnen behilflich sein?',
      suggestedActions: ['termin', 'öffnungszeiten', 'notfall'],
      confidence: 0.7,
    };
  }

  // Gastro/Restaurant-specific fallback responses
  if (skillName === 'gastro-agent') {
    // Reservation
    if (lowerMessage.includes('reserv') || lowerMessage.includes('tisch') || lowerMessage.includes('buchen')) {
      return {
        response: 'Gerne nehme ich Ihre Tischreservierung entgegen.\n\n🍽️ Bitte teilen Sie mir mit:\n• Datum und Uhrzeit\n• Anzahl Personen\n• Besondere Wünsche (Terrasse, etc.)\n\nWir haben heute noch freie Tische um 18:00, 19:30 und 21:00 Uhr.',
        suggestedActions: ['18_uhr', '19_30_uhr', '21_uhr'],
        confidence: 0.9,
      };
    }

    // Speisekarte/Menu
    if (lowerMessage.includes('speisekarte') || lowerMessage.includes('menu') || lowerMessage.includes('essen') || lowerMessage.includes('gericht')) {
      return {
        response: '🍽️ Unsere Empfehlungen heute:\n\n**Vorspeisen**\n• Tagessuppe CHF 8.50\n• Gemischter Salat CHF 12.00\n\n**Hauptgerichte**\n• Zürcher Geschnetzeltes CHF 32.00\n• Schweizer Rösti CHF 18.00\n• Tagesfisch CHF 28.00\n\nMöchten Sie einen Tisch reservieren?',
        suggestedActions: ['reservieren', 'desserts', 'getränke'],
        confidence: 0.9,
      };
    }

    // Öffnungszeiten
    if (lowerMessage.includes('öffnungszeit') || lowerMessage.includes('offen') || lowerMessage.includes('geöffnet')) {
      return {
        response: '🕐 Unsere Öffnungszeiten:\n\n• Dienstag - Samstag: 11:30 - 14:00, 18:00 - 23:00\n• Sonntag: 11:30 - 15:00 (Brunch)\n• Montag: Ruhetag\n\n📍 Bahnhofstrasse 42, 8001 Zürich',
        suggestedActions: ['reservieren', 'anfahrt'],
        confidence: 0.95,
      };
    }

    // Default Gastro response
    return {
      response: 'Grüezi und herzlich willkommen! 🍽️\n\nIch bin der Restaurant-Assistent. Wie kann ich Ihnen helfen?\n\n• 📅 Tisch reservieren\n• 📋 Speisekarte ansehen\n• 🕐 Öffnungszeiten\n• 📍 Anfahrt & Kontakt',
      suggestedActions: ['reservieren', 'speisekarte', 'öffnungszeiten'],
      confidence: 0.7,
    };
  }

  // Generic fallback for unknown agents
  return {
    response: 'Vielen Dank für Ihre Nachricht. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden. Kann ich Ihnen sonst noch behilflich sein?',
    suggestedActions: ['kontakt', 'mehr_info'],
    confidence: 0.5,
  };
}

/**
 * GET /api/chat
 * Health check endpoint
 */
export async function GET() {
  // Check OpenClaw connectivity
  let openclawStatus = 'unknown';
  
  try {
    const healthCheck = await fetch(`${OPENCLAW_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    openclawStatus = healthCheck.ok ? 'connected' : 'error';
  } catch {
    openclawStatus = 'disconnected';
  }

  return NextResponse.json({
    success: true,
    status: 'healthy',
    openclaw: {
      url: OPENCLAW_URL,
      status: openclawStatus,
    },
    timestamp: new Date().toISOString(),
  });
}
