"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categories, agentTemplates } from "@/lib/data/agents";
import { formatPrice } from "@/lib/utils";
import { Send, Bot, Sparkles, Check, ArrowRight, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: string[];
  selected?: string;
}

interface AgentConfig {
  industry?: string;
  companyName?: string;
  useCases?: string[];
  languages?: string[];
  channels?: string[];
  integrations?: string[];
  suggestedTemplate?: string;
}

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content: "Grüezi! 👋 Ich bin Ihr Agent-Builder. Ich helfe Ihnen, den perfekten KI-Assistenten für Ihr Unternehmen zu erstellen.\n\nWas für ein Unternehmen haben Sie?",
  options: categories.slice(0, 6).map((c) => `${c.icon} ${c.name}`),
};

export function BuilderBot() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (response: Message) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    setMessages((prev) => [...prev, response]);
  };

  const handleOptionSelect = async (option: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: option,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Process based on current step
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    let response: Message;

    switch (currentStep) {
      case 0: // Industry selected
        const selectedCategory = categories.find((c) => option.includes(c.name));
        setAgentConfig((prev) => ({ ...prev, industry: selectedCategory?.slug }));
        
        response = {
          id: Date.now().toString() + "r",
          role: "assistant",
          content: `Perfekt! ${option} - eine tolle Branche!\n\nWie heisst Ihr Unternehmen?`,
        };
        break;

      case 1: // Company name entered
        setAgentConfig((prev) => ({ ...prev, companyName: option }));
        
        response = {
          id: Date.now().toString() + "r",
          role: "assistant",
          content: `Willkommen, ${option}! 🎉\n\nWas soll Ihr Assistent hauptsächlich tun?`,
          options: [
            "Kundenanfragen beantworten",
            "Termine vereinbaren",
            "Offerten/Preise nennen",
            "Produkte/Leistungen erklären",
            "Notfälle weiterleiten",
          ],
        };
        break;

      case 2: // Use case selected
        setAgentConfig((prev) => ({
          ...prev,
          useCases: [...(prev.useCases || []), option],
        }));
        
        response = {
          id: Date.now().toString() + "r",
          role: "assistant",
          content: "Verstanden! Welche Sprachen sprechen Ihre Kunden?",
          options: ["Nur Deutsch", "Deutsch + Englisch", "Deutsch + Französisch", "Alle Landessprachen"],
        };
        break;

      case 3: // Languages selected
        setAgentConfig((prev) => ({
          ...prev,
          languages: option === "Nur Deutsch" ? ["de"] : option.includes("Englisch") ? ["de", "en"] : ["de", "fr"],
        }));
        
        response = {
          id: Date.now().toString() + "r",
          role: "assistant",
          content: "Wo soll der Assistent erreichbar sein?",
          options: ["Nur Website", "Website + WhatsApp", "Website + WhatsApp + Email"],
        };
        break;

      case 4: // Channels selected
        setAgentConfig((prev) => ({
          ...prev,
          channels: option.includes("WhatsApp") ? ["website", "whatsapp"] : ["website"],
        }));

        // Find matching template
        const matchingTemplate = agentTemplates.find(
          (t) => t.categorySlug === agentConfig.industry
        );

        setAgentConfig((prev) => ({
          ...prev,
          suggestedTemplate: matchingTemplate?.id,
        }));
        
        response = {
          id: Date.now().toString() + "r",
          role: "assistant",
          content: `Ausgezeichnet! Basierend auf Ihren Angaben habe ich den perfekten Assistenten für Sie gefunden:\n\n**${matchingTemplate?.icon} ${matchingTemplate?.name}**\n\n${matchingTemplate?.description}\n\n✅ ${matchingTemplate?.features.slice(0, 3).join("\n✅ ")}\n\n💰 Preis: **${formatPrice(matchingTemplate?.priceMonthly || 299)}/Monat**`,
          options: ["Jetzt aktivieren", "Anpassen", "Andere Optionen zeigen"],
        };
        break;

      case 5: // Final action
        if (option === "Jetzt aktivieren") {
          response = {
            id: Date.now().toString() + "r",
            role: "assistant",
            content: "🎉 Perfekt! Ich leite Sie jetzt zur Registrierung weiter.\n\nNach der Anmeldung können Sie:\n\n✅ Ihren Assistenten personalisieren\n✅ Ihre Preise und FAQ eintragen\n✅ Den Widget-Code für Ihre Website erhalten\n\n[Klicken Sie hier, um fortzufahren →](/register)",
          };
        } else {
          response = {
            id: Date.now().toString() + "r",
            role: "assistant",
            content: "Kein Problem! Besuchen Sie unseren Marketplace, um alle verfügbaren Assistenten zu sehen.\n\n[Zum Marketplace →](/marketplace)",
          };
        }
        break;

      default:
        response = {
          id: Date.now().toString() + "r",
          role: "assistant",
          content: "Wie kann ich Ihnen weiter helfen?",
        };
    }

    await simulateTyping(response);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    handleOptionSelect(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Agent Builder</h3>
            <p className="text-white/70 text-sm">Erstellen Sie Ihren KI-Assistenten</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1 mt-4">
          {[0, 1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step <= currentStep ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] ${
                message.role === "user"
                  ? "bg-primary-500 text-white rounded-2xl rounded-tr-none px-4 py-3"
                  : "space-y-3"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="bg-neutral-100 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="text-neutral-800 whitespace-pre-wrap">
                      {message.content.split("\n").map((line, i) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={i} className="font-semibold">
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        if (line.startsWith("[") && line.includes("](/")) {
                          const match = line.match(/\[(.+)\]\((.+)\)/);
                          if (match) {
                            return (
                              <a
                                key={i}
                                href={match[2]}
                                className="text-primary-500 hover:underline font-medium inline-flex items-center gap-1"
                              >
                                {match[1]}
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            );
                          }
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {message.role === "user" && <span>{message.content}</span>}

              {/* Options */}
              {message.role === "assistant" && message.options && (
                <div className="pl-11 flex flex-wrap gap-2">
                  {message.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isTyping}
                      className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div className="bg-neutral-100 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ihre Antwort eingeben..."
            className="input flex-1"
            disabled={isTyping}
          />
          <Button type="submit" disabled={!input.trim() || isTyping}>
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}


