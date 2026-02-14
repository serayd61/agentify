"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ArrowRight,
  Check,
  MessageSquare,
  Calendar,
  Clock,
  Shield,
  ChevronDown,
  Sparkles,
  Phone,
  FileText,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Branchen für KMU
const branchen = [
  { name: "Treuhand", icon: "📊", color: "#dc2626" },
  { name: "Handwerk", icon: "🔧", color: "#f59e0b" },
  { name: "Gesundheit", icon: "🏥", color: "#10b981" },
  { name: "Gastronomie", icon: "🍽️", color: "#8b5cf6" },
  { name: "Immobilien", icon: "🏠", color: "#3b82f6" },
  { name: "Rechtsberatung", icon: "⚖️", color: "#6366f1" },
];

// Vorteile
const vorteile = [
  {
    icon: MessageSquare,
    title: "24/7 Kundenservice",
    description: "Ihr Assistent beantwortet Kundenanfragen rund um die Uhr, auch am Wochenende.",
  },
  {
    icon: Calendar,
    title: "Automatische Terminbuchung",
    description: "Kunden buchen selbst Termine – ohne Telefonanrufe oder E-Mail-Ping-Pong.",
  },
  {
    icon: FileText,
    title: "FAQ & Wissensbasis",
    description: "Häufige Fragen werden sofort beantwortet. Sie sparen Zeit für wichtigere Aufgaben.",
  },
  {
    icon: Phone,
    title: "Intelligente Weiterleitung",
    description: "Komplexe Anfragen werden automatisch an Sie weitergeleitet – per E-Mail oder WhatsApp.",
  },
];

// Preise
const preise = [
  {
    name: "Starter",
    preis: "199",
    beschreibung: "Perfekt für Einzelunternehmer",
    features: ["1 KI-Assistent", "2'500 Nachrichten/Monat", "E-Mail-Support", "Widget für Website"],
    highlight: false,
  },
  {
    name: "Business",
    preis: "399",
    beschreibung: "Für wachsende KMU",
    features: ["3 KI-Assistenten", "10'000 Nachrichten/Monat", "Priority Support", "WhatsApp-Integration", "Eigenes Branding"],
    highlight: true,
  },
  {
    name: "Enterprise",
    preis: "899",
    beschreibung: "Für grössere Unternehmen",
    features: ["Unbegrenzte Assistenten", "50'000 Nachrichten/Monat", "Dedicated Support", "API-Zugang", "Custom Integrationen"],
    highlight: false,
  },
];

// Testimonials
const testimonials = [
  {
    quote: "Seit wir den Treuhand-Assistenten haben, verpassen wir keine Kundenanfrage mehr.",
    author: "Thomas M.",
    role: "Treuhand Müller AG, Aarau",
  },
  {
    quote: "Die Online-Terminbuchung hat unsere Telefonzeit um 60% reduziert.",
    author: "Dr. Sandra K.",
    role: "Zahnarztpraxis Küsnacht",
  },
  {
    quote: "Am Wochenende erreichen uns keine Notfall-Anrufe mehr direkt. Der Agent filtert perfekt.",
    author: "Marco B.",
    role: "Elektro Brunner GmbH",
  },
];

// FAQ
const faqItems = [
  {
    question: "Wie schnell kann ich starten?",
    answer: "In nur 5 Minuten! Wählen Sie Ihren Branchen-Assistenten, passen Sie die Antworten an, und kopieren Sie den Widget-Code auf Ihre Website.",
  },
  {
    question: "Wo werden meine Daten gespeichert?",
    answer: "Alle Daten werden in der Schweiz gespeichert (Swiss Hosting). Wir sind DSG-konform und DSGVO-ready.",
  },
  {
    question: "Kann ich den Assistenten anpassen?",
    answer: "Ja! Sie können Ihre eigenen FAQ, Preise, Öffnungszeiten und Antworten hinterlegen.",
  },
  {
    question: "Was passiert bei komplexen Anfragen?",
    answer: "Der Assistent erkennt komplexe Anfragen und leitet sie per E-Mail oder WhatsApp an Sie weiter.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030308] flex flex-col">
      <Header />

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-[150px]" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-[#8b5cf6]/10 rounded-full blur-[120px]" />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                <Sparkles className="w-4 h-4 text-[#dc2626]" />
                <span className="text-white/70">Swiss Made</span>
                <span className="text-white/30">•</span>
                <span className="text-white/70">Ab CHF 199/Monat</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              KI-Assistenten für
              <br />
              <span className="text-[#dc2626]">Schweizer KMU</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto"
            >
              Ihr digitaler Mitarbeiter für Kundenanfragen, Terminbuchungen und Support.
              In 5 Minuten startklar. Keine Einrichtungskosten.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="bg-[#dc2626] hover:bg-[#b91c1c]">
                <Link href="/register">
                  Kostenlos testen
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/marketplace">Assistenten ansehen</Link>
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Swiss Hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>DSGVO-konform</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span>24/7 verfügbar</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* BRANCHEN SECTION */}
      {/* ============================================ */}
      <section className="py-20 border-y border-white/5">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.p variants={fadeInUp} className="text-white/50 mb-8">
              Spezialisierte Assistenten für jede Branche
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              {branchen.map((branche) => (
                <Link
                  key={branche.name}
                  href={`/marketplace?branche=${branche.name.toLowerCase()}`}
                  className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                >
                  <span className="text-2xl">{branche.icon}</span>
                  <span className="text-white/80 group-hover:text-white">{branche.name}</span>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* LIVE DEMO SECTION */}
      {/* ============================================ */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#dc2626]/5 to-transparent" />
        
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                Live Demo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Testen Sie unsere KI-Assistenten
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto mb-8">
                3 Branchen-Assistenten live ausprobieren: Treuhand, Gesundheit und Gastronomie.
              </p>
            </motion.div>

            {/* Demo Preview Cards */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { icon: "📊", name: "Treuhand", color: "#dc2626" },
                { icon: "🏥", name: "Gesundheit", color: "#10b981" },
                { icon: "🍽️", name: "Gastronomie", color: "#8b5cf6" },
              ].map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="text-2xl">{agent.icon}</span>
                  <span className="text-white/80">{agent.name}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button size="lg" asChild className="bg-[#dc2626] hover:bg-[#b91c1c]">
                <Link href="/demo">
                  Live Demo starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* VORTEILE SECTION */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                Vorteile
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Was Ihr KI-Assistent kann
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Entlasten Sie Ihr Team und bieten Sie Ihren Kunden besseren Service.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vorteile.map((vorteil, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-[#dc2626]/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center mb-4">
                    <vorteil.icon className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{vorteil.title}</h3>
                  <p className="text-white/50 text-sm">{vorteil.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SO FUNKTIONIERT'S SECTION */}
      {/* ============================================ */}
      <section className="py-24 bg-white/[0.01]">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                So funktioniert&apos;s
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                In 3 Schritten startklar
              </h2>
            </motion.div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Assistent wählen", desc: "Wählen Sie den passenden Branchen-Assistenten aus unserem Marketplace." },
                { step: "2", title: "Anpassen", desc: "Fügen Sie Ihre FAQ, Preise und Öffnungszeiten hinzu." },
                { step: "3", title: "Einbinden", desc: "Kopieren Sie den Widget-Code auf Ihre Website. Fertig!" },
              ].map((item, index) => (
                <motion.div key={index} variants={fadeInUp} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#dc2626]/10 border-2 border-[#dc2626]/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[#dc2626]">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PREISE SECTION */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                Preise
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Transparente Preise für KMU
              </h2>
              <p className="text-white/50">
                Keine Einrichtungskosten. Monatlich kündbar.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {preise.map((plan, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`p-6 rounded-2xl border ${
                    plan.highlight
                      ? "bg-[#dc2626]/5 border-[#dc2626]/30"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  {plan.highlight && (
                    <span className="inline-block px-3 py-1 bg-[#dc2626] text-white text-xs font-semibold rounded-full mb-4">
                      Beliebt
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/50 text-sm mb-4">{plan.beschreibung}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">CHF {plan.preis}</span>
                    <span className="text-white/50">/Monat</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.highlight ? "bg-[#dc2626] hover:bg-[#b91c1c]" : ""}`}
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

      {/* ============================================ */}
      {/* TESTIMONIALS SECTION */}
      {/* ============================================ */}
      <section className="py-24 bg-white/[0.01]">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                Kundenstimmen
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Was unsere Kunden sagen
              </h2>
            </motion.div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 bg-white/[0.02] rounded-2xl border border-white/5"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} className="w-4 h-4 text-[#dc2626]" />
                    ))}
                  </div>
                  <p className="text-white/70 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-white/40 text-sm">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ SECTION */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Häufige Fragen
              </h2>
            </motion.div>

            {/* FAQ Accordion */}
            <Accordion.Root type="single" collapsible className="space-y-3">
              {faqItems.map((item, index) => (
                <Accordion.Item
                  key={index}
                  value={`item-${index}`}
                  className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden"
                >
                  <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-4 text-left text-white font-medium hover:text-[#dc2626] transition-colors group">
                    {item.question}
                    <ChevronDown className="w-5 h-5 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
                  </Accordion.Trigger>
                  <Accordion.Content className="px-6 pb-4 text-white/60">
                    {item.answer}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626]/10 via-[#dc2626]/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#dc2626]/10 rounded-full blur-[200px]" />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Bereit für Ihren KI-Assistenten?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/60 mb-8">
              Starten Sie noch heute und entlasten Sie Ihr Team.
              14 Tage kostenlos testen.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-[#dc2626] hover:bg-[#b91c1c]">
                <Link href="/register">
                  Kostenlos starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
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
