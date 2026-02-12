"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  Check,
  X,
  Zap,
  ArrowRight,
  MessageSquare,
  Users,
  Shield,
  Bot,
  Bell,
  Workflow,
  LineChart,
  Database,
  Mic,
  Target,
  Sparkles,
  Star,
  HelpCircle,
} from "lucide-react";

const tiers = [
  {
    id: "basic",
    name: "Basic",
    description: "Für Einsteiger und kleine Unternehmen",
    priceMonthly: 249,
    priceYearly: 2490,
    popular: false,
    color: "#007aff",
    features: [
      { name: "Reaktiver Chatbot", included: true },
      { name: "24/7 verfügbar", included: true },
      { name: "5'000 Nachrichten/Monat", included: true },
      { name: "Website-Integration", included: true },
      { name: "Basis-Wissensdatenbank", included: true },
      { name: "E-Mail-Support", included: true },
      { name: "Proaktive Benachrichtigungen", included: false },
      { name: "Kontext-Gedächtnis", included: false },
      { name: "Autonome Aktionen", included: false },
      { name: "Multi-Agent System", included: false },
      { name: "Predictive Intelligence", included: false },
      { name: "Multimodal (Sprache/Bilder)", included: false },
    ],
    capabilities: ["Reaktiv", "FAQ"],
    cta: "Basic starten",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Für wachsende Unternehmen mit hohen Ansprüchen",
    priceMonthly: 449,
    priceYearly: 4490,
    popular: true,
    color: "#ff3b30",
    features: [
      { name: "Alles aus Basic", included: true },
      { name: "15'000 Nachrichten/Monat", included: true },
      { name: "WhatsApp-Integration", included: true },
      { name: "Proaktive Benachrichtigungen", included: true, highlight: true },
      { name: "Kontext-Gedächtnis", included: true, highlight: true },
      { name: "Autonome Aktionen", included: true, highlight: true },
      { name: "Bexio/Abacus Integration", included: true },
      { name: "Prioritäts-Support", included: true },
      { name: "Multi-Agent System", included: false },
      { name: "Predictive Intelligence", included: false },
      { name: "Multimodal (Sprache/Bilder)", included: false },
      { name: "Dedizierter Account Manager", included: false },
    ],
    capabilities: ["Proaktiv", "Autonom", "Memory"],
    cta: "Pro starten",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Für Unternehmen mit maximalen Anforderungen",
    priceMonthly: 899,
    priceYearly: 8990,
    popular: false,
    color: "#af52de",
    features: [
      { name: "Alles aus Pro", included: true },
      { name: "Unbegrenzte Nachrichten", included: true },
      { name: "Multi-Agent System", included: true, highlight: true },
      { name: "Predictive Intelligence", included: true, highlight: true },
      { name: "Multimodal (Sprache/Bilder)", included: true, highlight: true },
      { name: "Custom Integrationen", included: true },
      { name: "API-Zugang", included: true },
      { name: "Dedizierter Account Manager", included: true },
      { name: "SLA 99.9% Uptime", included: true },
      { name: "On-Premise Option", included: true },
      { name: "Custom Training", included: true },
      { name: "White-Label Option", included: true },
    ],
    capabilities: ["Multi-Agent", "Predictive", "Multimodal", "Enterprise"],
    cta: "Kontakt aufnehmen",
  },
];

const faqs = [
  {
    q: "Kann ich jederzeit upgraden oder downgraden?",
    a: "Ja, Sie können Ihr Abo jederzeit ändern. Beim Upgrade wird der Restbetrag angerechnet, beim Downgrade beginnt der neue Plan ab dem nächsten Abrechnungszeitraum.",
  },
  {
    q: "Was passiert, wenn ich mein Nachrichtenlimit erreiche?",
    a: "Sie erhalten eine Warnung bei 80% Auslastung. Bei Überschreitung können Sie zusätzliche Nachrichten kaufen oder auf den nächsten Plan upgraden.",
  },
  {
    q: "Gibt es eine Geld-zurück-Garantie?",
    a: "Ja, alle Pläne kommen mit einer 14-tägigen Geld-zurück-Garantie. Keine Fragen gestellt.",
  },
  {
    q: "Sind meine Daten sicher?",
    a: "Absolut. Alle Daten werden in der Schweiz gehostet und sind DSG-konform. Wir verwenden modernste Verschlüsselung.",
  },
  {
    q: "Kann ich mehrere Agents haben?",
    a: "Im Basic-Plan ist 1 Agent enthalten, im Pro-Plan 3 Agents, und im Enterprise-Plan unbegrenzt.",
  },
  {
    q: "Wie funktioniert die Bexio-Integration?",
    a: "Nach der Aktivierung verbinden Sie Ihren Bexio-Account mit wenigen Klicks. Der Agent kann dann Rechnungen erstellen, Kontakte verwalten und mehr.",
  },
];

const capabilityIcons: Record<string, React.ReactNode> = {
  "Reaktiv": <MessageSquare className="w-3.5 h-3.5" />,
  "FAQ": <HelpCircle className="w-3.5 h-3.5" />,
  "Proaktiv": <Bell className="w-3.5 h-3.5" />,
  "Autonom": <Target className="w-3.5 h-3.5" />,
  "Memory": <Database className="w-3.5 h-3.5" />,
  "Multi-Agent": <Workflow className="w-3.5 h-3.5" />,
  "Predictive": <LineChart className="w-3.5 h-3.5" />,
  "Multimodal": <Mic className="w-3.5 h-3.5" />,
  "Enterprise": <Shield className="w-3.5 h-3.5" />,
};

export default function PricingPage() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === 'enterprise') {
      router.push('/contact');
      return;
    }

    setLoadingPlan(planId);

    try {
      // Check if user is logged in
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to register with plan info
        router.push(`/register?plan=${planId}&cycle=${isYearly ? 'yearly' : 'monthly'}`);
        return;
      }

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          cycle: isYearly ? 'yearly' : 'monthly',
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Checkout error:', error);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ WebkitTransform: 'translateZ(0)' }}
          >
            <source src="/videos/swisstechshowcase.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/50 via-[#05050a]/40 to-[#05050a]/80" />
        </div>

        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff6b5e] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Transparente Preise
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-display)]">
              Wählen Sie Ihren
              <br />
              <span className="bg-gradient-to-r from-[#ff3b30] to-[#ff9500] bg-clip-text text-transparent">
                digitalen Mitarbeiter
              </span>
            </h1>
            <p className="text-lg text-white/50 mb-10">
              Von reaktiven Chatbots bis hin zu vollautonomen Multi-Agent-Systemen.
              <br />
              14 Tage Geld-zurück-Garantie auf alle Pläne.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 bg-[#12121c] rounded-full border border-white/[0.08]">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !isYearly
                    ? "bg-gradient-to-r from-[#ff3b30] to-[#ff6b5e] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Monatlich
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isYearly
                    ? "bg-gradient-to-r from-[#ff3b30] to-[#ff6b5e] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Jährlich
                <span className="px-2 py-0.5 bg-[#34c759]/20 text-[#34c759] text-xs font-semibold rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div key={tier.id} className="relative">
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#ff3b30] to-[#ff9500] text-white text-sm font-semibold rounded-full flex items-center gap-2 shadow-lg shadow-[#ff3b30]/30">
                    <Star className="w-4 h-4 fill-white" />
                    Beliebteste Wahl
                  </div>
                )}
                
                <Card 
                  premium={tier.popular} 
                  className={`h-full flex flex-col ${tier.popular ? 'pt-8' : ''}`}
                  style={{ borderColor: tier.popular ? `${tier.color}40` : undefined }}
                >
                  {/* Header */}
                  <div className="mb-8">
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
                      style={{ 
                        background: `${tier.color}15`,
                        border: `1px solid ${tier.color}30`,
                        color: tier.color
                      }}
                    >
                      <Bot className="w-4 h-4" />
                      {tier.name}
                    </div>
                    <p className="text-white/50 text-sm">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white font-[family-name:var(--font-display)]">
                        CHF {isYearly ? Math.round(tier.priceYearly / 12) : tier.priceMonthly}
                      </span>
                      <span className="text-white/40">/Monat</span>
                    </div>
                    {isYearly && (
                      <p className="text-sm text-white/40 mt-2">
                        CHF {tier.priceYearly}/Jahr (2 Monate gratis)
                      </p>
                    )}
                  </div>

                  {/* Capabilities Badges */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {tier.capabilities.map((cap) => (
                      <span 
                        key={cap}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          background: `${tier.color}10`,
                          border: `1px solid ${tier.color}25`,
                          color: tier.color
                        }}
                      >
                        {capabilityIcons[cap]}
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button 
                    size="lg" 
                    className="w-full mb-8"
                    variant={tier.popular ? "default" : "secondary"}
                    onClick={() => handleCheckout(tier.id)}
                    isLoading={loadingPlan === tier.id}
                    disabled={loadingPlan !== null}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* Features */}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/60 mb-4">Enthalten:</div>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li 
                          key={i} 
                          className={`flex items-center gap-3 text-sm ${
                            feature.included ? 'text-white/70' : 'text-white/30'
                          }`}
                        >
                          {feature.included ? (
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ 
                                background: feature.highlight ? `${tier.color}20` : 'rgba(52, 199, 89, 0.2)'
                              }}
                            >
                              <Check 
                                className="w-3 h-3" 
                                style={{ color: feature.highlight ? tier.color : '#34c759' }}
                              />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                              <X className="w-3 h-3 text-white/20" />
                            </div>
                          )}
                          <span className={feature.highlight ? 'font-medium text-white' : ''}>
                            {feature.name}
                          </span>
                          {feature.highlight && (
                            <span className="px-1.5 py-0.5 bg-[#ff3b30]/15 text-[#ff3b30] text-[10px] font-semibold rounded">
                              NEU
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#34c759]" />
              <span>Swiss Hosting</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ff9500]" />
              <span>5 Min Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#007aff]" />
              <span>200+ Schweizer KMU</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-display)]">
              Detaillierter Vergleich
            </h2>
            <p className="text-white/50">
              Alle Funktionen im Überblick
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 px-4 text-white/60 font-medium">Funktion</th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center py-4 px-4">
                      <span 
                        className="font-bold text-lg"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Nachrichten/Monat", values: ["5'000", "15'000", "Unbegrenzt"] },
                  { name: "Anzahl Agents", values: ["1", "3", "Unbegrenzt"] },
                  { name: "Website-Integration", values: [true, true, true] },
                  { name: "WhatsApp-Integration", values: [false, true, true] },
                  { name: "Proaktive Alerts", values: [false, true, true] },
                  { name: "Kontext-Gedächtnis", values: [false, true, true] },
                  { name: "Autonome Aktionen", values: [false, true, true] },
                  { name: "Multi-Agent System", values: [false, false, true] },
                  { name: "Predictive Intelligence", values: [false, false, true] },
                  { name: "Multimodal (Voice/Vision)", values: [false, false, true] },
                  { name: "Bexio/Abacus Integration", values: [false, true, true] },
                  { name: "API-Zugang", values: [false, false, true] },
                  { name: "SLA", values: ["Best Effort", "99%", "99.9%"] },
                  { name: "Support", values: ["E-Mail", "Priorität", "Dediziert"] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-4 px-4 text-white/70">{row.name}</td>
                    {row.values.map((value, j) => (
                      <td key={j} className="text-center py-4 px-4">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-[#34c759] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-white/20 mx-auto" />
                          )
                        ) : (
                          <span className="text-white/70">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d14] to-transparent" />
        
        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-display)]">
              Häufige Fragen
            </h2>
            <p className="text-white/50">
              Alles, was Sie wissen müssen
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid gap-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3 font-[family-name:var(--font-display)]">
                  {faq.q}
                </h3>
                <p className="text-white/60 leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff3b30] via-[#ff5840] to-[#ff9500]" />
        <div className="absolute inset-0 swiss-cross opacity-20" />
        
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-[family-name:var(--font-display)]">
              Noch unsicher?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Testen Sie jeden Plan 14 Tage kostenlos. Keine Kreditkarte erforderlich.
              Oder buchen Sie eine persönliche Demo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#ff3b30] hover:bg-white/90"
                asChild
              >
                <Link href="/register">
                  Kostenlos starten
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">
                  Demo buchen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
