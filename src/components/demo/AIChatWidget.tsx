"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, Send, User, Volume2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
};

const welcomeMessages: Record<string, string> = {
  treuhand:
    "Grüezi! Ich bin der KI-Assistent der Treuhand Muster AG. Wie kann ich bei Buchhaltung, Steuern oder Lohnwesen helfen?",
  handwerk:
    "Grüezi! Ich bin der digitale Assistent von Elektro Brunner. Haben Sie einen Notfall oder möchten Sie einen Termin vereinbaren?",
  gastronomie:
    "Grüezi und willkommen! Ich bin der Assistent vom Restaurant Sonnenberg. Möchten Sie einen Tisch reservieren oder unsere Speisekarte sehen?",
  gesundheit:
    "Grüezi! Ich bin der Praxis-Assistent von Dr. med. Keller. Wie kann ich helfen? Terminbuchung, Rezept oder allgemeine Fragen?",
  immobilien:
    "Grüezi! Ich bin der KI-Assistent von Immo Swiss AG. Suchen Sie eine Wohnung, ein Haus oder eine Besichtigung?",
  rechtsberatung:
    "Grüezi! Ich bin der digitale Assistent der Kanzlei Weber & Partner. Wie kann ich rechtlich weiterhelfen?",
};

const quickSectors: Record<string, string[]> = {
  treuhand: ["MWST ausrechnen", "Lohnabrechnung", "Fristen"],
  handwerk: ["Störungsdienst", "Rechnung erstellen", "Material bestellen"],
  gastronomie: ["Tisch reservieren", "Mittagsmenu", "Öffnungszeiten"],
  gesundheit: ["Termin buchen", "Hausarzt kontaktieren", "Notfälle"],
  immobilien: ["Wohnung finden", "Besichtigung", "Finanzierung"],
  rechtsberatung: ["Vertrag prüfen", "Erstberatung", "Fristen"],
};

const sampleResponses: Record<string, string> = {
  "MWST ausrechnen": "Die aktuelle MWST beträgt 7.7 %; für Restaurantbons gibt es spezielle Regeln, ich zeige Ihnen gern ein Template.",
  "Lohnabrechnung": "Ich kann Ihnen die benötigten Belege zusammenstellen und die nächsten Auszahlungstermine berechnen.",
  "Fristen": "Ich erinnere Sie an die nächste MWST-Periode sowie an Steuer- und Sozialversicherungs-Fristen.",
  "Störungsdienst": "Unsere Techniker sind innerhalb von 60 Minuten bei Ihnen und halten Sie über den Status informiert.",
  "Rechnung erstellen": "Ich generiere eine Rechnungsvorlage mit Logo, Leistung und Zahlungsbedingungen. Export als PDF?",
  "Material bestellen": "Ich kann Ihren Einkauf mit Lieferanten abgleichen und automatisch bestellen lassen.",
  "Tisch reservieren": "Ich reserviere einen Tisch für Sie und bestätige sofort per SMS oder E-Mail.",
  "Mittagsmenu": "Heute auf der Karte: Kürbisrisotto, Alpen-Lachs und Veggie-Burger.",
  "Öffnungszeiten": "Montag bis Samstag 07:00–23:00, Sonntag 09:00–20:00. Ich merke mir Ihren Lieblingsplatz.",
  "Termin buchen": "Ich finde die frühesten freien Slots und bestätige die Reservierung mit Kalenderanfrage.",
  "Hausarzt kontaktieren": "Ich leite Ihre Nachricht an Dr. Keller weiter und organisiere den nächsten Termin.",
  "Notfälle": "Im Notfall sende ich Ihnen direkt die Telefonnummer des ärztlichen Bereitschaftsdienstes.",
  "Wohnung finden": "Ich filtere passende Objekte nach Budget, Lage und Besichtigungstermin.",
  "Besichtigung": "Ich schaue Verfügbarkeiten durch und schlage Ihnen drei Slots vor.",
  "Finanzierung": "Ich vergleiche Kreditangebote und berechne die monatlichen Raten für Sie.",
  "Vertrag prüfen": "Ich analysiere Vertragsklauseln, markiere Risiken und gebe Handlungsempfehlungen.",
  "Erstberatung": "Ich reserviere Ihnen einen Termin bei einem Experten und fasse Ihre Fragen zusammen.",
};

export default function AIChatWidget({ sector }: { sector: string }) {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const baseGreeting = useMemo(() => {
    const greeting = welcomeMessages[sector] ?? "Grüezi! Ich bin Ihr digitaler Assistent für KMU.";
    return [
      {
        id: `welcome-${sector}`,
        role: "assistant" as const,
        content: greeting,
        timestamp: new Date(),
      },
    ];
  }, [sector]);

  const messages = useMemo(() => [...baseGreeting, ...conversation], [baseGreeting, conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickWords = quickSectors[sector] || quickSectors.treuhand;

  const enqueueResponse = (prompt: string) => {
    setIsTyping(true);
    const response = sampleResponses[prompt] ?? "Das kann ich für Sie erledigen, ich bereite gleich alle Infos auf.";
    setTimeout(() => {
      setConversation((prev) => [
        ...prev,
        { id: `${prompt}-${Date.now()}`, role: "assistant", content: response, timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 1400);
  };

  const sendMessage = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput("");
    setConversation((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: message, timestamp: new Date() },
    ]);
    enqueueResponse(message);
  };

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#05050a] border border-white/10 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.65)] overflow-hidden"
    >
      <div className="bg-gradient-to-r from-[#ff6b53] via-[#ff3b30] to-[#c11b21] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/90">Live Demo</p>
            <h3 className="text-white text-2xl font-semibold">AI-Assistenz<span className="text-white/50"> • {sector || "KMU"}</span></h3>
          </div>
          <button className="bg-white/20 text-white rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em]">
            Online
          </button>
        </div>
      </div>
      <div className="p-5 space-y-4" style={{ minHeight: 460 }}>
        <div className="max-h-[250px] overflow-y-auto space-y-3" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-white/20" : "bg-white/10"}`}>
                  {message.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl leading-relaxed text-sm ${
                    message.role === "user"
                      ? "bg-white/10 text-white"
                      : "bg-white/5 text-white/90 border border-white/10"
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs font-semibold text-white/70">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex flex-wrap gap-2">
          {quickWords.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60 hover:text-white/80"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 bg-white/5 backdrop-blur-sm flex items-center gap-3">
        <button
          onClick={toggleListening}
          className={`rounded-2xl p-2 border border-white/10 bg-white/5 text-white transition ${
            isListening ? "shadow-[0_0_0_3px_rgba(255,255,255,0.6)]" : "hover:border-white/30"
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ihre Frage an die KI..."
          className="flex-1 bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
        />
        <button
          onClick={() => sendMessage()}
          className="rounded-2xl p-3 bg-gradient-to-r from-[#ff6b53] via-[#ff3b30] to-[#c11b21] text-white shadow-[0_15px_35px_rgba(255,59,48,0.35)]"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          className="rounded-2xl p-3 border border-white/10 bg-white/5 text-white"
          aria-label="Einstellungen"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
