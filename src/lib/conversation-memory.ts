export interface ConversationContext {
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  topic?: string;
  intent?: "info" | "appointment" | "complaint" | "purchase" | "emergency";
  sentiment?: "positive" | "neutral" | "negative";
  extractedData: Record<string, string>;
  previousMessages: { role: string; content: string }[];
}

export function buildContextPrompt(context: ConversationContext): string {
  let prompt = "\n\n--- GESPRÄCHSKONTEXT ---\n";
  if (context.visitorName) {
    prompt += `Kundenname: ${context.visitorName}\n`;
  }
  if (context.visitorPhone) {
    prompt += `Telefon: ${context.visitorPhone}\n`;
  }
  if (context.visitorEmail) {
    prompt += `Email: ${context.visitorEmail}\n`;
  }
  if (context.topic) {
    prompt += `Thema: ${context.topic}\n`;
  }
  if (context.intent) {
    prompt += `Absicht: ${context.intent}\n`;
  }
  if (context.sentiment) {
    prompt += `Stimmung: ${context.sentiment}\n`;
  }
  if (context.previousMessages.length > 0) {
    prompt += "Vorherige Nachrichtenauszüge:\n";
    context.previousMessages.slice(-3).forEach((msg) => {
      prompt += `- ${msg.role}: ${msg.content}\n`;
    });
  }
  if (Object.keys(context.extractedData).length > 0) {
    prompt += `Erfasste Daten: ${JSON.stringify(context.extractedData)}\n`;
  }
  prompt += "\nBerücksichtige diese Informationen in deiner Antwort.";
  return prompt;
}

export function extractInfo(message: string): Partial<ConversationContext> {
  const extracted: Partial<ConversationContext> = { extractedData: {}, previousMessages: [] };

  const phoneMatch = message.match(/(\+41|0)\s?(\d{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})/);
  if (phoneMatch) {
    extracted.visitorPhone = phoneMatch[0].replace(/\s/g, "");
    extracted.extractedData!._phone = extracted.visitorPhone;
  }

  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    extracted.visitorEmail = emailMatch[0];
    extracted.extractedData!._email = extracted.visitorEmail;
  }

  const nameMatch = message.match(/(?:ich bin|mein name ist|ich heisse)\s+([A-ZÄÖÜa-zäöü]+(?:\s+[A-ZÄÖÜa-zäöü]+)?)/i);
  if (nameMatch) {
    extracted.visitorName = nameMatch[1];
    extracted.extractedData!._name = extracted.visitorName;
  }

  if (message.match(/notfall|dringend|sofort|eilig/i)) {
    extracted.intent = "emergency";
  } else if (message.match(/termin|buchen|reserv/i)) {
    extracted.intent = "appointment";
  } else if (message.match(/beschwer|problem|reklamation|unzufrieden/i)) {
    extracted.intent = "complaint";
  } else if (message.match(/kaufen|bestellen|preis|kosten|angebot/i)) {
    extracted.intent = "purchase";
  } else {
    extracted.intent = "info";
  }

  if (message.match(/danke|super|toll|perfekt|freundlich|hilfsbereit/i)) {
    extracted.sentiment = "positive";
  } else if (message.match(/schlecht|ärger|wütend|enttäuscht|unverschämt/i)) {
    extracted.sentiment = "negative";
  } else {
    extracted.sentiment = "neutral";
  }

  return extracted;
}
