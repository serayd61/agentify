"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  MessageSquare,
  Calendar,
  Clock,
  Shield,
  Phone,
  FileText,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* ── HERO ── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-44 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Swiss Made · Ab CHF 199/Mt.
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight"
            >
              Ihr KI-Assistent für
              <br />
              <span className="text-red-600">zufriedene Kunden</span>
            </motion.h1>

            {/* One-liner */}
            <motion.p
              variants={fadeIn}
              className="text-lg sm:text-xl text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Kundenanfragen, Termine und Support — automatisiert, rund um die Uhr. In 5 Minuten eingerichtet.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 h-12">
                <Link href="/register">
                  Kostenlos testen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 border-gray-200 text-gray-700 hover:bg-gray-50">
                <Link href="/demo">Live Demo ansehen</Link>
              </Button>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-500" />
                Swiss Hosting
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-500" />
                DSGVO-konform
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-green-500" />
                24/7 verfügbar
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero visual — chat mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="container relative z-10 mt-16 max-w-4xl"
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-400 border border-gray-100">
                  ihrefirma.ch
                </div>
              </div>
            </div>
            {/* Chat preview */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm shrink-0">🤖</div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-700 max-w-md">
                  Grüezi! Wie kann ich Ihnen helfen? Ich beantworte Fragen, buche Termine und leite komplexe Anfragen weiter.
                </div>
              </div>
              <div className="flex gap-3 items-start justify-end">
                <div className="bg-red-600 rounded-2xl rounded-tr-md px-4 py-3 text-sm text-white max-w-xs">
                  Ich möchte einen Beratungstermin buchen.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm shrink-0">🤖</div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-700 max-w-md">
                  Gerne! Passt Ihnen Mittwoch, 14:00 Uhr? Ich habe freie Termine am Mittwoch und Freitag.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── BRANCHEN ── */}
      <section className="py-16 sm:py-24 border-t border-gray-100">
        <div className="container">
          <p className="text-center text-sm text-gray-400 font-medium uppercase tracking-widest mb-8">
            Für jede Branche der passende Assistent
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: "📊", name: "Treuhand" },
              { icon: "🔧", name: "Handwerk" },
              { icon: "🏥", name: "Gesundheit" },
              { icon: "🍽️", name: "Gastronomie" },
              { icon: "🏠", name: "Immobilien" },
              { icon: "⚖️", name: "Rechtsberatung" },
            ].map((b) => (
              <Link
                key={b.name}
                href={`/marketplace?branche=${b.name.toLowerCase()}`}
                className="flex items-center gap-2.5 px-5 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-gray-700 hover:text-gray-900"
              >
                <span className="text-xl">{b.icon}</span>
                <span className="text-sm font-medium">{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── VORTEILE ── */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Was Ihr Assistent kann
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Weniger Aufwand für Ihr Team. Besserer Service für Ihre Kunden.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: MessageSquare, title: "24/7 Kundenservice", desc: "Beantwortet Anfragen rund um die Uhr." },
                { icon: Calendar, title: "Terminbuchung", desc: "Kunden buchen direkt — ohne Telefon." },
                { icon: FileText, title: "FAQ & Wissen", desc: "Häufige Fragen sofort beantwortet." },
                { icon: Phone, title: "Weiterleitung", desc: "Komplexes geht direkt an Sie." },
              ].map((v, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SO FUNKTIONIERT'S ── */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                In 3 Schritten startklar
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { step: "1", title: "Wählen", desc: "Branchen-Assistent aus dem Marketplace wählen." },
                { step: "2", title: "Anpassen", desc: "FAQ, Preise und Öffnungszeiten hinterlegen." },
                { step: "3", title: "Einbinden", desc: "Widget-Code kopieren. Fertig." },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeIn} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600 font-bold text-lg">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PREISE ── */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Einfache Preise
              </h2>
              <p className="text-gray-500">Keine Einrichtungskosten. Monatlich kündbar.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "199",
                  desc: "Für Einzelunternehmer",
                  features: ["1 KI-Assistent", "2'500 Nachrichten/Mt.", "E-Mail-Support", "Website-Widget"],
                  highlight: false,
                },
                {
                  name: "Business",
                  price: "399",
                  desc: "Für wachsende KMU",
                  features: ["3 KI-Assistenten", "10'000 Nachrichten/Mt.", "Priority Support", "WhatsApp-Integration", "Eigenes Branding"],
                  highlight: true,
                },
                {
                  name: "Enterprise",
                  price: "899",
                  desc: "Für grössere Unternehmen",
                  features: ["Unbegrenzte Assistenten", "50'000 Nachrichten/Mt.", "Dedicated Support", "API-Zugang", "Custom Integrationen"],
                  highlight: false,
                },
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className={`p-6 rounded-2xl border transition-all ${
                    plan.highlight
                      ? "bg-white border-red-200 shadow-lg shadow-red-100/50 ring-1 ring-red-100"
                      : "bg-white border-gray-100 hover:shadow-md"
                  }`}
                >
                  {plan.highlight && (
                    <span className="inline-block px-3 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full mb-3">
                      Beliebt
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{plan.desc}</p>
                  <div className="mb-5">
                    <span className="text-3xl font-bold text-gray-900">CHF {plan.price}</span>
                    <span className="text-gray-400 text-sm">/Mt.</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full rounded-full ${plan.highlight ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/register">Jetzt starten</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Das sagen unsere Kunden
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                {
                  quote: "Wir verpassen keine Kundenanfrage mehr — auch nachts nicht.",
                  author: "Thomas M.",
                  role: "Treuhand Müller AG",
                },
                {
                  quote: "60% weniger Telefonzeit dank automatischer Terminbuchung.",
                  author: "Dr. Sandra K.",
                  role: "Zahnarztpraxis Küsnacht",
                },
                {
                  quote: "Der Agent filtert am Wochenende perfekt — nur echte Notfälle kommen durch.",
                  author: "Marco B.",
                  role: "Elektro Brunner GmbH",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="p-6 bg-white rounded-2xl border border-gray-100"
                >
                  <p className="text-gray-700 mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.author}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-xl mx-auto"
          >
            <motion.h2 variants={fadeIn} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Bereit loszulegen?
            </motion.h2>
            <motion.p variants={fadeIn} className="text-gray-500 mb-8">
              14 Tage kostenlos. Keine Kreditkarte nötig.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 h-12">
                <Link href="/register">
                  Kostenlos starten
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 border-gray-200 text-gray-700 hover:bg-gray-50">
                <Link href="/contact">Beratung anfordern</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
