"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAgentBySlug, getAgentsByCategory } from "@/lib/data/agents";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  Star,
  Users,
  Check,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Send,
  Bot,
  X,
  Globe,
  ChevronRight,
} from "lucide-react";

export default function AgentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const agent = getAgentBySlug(slug);
  
  const [showDemo, setShowDemo] = useState(false);
  const [demoMessages, setDemoMessages] = useState<{ role: string; content: string }[]>([]);
  const [demoInput, setDemoInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#05050a] flex flex-col">
        <Header />
        <div className="container pt-40 pb-20 text-center flex-1">
          <Bot className="w-16 h-16 text-white/20 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-3">Agent nicht gefunden</h1>
          <Link href="/marketplace">
            <Button>Zurück zum Marketplace</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedAgents = getAgentsByCategory(agent.categorySlug)
    .filter((a) => a.id !== agent.id)
    .slice(0, 2);

  // Agent-specific demo responses
  const getDemoResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Agent-specific responses based on category
    const responses: Record<string, Record<string, string>> = {
      treuhand: {
        mwst: "Die nächste MWST-Abrechnung ist am 30. des Monats fällig. Für die Quartalsabrechnung benötigen Sie: Rechnungen, Belege und Bankkontoauszüge. Soll ich Ihnen eine Checkliste zusenden?",
        steuer: "Für die Steuererklärung 2024 benötigen Sie: Lohnausweis, Zinsbelege, Versicherungsprämien, Spendenbescheinigungen. Die Frist im Kanton Zürich ist der 31. März.",
        termin: "Gerne vereinbare ich einen Beratungstermin. Wir haben diese Woche noch Termine am Mittwoch 14:00 oder Freitag 10:00 frei. Welcher passt Ihnen besser?",
        default: "Ich bin Ihr Treuhand-Assistent und helfe bei MWST-Fragen, Buchhaltung und Steuerthemen. Was möchten Sie wissen?",
      },
      zahnarzt: {
        schmerz: "Bei akuten Zahnschmerzen sollten Sie uns direkt anrufen unter 044 XXX XX XX. Wir haben heute noch einen Notfalltermin um 16:30 frei. Soll ich Sie eintragen?",
        termin: "Für eine Kontrolle haben wir folgende freie Termine: Montag 9:00, Mittwoch 14:00 oder Freitag 11:00. Welcher passt Ihnen?",
        kosten: "Eine professionelle Zahnreinigung kostet CHF 180-220. Eine Krone liegt bei CHF 1'200-1'800 je nach Material. Für einen genauen Kostenvoranschlag vereinbaren Sie am besten einen Termin.",
        default: "Willkommen in unserer Zahnarztpraxis! Ich kann Termine buchen, Kosten nennen oder bei Notfällen weiterhelfen. Wie kann ich Ihnen helfen?",
      },
      coiffeur: {
        termin: "Gerne! Für Schneiden und Föhnen haben wir heute um 15:00 oder morgen um 10:30 noch Plätze frei. Bei welcher Stylistin möchten Sie den Termin?",
        preis: "Unsere Preise: Damenschnitt CHF 75-95, Herrenschnitt CHF 45-55, Färben ab CHF 120, Balayage ab CHF 180. Kann ich einen Termin für Sie buchen?",
        farbe: "Für eine Farbberatung empfehle ich einen Termin bei unserer Coloristin Sarah. Sie berät Sie zu Balayage, Strähnchen oder Komplettfärbung. Wann passt es Ihnen?",
        default: "Willkommen im Salon! Ich helfe Ihnen bei Terminbuchungen, Preisauskünften und Styling-Beratung. Was darf es sein?",
      },
      restaurant: {
        reserv: "Gerne reserviere ich für Sie! Für wie viele Personen und wann möchten Sie kommen? Am Wochenende empfehle ich eine Reservierung mindestens 2 Tage im Voraus.",
        menu: "Unser Tagesmenü heute: Vorspeise - Kürbissuppe, Hauptgang - Zürcher Geschnetzeltes mit Rösti, Dessert - Vermicelles. CHF 42.- inkl. Kaffee.",
        allergie: "Wir bieten glutenfreie, laktosefreie und vegane Optionen. Bitte teilen Sie uns Ihre Allergien bei der Reservierung mit, damit die Küche vorbereitet ist.",
        default: "Grüezi und willkommen! Ich helfe bei Tischreservierungen, Menüfragen und Gruppenanfragen. Was darf ich für Sie tun?",
      },
      elektro: {
        notfall: "Bei einem Stromausfall oder Notfall erreichen Sie unseren Pikettdienst unter 079 XXX XX XX. Ist es ein akuter Notfall?",
        preis: "Richtpreise: Steckdose installieren CHF 150-200, Sicherungskasten CHF 800-1'500, Smart Home Beratung kostenlos. Für eine genaue Offerte brauche ich mehr Details.",
        smart: "Smart Home ist unser Spezialgebiet! Wir beraten zu Licht, Heizung, Storen und Sicherheit. Soll ich einen kostenlosen Beratungstermin vereinbaren?",
        default: "Grüezi! Ich bin der Assistent von Elektro Service. Ich helfe bei Preisanfragen, Terminvereinbarungen und Notfällen. Wie kann ich helfen?",
      },
    };

    // Find matching category responses
    const categoryKey = agent?.categorySlug || "";
    const categoryResponses = responses[categoryKey] || responses[agent?.id || ""] || {};
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(categoryResponses)) {
      if (keyword !== "default" && lowerMsg.includes(keyword)) {
        return response;
      }
    }
    
    // Check common keywords across all agents
    if (lowerMsg.includes("termin") || lowerMsg.includes("buchen")) {
      return categoryResponses.termin || "Gerne vereinbare ich einen Termin für Sie. Wann würde es Ihnen passen?";
    }
    if (lowerMsg.includes("preis") || lowerMsg.includes("kosten") || lowerMsg.includes("was kostet")) {
      return categoryResponses.preis || categoryResponses.kosten || "Für eine genaue Preisauskunft benötige ich mehr Details. Was genau benötigen Sie?";
    }
    if (lowerMsg.includes("notfall") || lowerMsg.includes("dringend") || lowerMsg.includes("sofort")) {
      return categoryResponses.notfall || "Bei Notfällen erreichen Sie uns telefonisch. Ich leite Ihre Anfrage sofort weiter.";
    }
    
    return categoryResponses.default || `Vielen Dank für Ihre Anfrage! Ich bin der ${agent?.name} und helfe Ihnen gerne weiter. Können Sie mir mehr Details geben?`;
  };

  const handleDemoSend = () => {
    if (!demoInput.trim()) return;
    const userMessage = demoInput;
    setDemoInput("");
    setDemoMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = getDemoResponse(userMessage);
      setDemoMessages((prev) => [...prev, { 
        role: "assistant", 
        content: response
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const startDemo = () => {
    setShowDemo(true);
    // Agent-specific welcome messages
    const welcomeMessages: Record<string, string> = {
      treuhand: "Grüezi! Ich bin der Treuhand-Assistent. Ich helfe Ihnen bei Fragen zu MWST, Steuern und Buchhaltung. Wie kann ich Ihnen helfen?",
      zahnarzt: "Grüezi! Willkommen in unserer Zahnarztpraxis. Ich kann Termine buchen, Kosten nennen oder bei Zahnschmerzen weiterhelfen. Was darf es sein?",
      coiffeur: "Grüezi! Willkommen im Salon. Ich helfe bei Terminbuchungen und Preisauskünften. Für welche Behandlung interessieren Sie sich?",
      restaurant: "Grüezi! Willkommen in unserem Restaurant. Möchten Sie einen Tisch reservieren oder haben Sie Fragen zum Menü?",
      elektro: "Grüezi! Ich bin der Assistent von Elektro Service. Brauchen Sie einen Elektriker, haben Sie Fragen zu Smart Home oder ist es ein Notfall?",
    };
    
    const welcomeMsg = welcomeMessages[agent?.id || ""] || welcomeMessages[agent?.categorySlug || ""] || 
      `Grüezi! Ich bin der ${agent?.name}. Wie kann ich Ihnen helfen?`;
    
    setDemoMessages([{
      role: "assistant",
      content: welcomeMsg,
    }]);
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <section className="pt-28 pb-20 flex-1">
        <div className="container max-w-6xl">
          {/* Back Link */}
          <Link 
            href="/marketplace" 
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Marketplace
          </Link>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Header */}
              <div className="flex gap-6">
                {agent.image ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#12121c] shrink-0">
                    <Image src={agent.image} alt={agent.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#12121c] flex items-center justify-center text-4xl shrink-0">
                    {agent.icon}
                  </div>
                )}
                
                <div>
                  <p className="text-white/40 text-sm mb-1">{agent.category}</p>
                  <h1 className="text-3xl font-bold text-white mb-3">{agent.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#ffd60a] fill-[#ffd60a]" />
                      <span className="text-white">{agent.rating}</span>
                      <span className="text-white/40">({agent.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Users className="w-4 h-4" />
                      <span>{agent.userCount} Nutzer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/60 text-lg leading-relaxed">
                {agent.longDescription}
              </p>

              {/* Demo Button */}
              <button 
                onClick={startDemo}
                className="w-full p-6 bg-gradient-to-r from-[#ff3b30] to-[#ff6b5e] rounded-2xl flex items-center justify-between group"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Live Demo</h3>
                  <p className="text-white/70 text-sm">Agent jetzt testen</p>
                </div>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Features */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-6">Funktionen</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {agent.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-[#12121c] rounded-xl">
                      <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                      <span className="text-white/70 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              {agent.integrations.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Integrationen</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.integrations.map((integration, i) => (
                      <span key={i} className="px-4 py-2 bg-[#12121c] rounded-lg text-white/60 text-sm">
                        {integration}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Pricing Card */}
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-white mb-1">
                      {formatPrice(agent.priceMonthly)}
                      <span className="text-base font-normal text-white/40">/Mo.</span>
                    </div>
                    <p className="text-sm text-white/40">
                      oder {formatPrice(agent.priceYearly)}/Jahr
                    </p>
                  </div>

                  <Button size="lg" className="w-full mb-4">
                    <Zap className="w-4 h-4" />
                    Jetzt starten
                  </Button>

                  <p className="text-xs text-white/40 text-center mb-6">
                    14 Tage Geld-zurück-Garantie
                  </p>

                  <div className="space-y-3 pt-6 border-t border-white/[0.06]">
                    {[
                      { icon: Shield, text: "Swiss Hosting" },
                      { icon: Clock, text: "5 Min Setup" },
                      { icon: Globe, text: "Website + WhatsApp" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-white/50">
                        <item.icon className="w-4 h-4 text-white/30" />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Related Agents */}
                {relatedAgents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white/40 mb-3">Ähnliche Agents</h3>
                    <div className="space-y-2">
                      {relatedAgents.map((related) => (
                        <Link key={related.id} href={`/marketplace/${related.slug}`}>
                          <div className="flex items-center gap-3 p-3 bg-[#12121c] rounded-xl hover:bg-[#1a1a28] transition-colors">
                            <span className="text-2xl">{related.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{related.name}</p>
                              <p className="text-xs text-white/40">{formatPrice(related.priceMonthly)}/Mo.</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#12121c] rounded-2xl overflow-hidden border border-white/[0.08]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ff3b30] to-[#ff6b5e] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <div className="font-medium text-white text-sm">{agent.name}</div>
                  <div className="text-xs text-white/70">Demo</div>
                </div>
              </div>
              <button onClick={() => setShowDemo(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-5 space-y-3 bg-[#0d0d14]">
              {demoMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-[#ff3b30] text-white"
                      : "bg-[#1a1a28] text-white/80"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a28] px-4 py-2.5 rounded-xl flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            {agent.demoQuestions && agent.demoQuestions.length > 0 && demoMessages.length <= 2 && (
              <div className="px-4 py-3 bg-[#0d0d14] border-t border-white/[0.06]">
                <p className="text-xs text-white/40 mb-2">Probieren Sie:</p>
                <div className="flex flex-wrap gap-2">
                  {agent.demoQuestions.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDemoInput(q);
                        setTimeout(() => handleDemoSend(), 100);
                      }}
                      className="px-3 py-1.5 bg-[#1a1a28] hover:bg-[#252536] rounded-full text-xs text-white/60 hover:text-white transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-[#12121c] border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDemoSend()}
                  placeholder="Nachricht eingeben..."
                  className="flex-1 px-4 py-2.5 bg-[#0d0d14] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
                <Button size="sm" onClick={handleDemoSend} disabled={!demoInput.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
