"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Send,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Demo Agent Types
type DemoAgent = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  greeting: string;
  quickQuestions: string[];
};

const demoAgents: DemoAgent[] = [
  {
    id: "treuhand-agent",
    name: "Treuhand-Assistent",
    icon: "📊",
    color: "#dc2626",
    description: "Für Treuhandbüros: MWST, Steuern, Buchhaltung",
    greeting: "Grüezi! Ich bin der Treuhand-Assistent. Wie kann ich Ihnen bei Steuern, MWST oder Buchhaltung helfen?",
    quickQuestions: ["MWST-Sätze?", "Termin buchen", "Steuererklärung"],
  },
  {
    id: "gesundheit-agent",
    name: "Praxis-Assistent",
    icon: "🏥",
    color: "#10b981",
    description: "Für Arztpraxen: Termine, Öffnungszeiten, Notfall",
    greeting: "Grüezi! Ich bin der Praxis-Assistent. Wie kann ich Ihnen helfen? Terminbuchung, Öffnungszeiten oder allgemeine Fragen?",
    quickQuestions: ["Termin buchen", "Öffnungszeiten", "Notfall"],
  },
  {
    id: "gastro-agent",
    name: "Restaurant-Assistent",
    icon: "🍽️",
    color: "#8b5cf6",
    description: "Für Restaurants: Reservierung, Speisekarte",
    greeting: "Grüezi! Willkommen bei unserem Restaurant. Möchten Sie einen Tisch reservieren oder unsere Speisekarte sehen?",
    quickQuestions: ["Tisch reservieren", "Speisekarte", "Öffnungszeiten"],
  },
];

// Live Demo Chat Component
function LiveDemoChat({ agent, isActive }: { agent: DemoAgent; isActive: boolean }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: agent.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          message: userMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Entschuldigung, es gab einen Fehler." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Entschuldigung, der Service ist momentan nicht erreichbar." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-[#0a0a12] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: agent.color }}>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-2xl">{agent.icon}</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{agent.name}</h3>
          <p className="text-white/70 text-sm">Online • Live Demo</p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-white/20" : "bg-white/10"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "text-white rounded-tr-sm"
                  : "bg-white/5 text-white/90 border border-white/10 rounded-tl-sm"
              }`} style={msg.role === "user" ? { backgroundColor: agent.color } : {}}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="px-4 pb-3 flex gap-2 flex-wrap">
        {agent.quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => setInput(q)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:border-white/30 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nachricht eingeben..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 disabled:opacity-50 rounded-xl transition-colors"
          style={{ backgroundColor: agent.color }}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [activeAgent, setActiveAgent] = useState(demoAgents[0].id);

  return (
    <div className="min-h-screen bg-[#030308] flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#dc2626]" />
              <span className="text-white/70">Live Demo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Testen Sie unsere KI-Assistenten
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Wählen Sie einen Branchen-Assistenten und stellen Sie Ihre Fragen.
              Die Antworten kommen in Echtzeit von unserer KI.
            </p>
          </div>

          {/* Agent Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {demoAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
                  activeAgent === agent.id
                    ? "border-white/30 bg-white/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <span className="text-3xl">{agent.icon}</span>
                <div className="text-left">
                  <div className="text-white font-semibold">{agent.name}</div>
                  <div className="text-white/50 text-sm">{agent.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Chat */}
          <div className="max-w-2xl mx-auto">
            {demoAgents.map((agent) => (
              <LiveDemoChat
                key={agent.id}
                agent={agent}
                isActive={activeAgent === agent.id}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-white/50 mb-4">
              Gefällt Ihnen, was Sie sehen? Erstellen Sie Ihren eigenen Assistenten.
            </p>
            <Button size="lg" asChild className="bg-[#dc2626] hover:bg-[#b91c1c]">
              <Link href="/register">
                Kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
