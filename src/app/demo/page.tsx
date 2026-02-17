"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AIChatWidget from "@/components/demo/AIChatWidget";

const sectors = [
  {
    id: "treuhand",
    name: "Treuhand & Finanzen",
    description: "Automatisieren Sie Buchhaltung, Abgaben und Fristen mit einem digitalen Assistenten, der Ihre Zahlen versteht.",
    badge: "Präzision",
    stats: ["MWST-Vorbereitung", "Lohnabrechnung", "Digitaler Beleg-Upload"],
  },
  {
    id: "handwerk",
    name: "Handwerk & Technik",
    description: "Koordinieren Sie Notfälle, Einsatzplanung und Rechnungstellung direkt über den Chat.",
    badge: "Service",
    stats: ["Einsatzplanung", "Materialverwaltung", "Techniker-Ruf"],
  },
  {
    id: "gastronomie",
    name: "Gastronomie",
    description: "Reservierungen, Specials und Personalfragen im Stil eines Concierge-Assistenten lösen.",
    badge: "Erlebnis",
    stats: ["Tischreservierung", "Menüberatung", "Kapazitätsmanagement"],
  },
  {
    id: "gesundheit",
    name: "Praxis & Gesundheit",
    description: "Terminbuchungen, Rezeptanfragen und Patientenkommunikation sichern Vertrauen.",
    badge: "Vertrauen",
    stats: ["Terminverwaltung", "Telemedizin-Support", "Erinnerungen"],
  },
  {
    id: "immobilien",
    name: "Immobilien",
    description: "Objektbesichtigungen, Finanzierungsfragen und Interessenten-Nurturing im Chat.",
    badge: "Transparenz",
    stats: ["Besichtigungen", "Finanzierung", "Lead-Nurturing"],
  },
  {
    id: "rechtsberatung",
    name: "Rechtsberatung",
    description: "Klare Antworten zu Verträgen, Fristen und Beratungslebnissen für Mandanten.",
    badge: "Sicherheit",
    stats: ["Verträge", "Erstberatung", "Fristmanagement"],
  },
];

const featureShowcase = [
  {
    title: "Live-Chat, aber smarter",
    description: "Alles bleibt in Ihrer Marke: Glasige Panels, Echtzeit-Antworten und Kontext aus Ihren Daten.",
  },
  {
    title: "Custom Prompts",
    description: "Vorbereitete Fragen, sector-spezifische Wissensdatenbanken und CTA-Aktionen lassen Besucher aktiv werden.",
  },
  {
    title: "Mobile-ready",
    description: "Glazgo-Animationen und adaptive Layouts sorgen auch auf Smartphones für Wow-Momente.",
  },
];

export default function DemoPage() {
  const [activeSector, setActiveSector] = useState(sectors[0].id);
  const activeInfo = sectors.find((sector) => sector.id === activeSector) ?? sectors[0];

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      <Header />
      <main className="flex-1 pt-24 pb-20">
        <div className="container max-w-6xl space-y-16">
          <section className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur"
            >
              <Sparkles className="w-4 h-4 text-[#ff3b30]" />
              <span className="text-xs uppercase tracking-[0.4em] text-white/60">Agentify Demo</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold"
            >
              Die KI erleben, die Schweizer KMU wirklich unterstützt
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg text-white/60 max-w-3xl mx-auto"
            >
              Wählen Sie einen Branchen-Assistenten und erleben Sie, wie Agentify den ersten Kontakt, Support und Service automatisch übernimmt.
            </motion.p>
          </section>

          <section className="grid gap-10 lg:grid-cols-[360px_1fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-[0_30px_70px_rgba(0,0,0,0.65)]">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Sektor wählen</p>
                <h2 className="text-2xl font-semibold mt-2">Branchen, die wir heute zeigen</h2>
                <p className="text-sm text-white/60 mt-2">Jede Auswahl lädt den Demo-Chat mit sector-spezifischen Antworten.</p>
              </div>
              <div className="space-y-3">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => setActiveSector(sector.id)}
                    className={`w-full text-left rounded-[1.5rem] border px-5 py-4 transition-all backdrop-blur ${
                      activeSector === sector.id
                        ? "border-[#ff3b30] bg-white/5 shadow-[0_15px_40px_rgba(255,59,48,0.25)]"
                        : "border-white/5 bg-[#05050a] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm uppercase tracking-[0.3em] text-white/50">{sector.badge}</p>
                      <span className="text-xs text-white/60">Live</span>
                    </div>
                    <h3 className="text-lg font-semibold mt-2">{sector.name}</h3>
                    <p className="text-sm text-white/60 mt-1 leading-relaxed">{sector.description}</p>
                  </button>
                ))}
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur-lg text-sm text-white/70 space-y-3">
                <p className="text-white/80 text-xs uppercase tracking-[0.4em]">Live-Insights</p>
                <ul className="space-y-2">
                  {activeInfo.stats.map((stat) => (
                    <li key={stat} className="flex items-center justify-between text-sm">
                      <span>{stat}</span>
                      <span className="text-white/40 text-xs">Demo</span>
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant="ghost" asChild className="text-white/70 hover:text-white">
                  <Link href="/pricing">Mehr Branchen entdecken <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <AIChatWidget sector={activeSector} />
            </motion.div>
          </section>

          <section className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Funktionen</p>
              <h2 className="text-3xl font-semibold">Features, die Besucher begeistern</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-5 md:grid-cols-3"
            >
              {featureShowcase.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_20px_45px_rgba(0,0,0,0.5)] h-full"
                >
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/60 mt-3 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </motion.div>
          </section>

          <section className="text-center">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur shadow-[0_40px_70px_rgba(0,0,0,0.7)] space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Bereit für die eigene AI?</p>
              <h2 className="text-3xl font-semibold">Starten Sie jetzt mit Agentify.ch</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Vom ersten Chatkontakt bis zur vollautomatischen Unterstützung – unser Dashboard führt Sie durch jede Anpassung.
              </p>
              <Button size="lg" asChild>
                <Link href="/register" className="flex items-center justify-center gap-2">
                  Demo abonnieren
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
