"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Bell,
  Workflow,
  LineChart,
  Database,
  Mic,
  Target,
  BrainCircuit,
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  Bot,
  Sparkles,
} from "lucide-react";

const capabilities = [
  {
    id: "proactive",
    icon: Bell,
    color: "#ff3b30",
    gradient: "from-[#ff3b30] to-[#ff6b5e]",
    title: "Proaktive Agents",
    subtitle: "Handeln statt warten",
    description: "Traditionelle Chatbots warten passiv auf Kundenanfragen. Unsere proaktiven Agents erkennen Chancen und handeln selbstständig – bevor der Kunde überhaupt fragt.",
    benefits: [
      "MWST-Fristen automatisch erinnern",
      "Offene Rechnungen proaktiv mahnen",
      "Follow-ups nach Beratungen versenden",
      "Kunden vor Ablauffristen warnen",
    ],
    useCases: [
      {
        industry: "Treuhand",
        scenario: "Agent scannt Bexio täglich und erinnert Mandanten 5 Tage vor MWST-Frist automatisch.",
      },
      {
        industry: "Handwerk",
        scenario: "Agent sendet nach Projektabschluss automatisch Zufriedenheitsumfrage und bittet um Google-Bewertung.",
      },
      {
        industry: "Gastronomie",
        scenario: "Agent informiert Stammkunden proaktiv über Tagesmenü und freie Tische.",
      },
    ],
    stats: { value: "40%", label: "weniger verpasste Termine" },
  },
  {
    id: "multi-agent",
    icon: Workflow,
    color: "#007aff",
    gradient: "from-[#007aff] to-[#5ac8fa]",
    title: "Multi-Agent System",
    subtitle: "Koordinierte Intelligenz",
    description: "Ein einzelner Agent kann viel. Aber mehrere spezialisierte Agents, die koordiniert zusammenarbeiten? Das ist wie ein perfekt eingespieltes Team – jeder mit seiner Expertise.",
    benefits: [
      "Spezialisierte Agents für jede Aufgabe",
      "Automatische Koordination und Übergabe",
      "Parallele Verarbeitung komplexer Anfragen",
      "Skaliert mit Ihrem Unternehmen",
    ],
    useCases: [
      {
        industry: "Bauunternehmen",
        scenario: "Kunden-Agent nimmt Anfrage auf → Projekt-Agent prüft Kapazitäten → Material-Agent kalkuliert → Coordinator erstellt Offerte.",
      },
      {
        industry: "Klinik",
        scenario: "Empfangs-Agent begrüsst → Termin-Agent prüft Verfügbarkeit → Versicherungs-Agent klärt Deckung.",
      },
    ],
    stats: { value: "5x", label: "schnellere Bearbeitung" },
  },
  {
    id: "predictive",
    icon: LineChart,
    color: "#34c759",
    gradient: "from-[#34c759] to-[#30d158]",
    title: "Predictive Intelligence",
    subtitle: "Die Zukunft vorhersagen",
    description: "Unsere Agents analysieren historische Daten und erkennen Muster. Sie wissen, was morgen passiert – und bereiten Ihr Unternehmen heute schon darauf vor.",
    benefits: [
      "Kundenaufkommen vorhersagen",
      "Optimale Lagerbestände empfehlen",
      "Upselling-Chancen identifizieren",
      "Churn-Risiken frühzeitig erkennen",
    ],
    useCases: [
      {
        industry: "Restaurant",
        scenario: "Agent erkennt: Samstag + FC Zürich Spiel + gutes Wetter = +40% Gäste. Empfiehlt 2 Extra-Kellner.",
      },
      {
        industry: "Elektriker",
        scenario: "Agent analysiert saisonale Trends und empfiehlt Lagerbestand für Heizungs-Saison aufzustocken.",
      },
    ],
    stats: { value: "25%", label: "Umsatzsteigerung" },
  },
  {
    id: "memory",
    icon: Database,
    color: "#af52de",
    gradient: "from-[#af52de] to-[#bf5af2]",
    title: "Kontext-Gedächtnis",
    subtitle: "Kennt jeden Kunden",
    description: "Jede Interaktion wird gespeichert und verstanden. Der Agent erinnert sich an Präferenzen, frühere Anfragen und persönliche Details – wie Ihr bester Mitarbeiter.",
    benefits: [
      "Erkennt wiederkehrende Kunden sofort",
      "Merkt sich Präferenzen und Historie",
      "Personalisiert jede Antwort",
      "Baut echte Kundenbeziehungen auf",
    ],
    useCases: [
      {
        industry: "Alle Branchen",
        scenario: "Kunde kommt nach 3 Monaten zurück. Agent: 'Grüezi Herr Müller! Wie läuft das Fenster-Projekt? Übrigens: 10% Stammkunden-Rabatt auf Türen.'",
      },
    ],
    stats: { value: "60%", label: "höhere Kundenzufriedenheit" },
  },
  {
    id: "multimodal",
    icon: Mic,
    color: "#ff9500",
    gradient: "from-[#ff9500] to-[#ffcc00]",
    title: "Multimodal",
    subtitle: "Text, Sprache & Bilder",
    description: "Kunden kommunizieren nicht nur mit Text. Sie sprechen, senden Fotos, teilen Dokumente. Unsere Agents verstehen alle Modalitäten – wie ein echter Mensch.",
    benefits: [
      "Sprachnachrichten verstehen (WhatsApp)",
      "Bilder analysieren und interpretieren",
      "Dokumente und PDFs verarbeiten",
      "Mehrsprachig: DE, FR, IT, EN",
    ],
    useCases: [
      {
        industry: "Elektriker",
        scenario: "Kunde schickt Foto von defektem Sicherungskasten. Agent: 'Das sieht nach einem durchgebrannten FI aus. Techniker morgen um 14:00? Kosten ca. CHF 180.'",
      },
      {
        industry: "Versicherung",
        scenario: "Kunde sendet Schadensfotos per WhatsApp. Agent analysiert, schätzt Schaden, leitet Claim-Prozess ein.",
      },
    ],
    stats: { value: "3x", label: "schnellere Problemlösung" },
  },
  {
    id: "autonomous",
    icon: Target,
    color: "#ff3b30",
    gradient: "from-[#ff3b30] to-[#ff9500]",
    title: "Autonome Workflows",
    subtitle: "Vom Gespräch zur Aktion",
    description: "Informieren ist gut. Handeln ist besser. Unsere Agents führen Aktionen selbstständig aus – Termine buchen, Offerten erstellen, Bestellungen aufnehmen.",
    benefits: [
      "Termine direkt in Kalender eintragen",
      "Offerten in Bexio/Abacus erstellen",
      "Bestellungen im System erfassen",
      "E-Mails und Bestätigungen versenden",
    ],
    useCases: [
      {
        industry: "Zahnarztpraxis",
        scenario: "Patient will Termin → Agent prüft Kalender → Bucht Slot → Sendet Bestätigung → Trägt in Praxis-Software ein. Alles automatisch.",
      },
      {
        industry: "Treuhand",
        scenario: "Mandant braucht Steuerauszug → Agent generiert PDF aus System → Sendet per E-Mail → Loggt Aktivität.",
      },
    ],
    stats: { value: "80%", label: "weniger manuelle Arbeit" },
  },
];

const integrations = [
  { name: "Bexio", icon: "📊" },
  { name: "Abacus", icon: "💼" },
  { name: "KLARA", icon: "📋" },
  { name: "Microsoft 365", icon: "📧" },
  { name: "Google Workspace", icon: "🔷" },
  { name: "WhatsApp", icon: "💬" },
  { name: "Calendly", icon: "📅" },
  { name: "Stripe", icon: "💳" },
];

export default function CapabilitiesPage() {
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
            <source src="/videos/dashboardarkaplan.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/50 via-[#05050a]/40 to-[#05050a]/80" />
        </div>

        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff6b5e] text-sm font-medium mb-6">
              <BrainCircuit className="w-4 h-4" />
              Next-Generation AI
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-display)]">
              Fähigkeiten, die Ihre
              <br />
              <span className="bg-gradient-to-r from-[#ff3b30] via-[#ff6b5e] to-[#ff9500] bg-clip-text text-transparent">
                Konkurrenz nicht hat
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              Während andere noch Chatbots nutzen, revolutionieren Sie mit autonomen, 
              proaktiven und intelligenten Agents Ihr gesamtes Kundenerlebnis.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/marketplace">
                  Agent finden
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="secondary" asChild>
                <Link href="/demo">
                  Live Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 relative border-y border-white/[0.06]">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Clock, value: "24/7", label: "Immer aktiv" },
              { icon: Zap, value: "< 1s", label: "Antwortzeit" },
              { icon: Globe, value: "4+", label: "Sprachen" },
              { icon: Shield, value: "100%", label: "Swiss Hosted" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-display)]">
                  <stat.icon className="w-6 h-6 text-[#ff3b30]" />
                  {stat.value}
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Deep Dive */}
      <section className="py-20">
        <div className="container">
          <div className="space-y-32">
            {capabilities.map((cap, i) => (
              <div 
                key={cap.id} 
                id={cap.id}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 === 1 ? '' : ''}`}
              >
                {/* Content */}
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div 
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-6"
                    style={{ 
                      background: `${cap.color}15`,
                      border: `1px solid ${cap.color}30`
                    }}
                  >
                    <cap.icon className="w-5 h-5" style={{ color: cap.color }} />
                    <span className="font-medium" style={{ color: cap.color }}>{cap.subtitle}</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-display)]">
                    {cap.title}
                  </h2>
                  
                  <p className="text-lg text-white/50 mb-8 leading-relaxed">
                    {cap.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-4 mb-10">
                    {cap.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-center gap-4 text-white/70">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${cap.color}20` }}
                        >
                          <CheckCircle2 className="w-4 h-4" style={{ color: cap.color }} />
                        </div>
                        <span className="text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Stat */}
                  <div 
                    className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl"
                    style={{ 
                      background: `${cap.color}10`,
                      border: `1px solid ${cap.color}20`
                    }}
                  >
                    <TrendingUp className="w-8 h-8" style={{ color: cap.color }} />
                    <div>
                      <div className="text-3xl font-bold text-white font-[family-name:var(--font-display)]">
                        {cap.stats.value}
                      </div>
                      <div className="text-sm text-white/50">{cap.stats.label}</div>
                    </div>
                  </div>
                </div>

                {/* Visual - Use Cases */}
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <Card className="overflow-hidden" style={{ borderColor: `${cap.color}20` }}>
                    <div 
                      className="px-6 py-4 border-b border-white/[0.06]"
                      style={{ background: `linear-gradient(135deg, ${cap.color}10 0%, transparent 100%)` }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${cap.color}20` }}
                        >
                          <cap.icon className="w-5 h-5" style={{ color: cap.color }} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Praxisbeispiele</div>
                          <div className="text-sm text-white/50">So funktioniert es in der Realität</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {cap.useCases.map((useCase, j) => (
                        <div 
                          key={j} 
                          className="p-5 bg-[#0d0d14] rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span 
                              className="px-2.5 py-1 text-xs font-semibold rounded-full"
                              style={{ 
                                background: `${cap.color}20`,
                                color: cap.color
                              }}
                            >
                              {useCase.industry}
                            </span>
                          </div>
                          <p className="text-white/70 leading-relaxed">
                            {useCase.scenario}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 relative border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d14] to-transparent" />
        
        <div className="container relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-display)]">
              Nahtlose Integrationen
            </h2>
            <p className="text-white/50">
              Unsere Agents verbinden sich mit Ihren bestehenden Tools
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {integrations.map((integration, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-4 bg-[#12121c] rounded-xl border border-white/[0.08] hover:border-[#ff3b30]/30 transition-colors"
              >
                <span className="text-2xl">{integration.icon}</span>
                <span className="font-medium text-white">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-display)]">
              Der Unterschied macht&apos;s
            </h2>
            <p className="text-white/50">
              Warum unsere Agents anders sind als normale Chatbots
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Chatbot */}
              <Card className="border-white/[0.06]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white/40" />
                  </div>
                  <div>
                    <div className="font-semibold text-white/60">Traditioneller Chatbot</div>
                    <div className="text-sm text-white/30">Reaktiv & Limitiert</div>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Wartet auf Kundenanfragen",
                    "Vergisst nach jeder Session",
                    "Nur Text-basiert",
                    "Gibt nur Informationen",
                    "Arbeitet isoliert",
                    "Statische Antworten",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/40">
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <span className="text-xs">-</span>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Agentify Agent */}
              <Card premium className="border-[#ff3b30]/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff3b30]/20 to-[#ff9500]/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#ff3b30]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Agentify Agent</div>
                    <div className="text-sm text-[#ff3b30]">Proaktiv & Autonom</div>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Handelt proaktiv & selbstständig",
                    "Erinnert sich an jeden Kunden",
                    "Versteht Text, Sprache & Bilder",
                    "Führt echte Aktionen aus",
                    "Koordiniert mit anderen Agents",
                    "Lernt und verbessert sich",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <div className="w-5 h-5 rounded-full bg-[#34c759]/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#34c759]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff3b30] via-[#ff5840] to-[#ff9500]" />
        <div className="absolute inset-0 swiss-cross opacity-20" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-display)]">
              Bereit für die Zukunft?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
              Erleben Sie selbst, was unsere Agents können. 
              14 Tage kostenlos, keine Kreditkarte erforderlich.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                className="bg-white text-[#ff3b30] hover:bg-white/90 shadow-xl shadow-black/20"
                asChild
              >
                <Link href="/marketplace">
                  Jetzt Agent wählen
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/pricing">
                  Preise ansehen
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

