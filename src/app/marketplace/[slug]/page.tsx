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

  const handleDemoSend = () => {
    if (!demoInput.trim()) return;
    const userMessage = demoInput;
    setDemoInput("");
    setDemoMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    setTimeout(() => {
      setDemoMessages((prev) => [...prev, { 
        role: "assistant", 
        content: `Vielen Dank für Ihre Anfrage! Ich helfe Ihnen gerne weiter.` 
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const startDemo = () => {
    setShowDemo(true);
    setDemoMessages([{
      role: "assistant",
      content: `Grüezi! Wie kann ich Ihnen helfen?`,
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
