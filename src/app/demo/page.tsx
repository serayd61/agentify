"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Wrench, UtensilsCrossed, Heart, Home, Scale, Sparkles, ArrowRight, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import DemoChat from "@/components/demo/DemoChat";

const sectors = [
  { id: "treuhand", name: "Treuhand Muster AG", icon: Building2, color: "#007aff", badge: "Präzision" },
  { id: "handwerk", name: "Elektro Brunner GmbH", icon: Wrench, color: "#ff9500", badge: "Service" },
  { id: "gastronomie", name: "Restaurant Sonnenberg", icon: UtensilsCrossed, color: "#34c759", badge: "Erlebnis" },
  { id: "gesundheit", name: "Praxis Dr. Keller", icon: Heart, color: "#ff3b30", badge: "Vertrauen" },
  { id: "immobilien", name: "Immo Swiss AG", icon: Home, color: "#af52de", badge: "Transparenz" },
  { id: "rechtsberatung", name: "Kanzlei Weber", icon: Scale, color: "#5856d6", badge: "Sicherheit" },
];

const highlights = [
  {
    title: "Live-Chat, aber smarter",
    description: "Glassmorphism Panels, weiche Framer Motion Transitions und Gesprächsverläufe, die sofort Vertrauen schaffen.",
  },
  {
    title: "Sector-aware Prompts",
    description: "Jedes Szenario hat System-Prompts für Preise, Termine und Notfälle. Besucher fühlen sich verstanden.",
  },
  {
    title: "CTA in jeder Antwort",
    description: "Empfehlungen, Terminvorschläge und Upsells werden direkt in die Antwort eingebettet.",
  },
];

export default function DemoPage() {
  const [selectedSector, setSelectedSector] = useState(sectors[0]);

  return (
    <div className="min-h-screen bg-[#02030a] text-white">
      <Header />
      <main className="flex-1 py-24">
        <div className="container max-w-6xl space-y-14">
          <section className="text-center space-y-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur">
              <Sparkles className="w-4 h-4 text-[#ff3b30]" />
              <span className="text-xs uppercase tracking-[0.4em] text-white/70">Live Demo</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold">
              Die KI-Chats, die Schweizer KMU begeistern
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg text-white/60 max-w-3xl mx-auto">
              Wählen Sie eine Branche und erleben Sie, wie Agentify die ersten Kontakte automatisch beantwortet, Termine bucht und Servicefälle löst.
            </motion.p>
          </section>

          <section className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-[0_35px_70px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#ff3b30]" />
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">So funktioniert die Demo</p>
                </div>
                <h2 className="text-2xl font-semibold mt-3">Sektor wählen, chatten, überzeugen</h2>
                <p className="text-sm text-white/60 mt-2">Jeder Sector lädt vorgefertigte System-Prompts, Popup-Dialoge und Handlungsanweisungen sowie Status-Infos.</p>
              </div>
              <div className="space-y-3">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => setSelectedSector(sector)}
                    className={`w-full text-left rounded-[1.5rem] border px-5 py-4 transition-all backdrop-blur ${
                      selectedSector.id === sector.id
                        ? "border-[#ff3b30] bg-white/5 shadow-[0_18px_45px_rgba(255,59,48,0.35)]"
                        : "border-white/5 bg-[#05050a] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{sector.badge}</p>
                      <span className="text-[10px] uppercase text-white/40">Live</span>
                    </div>
                    <div className="mt-3 text-lg font-semibold" style={{ color: sector.color }}>
                      {sector.name}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <DemoChat sector={selectedSector.id} sectorName={selectedSector.name} />
            </motion.div>
          </section>

          <section className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Features</p>
              <h2 className="text-3xl font-semibold">Was Agentify jetzt schon kann</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {highlights.map((feature) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-[0_25px_60px_rgba(0,0,0,0.6)] h-full"
                >
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/60 mt-3 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="text-center">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-10 backdrop-blur shadow-[0_40px_70px_rgba(0,0,0,0.75)] space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Bereit für Ihr eigenes Projekt?</p>
              <h2 className="text-3xl font-semibold">Agentify führt Sie durch die komplette Einrichtung</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Von der Demo zum Launch: Wir liefern Templates, Konfiguration, Analytics und Widget-Integration – Sie übernehmen die letzten Feinabstimmungen.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ff3b30] to-[#ff6b5e] text-white font-semibold rounded-xl shadow-lg shadow-[#ff3b30]/40">
                Jetzt starten
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
