"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  MessageSquare,
  Book,
  Mail,
  ChevronDown,
  ChevronUp,
  Zap,
  Settings,
  CreditCard,
  Shield,
  Users,
  Bot,
} from "lucide-react";

const faqCategories = [
  {
    id: "getting-started",
    title: "Erste Schritte",
    icon: Zap,
    questions: [
      {
        q: "Wie starte ich mit Agentify?",
        a: "Registrieren Sie sich kostenlos, wählen Sie einen KI-Assistenten aus unserem Marketplace und folgen Sie dem Einrichtungsassistenten. In weniger als 5 Minuten ist Ihr Agent einsatzbereit.",
      },
      {
        q: "Brauche ich technische Kenntnisse?",
        a: "Nein! Agentify ist für Nicht-Techniker konzipiert. Die Einrichtung erfolgt über eine intuitive Benutzeroberfläche ohne Programmierung.",
      },
      {
        q: "Kann ich Agentify kostenlos testen?",
        a: "Ja, Sie können jeden Agenten im Marketplace kostenlos testen. Für den vollen Funktionsumfang bieten wir eine 14-tägige Testphase.",
      },
    ],
  },
  {
    id: "agents",
    title: "KI-Assistenten",
    icon: Bot,
    questions: [
      {
        q: "Welche Branchen werden unterstützt?",
        a: "Wir bieten spezialisierte Agenten für über 20 Branchen: Treuhand, Zahnarztpraxen, Coiffeure, Restaurants, Handwerker, Immobilien und viele mehr.",
      },
      {
        q: "Kann ich meinen Agenten anpassen?",
        a: "Ja! Sie können Begrüssungstexte, Antwortverhalten, Öffnungszeiten und branchenspezifische Informationen individuell konfigurieren.",
      },
      {
        q: "Wie intelligent sind die Agenten?",
        a: "Unsere Agenten basieren auf GPT-4 und sind speziell für Schweizer KMU trainiert. Sie verstehen Schweizerdeutsch und kennen lokale Besonderheiten.",
      },
    ],
  },
  {
    id: "integration",
    title: "Integration",
    icon: Settings,
    questions: [
      {
        q: "Wie integriere ich den Agenten auf meiner Website?",
        a: "Kopieren Sie einfach den Widget-Code und fügen Sie ihn in Ihre Website ein. Der Agent erscheint als Chat-Button in der Ecke Ihrer Seite.",
      },
      {
        q: "Funktioniert Agentify mit meinem CRM?",
        a: "Ja, wir bieten Integrationen für gängige CRM-Systeme wie Bexio, Abacus und andere. Kontaktieren Sie uns für spezifische Anforderungen.",
      },
      {
        q: "Kann ich WhatsApp oder andere Kanäle nutzen?",
        a: "Im Business- und Enterprise-Plan können Sie Ihren Agenten auch über WhatsApp, Facebook Messenger und E-Mail erreichbar machen.",
      },
    ],
  },
  {
    id: "billing",
    title: "Preise & Abrechnung",
    icon: CreditCard,
    questions: [
      {
        q: "Wie funktioniert die Abrechnung?",
        a: "Die Abrechnung erfolgt monatlich oder jährlich (20% Rabatt). Sie können jederzeit upgraden oder downgraden.",
      },
      {
        q: "Gibt es eine Mindestlaufzeit?",
        a: "Nein! Sie können monatlich kündigen. Bei Jahreszahlung ist eine Kündigung zum Ende der Laufzeit möglich.",
      },
      {
        q: "Was passiert, wenn ich mein Nachrichtenlimit erreiche?",
        a: "Sie erhalten eine Benachrichtigung bei 80% und 100%. Danach können Sie zusätzliche Nachrichten kaufen oder upgraden.",
      },
    ],
  },
  {
    id: "security",
    title: "Sicherheit & Datenschutz",
    icon: Shield,
    questions: [
      {
        q: "Wo werden meine Daten gespeichert?",
        a: "Alle Daten werden ausschliesslich in der Schweiz gespeichert, auf Servern in Zürich. Wir sind vollständig DSG-konform.",
      },
      {
        q: "Ist Agentify DSGVO-konform?",
        a: "Ja, wir erfüllen sowohl das Schweizer DSG als auch die europäische DSGVO. Ihre Kundendaten sind sicher.",
      },
      {
        q: "Wer hat Zugriff auf meine Gespräche?",
        a: "Nur Sie und Ihre autorisierten Teammitglieder. Wir nutzen Ihre Daten nicht für Training und geben sie nicht an Dritte weiter.",
      },
    ],
  },
  {
    id: "team",
    title: "Team & Verwaltung",
    icon: Users,
    questions: [
      {
        q: "Wie viele Teammitglieder kann ich hinzufügen?",
        a: "Starter: 1 Benutzer, Business: 5 Benutzer, Enterprise: Unbegrenzt. Zusätzliche Benutzer können hinzugebucht werden.",
      },
      {
        q: "Kann ich verschiedene Rollen vergeben?",
        a: "Ja, im Business- und Enterprise-Plan können Sie Admin-, Manager- und Agent-Rollen mit unterschiedlichen Berechtigungen vergeben.",
      },
    ],
  },
];

export default function SupportPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeQuestions = faqCategories.find((c) => c.id === activeCategory)?.questions || [];

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <Header />

      <section className="pt-32 pb-20 flex-1 relative overflow-hidden bg-gradient-to-b from-[#05050a] to-[#05050a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,59,255,0.25),_transparent_55%)]" />
        <div className="container relative z-10 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#60a5fa] text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Support Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Wie können wir
              <br />
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                Ihnen helfen?
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Finden Sie Antworten auf häufige Fragen oder kontaktieren Sie unser Support-Team.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="p-6 hover:border-[#3b82f6]/30 transition-colors group cursor-pointer">
              <Link href="/contact" className="block">
                <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/20 transition-colors">
                  <MessageSquare className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Kontakt aufnehmen
                </h3>
                <p className="text-sm text-white/50">
                  Schreiben Sie uns direkt - wir antworten innerhalb von 24h.
                </p>
              </Link>
            </Card>

            <Card className="p-6 hover:border-[#8b5cf6]/30 transition-colors group cursor-pointer">
              <Link href="/marketplace" className="block">
                <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center mb-4 group-hover:bg-[#8b5cf6]/20 transition-colors">
                  <Book className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Agenten entdecken
                </h3>
                <p className="text-sm text-white/50">
                  Erkunden Sie unseren Marketplace mit 20+ Branchenlösungen.
                </p>
              </Link>
            </Card>

            <Card className="p-6 hover:border-[#34c759]/30 transition-colors group cursor-pointer">
              <a href="mailto:support@agentify.ch" className="block">
                <div className="w-12 h-12 rounded-xl bg-[#34c759]/10 flex items-center justify-center mb-4 group-hover:bg-[#34c759]/20 transition-colors">
                  <Mail className="w-6 h-6 text-[#34c759]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  E-Mail Support
                </h3>
                <p className="text-sm text-white/50">
                  support@agentify.ch - Für technische Anfragen.
                </p>
              </a>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                Kategorien
              </h3>
              <nav className="space-y-2">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeCategory === category.id
                        ? "bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-white"
                        : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{category.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  {faqCategories.find((c) => c.id === activeCategory)?.title}
                </h2>
                <div className="space-y-4">
                  {activeQuestions.map((item, index) => {
                    const itemId = `${activeCategory}-${index}`;
                    const isOpen = openItems.includes(itemId);

                    return (
                      <div
                        key={itemId}
                        className="border border-white/[0.06] rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="font-medium text-white pr-4">
                            {item.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-white/50 shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-white/50 shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-white/60 leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Still Need Help */}
          <Card className="mt-12 p-8 bg-gradient-to-r from-[#3b82f6]/10 to-[#8b5cf6]/5 border-[#3b82f6]/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Noch Fragen?
                </h3>
                <p className="text-white/50">
                  Unser Team hilft Ihnen gerne persönlich weiter.
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link href="/contact">Kontakt aufnehmen</Link>
                </Button>
                <Button asChild>
                  <Link href="/pricing">Preise ansehen</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
