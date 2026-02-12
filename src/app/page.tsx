"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import * as Accordion from "@radix-ui/react-accordion";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowRight,
  Check,
  X,
  Zap,
  Brain,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
  Clock,
  Sparkles,
  Database,
  Search,
  Workflow,
  ChevronDown,
  Play,
  Layers,
  Lock,
  Server,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// Generate stable particle positions (seeded by index)
const generateParticleData = (count: number) => {
  // Use deterministic values based on index for SSR consistency
  return Array.from({ length: count }, (_, i) => ({
    left: ((i * 37 + 13) % 100),
    top: ((i * 53 + 7) % 100),
    duration: 8 + (i % 5),
    delay: (i % 6),
  }));
};

// Trusted companies logos (placeholder)
// Floating Particles Component - uses stable positions
const PARTICLE_DATA = generateParticleData(20);

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_DATA.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const trustedCompanies = [
  "Swisscom", "UBS", "Novartis", "Roche", "ABB", "Nestlé", "Credit Suisse", "Zurich Insurance"
];

// Problem cards data
const problemCards = [
  {
    icon: MessageSquare,
    title: "Generische Antworten verfehlen das Ziel",
    description: "KI ohne Unternehmenskontext liefert vage, allgemeine Antworten, die ständig korrigiert werden müssen.",
  },
  {
    icon: Clock,
    title: "Zeitverschwendung beim Hinzufügen von Kontext",
    description: "Die meiste Zeit verbringen Sie damit, Dateien hochzuladen, Anweisungen zu wiederholen und der KI Ihre Aufgaben zu erklären.",
  },
  {
    icon: Shield,
    title: "Risiko für sensible Unternehmensdaten",
    description: "Das Hinzufügen sensibler Unternehmensdaten zu LLM-Modellen gefährdet Sie und Ihr Unternehmen.",
  },
];

// Solution steps data
const solutionSteps = [
  {
    number: "1",
    title: "Verbinden",
    subtitle: "Erstellen Sie Ihr \"Unternehmensgehirn\"",
    description: "Agentify verbindet sich einfach und sicher mit den strukturierten und unstrukturierten Daten Ihres Unternehmens über 40+ Apps.",
    features: [
      "Angetrieben von unserer bahnbrechenden Speicherarchitektur",
      "Funktioniert wie das Gehirn Ihres Unternehmens und merkt sich den Kontext",
      "Verfolgt über 120 Dimensionen inkl. Projekte, Teams und Prioritäten",
    ],
    icon: Database,
    image: "/images/agents/finanz.jpg",
  },
  {
    number: "2",
    title: "Analysieren",
    subtitle: "Stellen Sie schwierige Fragen",
    description: "Stellen Sie Agentify komplexe Fragen zu Ihrem Unternehmen:",
    features: [
      "Welche Features werden diese Woche ausgeliefert?",
      "Zeige mir Kunden, die abwandern könnten und warum",
      "Welche Verkaufsdeals sind gefährdet?",
    ],
    icon: Search,
    image: "/images/agents/elektro.jpg",
  },
  {
    number: "3",
    title: "Ausführen",
    subtitle: "Delegieren Sie komplexe Aufgaben",
    description: "Lassen Sie Ihr Team sich auf das Wesentliche konzentrieren.",
    features: [
      "Ausführen: Aufgaben erledigen, von E-Mails bis zum Code schreiben",
      "Zusammenarbeiten: Teams mit Echtzeit-Updates synchron halten",
      "Automatisieren: Mehrstufige Workflows über Tools hinweg auslösen",
    ],
    icon: Workflow,
    image: "/images/agents/handwerk.jpg",
  },
];

// Features data
const features = [
  {
    icon: Search,
    title: "Informationen und Antworten erhalten",
    description: "Finden Sie sofort Infos und Dokumente, erhalten Sie detaillierte Updates und chatten Sie mit den Apps und Daten Ihres Unternehmens",
  },
  {
    icon: BarChart3,
    title: "Recherche und Analyse durchführen",
    description: "Nutzen Sie mehrstufiges Reasoning, um strukturierte und unstrukturierte Daten in Ihrem Unternehmen zu analysieren",
  },
  {
    icon: Users,
    title: "Teams und Projekte verwalten",
    description: "Automatisieren Sie Updates über Personen, Teams, Projekte und Kunden. Verstehen Sie, was auf Kurs ist",
  },
  {
    icon: Zap,
    title: "Arbeit in Sekunden erledigen",
    description: "Agentify hat Speicher über Projekte, Gespräche und Prioritäten, um Aufgaben schnell zu erledigen",
  },
];

// Team use cases
const teamUseCases = {
  engineering: {
    title: "Engineering",
    description: "Finden Sie sofort Infos und Dokumente, erhalten Sie detaillierte Updates und chatten Sie mit den Apps und Daten Ihres Unternehmens",
    features: ["Code-Dokumentationssuche", "Bug-Tracking-Integration", "Sprint-Planungsunterstützung", "Technische Schuldenanalyse"],
    image: "/images/agents/elektro.jpg",
  },
  marketing: {
    title: "Marketing",
    description: "Nutzen Sie mehrstufiges Reasoning, um strukturierte und unstrukturierte Daten in Ihrem Unternehmen und im Internet zu analysieren",
    features: ["Kampagnen-Performance-Analyse", "Content-Generierung", "Wettbewerbsrecherche", "Social-Media-Insights"],
    image: "/images/agents/gastronomie.jpg",
  },
  operations: {
    title: "Operations",
    description: "Automatisieren Sie Updates über Personen, Teams, Projekte und Kunden. Verstehen Sie, was auf Kurs ist und wo der Fokus liegen sollte",
    features: ["Prozessautomatisierung", "Ressourcenzuweisung", "Lieferantenmanagement", "Compliance-Tracking"],
    image: "/images/agents/logistik.jpg",
  },
  sales: {
    title: "Vertrieb",
    description: "Automatisieren Sie Aufgaben und übergeben Sie nuancierte Arbeitsprodukte an Agentify zur Fertigstellung",
    features: ["Lead-Qualifizierung", "Pipeline-Analyse", "Vertragserstellung", "Kundeneinblicke"],
    image: "/images/agents/finanz.jpg",
  },
};

// Testimonials
const testimonials = [
  {
    quote: "Zwischen Slack, Docs, Meetings und Projekttools hilft uns Agentify, das Wesentliche zu verfolgen — und verwandelt verstreute Updates in echte, umsetzbare Erkenntnisse.",
    author: "Michael S.",
    role: "Head of AI, TechCorp",
  },
  {
    quote: "Agentify ist nicht nur ein Transkriptionstool — es hat unsere Arbeitsweise verändert. Früher haben wir Stunden damit verbracht, Notizen zusammenzusetzen. Jetzt wird alles automatisch erfasst und kontextualisiert.",
    author: "Sarah M.",
    role: "Mitgründerin, StartupX",
  },
  {
    quote: "Agentify spart mir Stunden, indem es wichtige Informationen aufdeckt, die ich sonst verpassen würde. Es ist ein wichtiger Teil meines täglichen Workflows geworden.",
    author: "Thomas R.",
    role: "CPO, InnovateCH",
  },
];

// FAQ items
const faqItems = [
  {
    question: "Wie funktioniert das organisatorische Gedächtnis?",
    answer: "Agentify erstellt eine einheitliche Speicherebene über alle Ihre verbundenen Apps und Datenquellen. Dies ermöglicht der KI, Kontext, Beziehungen und Historie in Ihrer gesamten Organisation zu verstehen, was die Antworten genauer und relevanter macht.",
  },
  {
    question: "Wie gehen Sie mit Datensicherheit um?",
    answer: "Wir folgen strengen Enterprise-Grade-Sicherheitsstandards, einschliesslich SOC 2-Compliance, End-to-End-Verschlüsselung und rollenbasierter Zugriffskontrollen. Daten verlassen Ihre Cloud nie ohne ausdrückliche Genehmigung, und Audit-Logs gewährleisten Transparenz und Kontrolle.",
  },
  {
    question: "Wie einfach ist die Einrichtung?",
    answer: "Die Einrichtung dauert weniger als einen Tag. Verbinden Sie einfach Ihre Apps über unsere sicheren OAuth-Integrationen, und Agentify beginnt mit der Indexierung und dem Lernen aus Ihren Daten. Die meisten Teams sind innerhalb von Stunden einsatzbereit.",
  },
  {
    question: "Warum ist das besser als andere Enterprise-KI?",
    answer: "Im Gegensatz zu generischen KI-Tools behält Agentify ein dauerhaftes Gedächtnis über Ihre Organisation. Das bedeutet, es versteht Ihren spezifischen Kontext, Terminologie, Projekte und Prioritäten — und liefert Antworten, die wirklich nützlich sind.",
  },
  {
    question: "Wie funktioniert der Datenschutz?",
    answer: "Ihre Daten werden niemals zum Trainieren unserer Modelle verwendet. Wir halten strikte Datenisolierung zwischen Kunden aufrecht, und Sie haben volle Kontrolle darüber, auf welche Daten Agentify zugreifen kann. Alle Daten sind im Ruhezustand und bei der Übertragung verschlüsselt.",
  },
];

// Comparison items
const oldWayItems = [
  "Generische Antworten ohne Unternehmenskontext",
  "Verwaltung mehrerer Threads oder KI-Einzellösungen",
  "Nur Chat, kann keine Aufgaben ausführen",
  "Kopieren und Einfügen von Dateien in den Chat",
  "Wiederholtes Prompting für relevante Antworten",
];

const newWayItems = [
  "Antworten mit vollem Unternehmenskontext",
  "Fragen über alle Teams hinweg bearbeiten",
  "Aufgaben wie ein Senior-Teammitglied ausführen",
  "Gedächtnis über Projekte und Prioritäten",
  "Versteht Ihr Unternehmen tiefgreifend",
];

export default function HomePage() {
  const [activeTeam, setActiveTeam] = useState<keyof typeof teamUseCases>("engineering");

  return (
    <div className="min-h-screen bg-[#030308] flex flex-col">
      <Header />

      {/* Hero Section - Premium Swiss Dark Theme */}
      <section className="relative pt-24 pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Deep Dark Background with Noise Texture */}
        <div className="absolute inset-0 bg-[#030308]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        {/* Swiss-Inspired Geometric Accent Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#dc2626]/30 to-transparent" />
        <div className="absolute top-32 left-[15%] w-px h-64 bg-gradient-to-b from-[#dc2626]/20 to-transparent" />
        <div className="absolute top-32 right-[15%] w-px h-64 bg-gradient-to-b from-[#dc2626]/20 to-transparent" />

        {/* Primary Animated Gradient Orb - Swiss Red Accent */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const },
          }}
          className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{ background: 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)' }}
        />
        
        {/* Secondary Orb - Purple/Blue Tech Gradient */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1],
            transition: { duration: 12, repeat: Infinity, ease: "easeInOut" as const },
          }}
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)' }}
        />

        {/* Tertiary Orb - Cyan Accent */}
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1],
            transition: { duration: 15, repeat: Infinity, ease: "easeInOut" as const },
          }}
          className="absolute bottom-[10%] left-[25%] w-[400px] h-[400px] bg-[#06b6d4]/20 rounded-full blur-[150px]"
        />

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Premium Badge */}
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b]">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </span>
                <span className="text-white/70 text-sm font-medium tracking-wide">Enterprise KI-Plattform</span>
                <span className="w-px h-4 bg-white/10" />
                <span className="text-[#dc2626] text-sm font-semibold">Swiss Made</span>
              </span>
            </motion.div>

            {/* Main Headline with Swiss Precision Typography */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.05] tracking-[-0.02em]"
            >
              <span className="block">Enterprise KI,</span>
              <span className="block mt-2">
                die{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#f97316] bg-clip-text text-transparent">
                    wirklich
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#dc2626] to-[#f97316] rounded-full"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                {" "}funktioniert
              </span>
            </motion.h1>

            {/* Subheadline with Better Readability */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl lg:text-2xl text-white/50 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Agentifys einheitliches Gedächtnis über alle Ihre Systeme ermöglicht es 
              KI-Agenten, Ihre komplexeste Arbeit von Anfang bis Ende zu lernen und auszuführen.
            </motion.p>

            {/* CTA Buttons with Premium Styling */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Button size="xl" asChild className="group relative overflow-hidden bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#ef4444] hover:to-[#dc2626] border-0 shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] hover:shadow-[0_0_60px_-10px_rgba(220,38,38,0.7)] transition-all duration-500">
                <Link href="/register">
                  <span className="relative z-10 flex items-center gap-2">
                    Kostenlos starten
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="backdrop-blur-xl bg-white/[0.02] border-white/[0.1] hover:bg-white/[0.05] hover:border-white/[0.2] transition-all duration-300">
                <Link href="/capabilities">
                  <Play className="w-4 h-4 mr-2" />
                  Demo ansehen
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10b981]" />
                <span>SOC 2 zertifiziert</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#10b981]" />
                <span>DSGVO-konform</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#10b981]" />
                <span>Swiss Hosting</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
              <div className="w-6 h-10 rounded-full border border-white/10 flex items-start justify-center p-2">
                <motion.div 
                  className="w-1 h-2 bg-white/40 rounded-full"
                  animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030308] to-transparent" />
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/5 via-transparent to-[#3b82f6]/5" />
        <div className="container relative">
          <p className="text-center text-sm text-white/40 mb-8">Teams, die Agentify lieben:</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-50">
            {trustedCompanies.slice(0, 6).map((company) => (
              <div key={company} className="text-white/60 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section with Image Background */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/agents/rechtsberatung.jpg"
            alt="Background"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030308] via-[#030308]/95 to-[#030308]" />
        </div>

        {/* Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            transition: { duration: 6, repeat: Infinity },
          }}
          className="absolute top-20 right-[10%] w-[300px] h-[300px] bg-[#8b5cf6]/20 rounded-full blur-[100px]"
        />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              Das Problem
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Generische KI versteht
              <br />
              <span className="text-white/40">Ihr Unternehmen nicht.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto">
              Die meiste Enterprise-KI liefert nur einfache Antworten und grundlegende Automatisierung.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {problemCards.map((card, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-6 bg-[#0a0a12]/80 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-[#8b5cf6]/30 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#3b82f6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <card.icon className="w-6 h-6 text-[#a78bfa]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional features badges */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {["Verbesserte Zusammenarbeit", "Datensicherheit", "Kontinuierliche Verbesserung"].map((item) => (
              <div key={item} className="flex items-center gap-2 px-4 py-2 bg-[#0f0f1a]/80 backdrop-blur-sm rounded-full border border-white/5 text-sm text-white/60">
                <Check className="w-4 h-4 text-[#10b981]" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solution Section with Video */}
      <section className="py-24 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          >
            <source src="/videos/dashboardarkaplan.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030308] via-[#0a0a12]/95 to-[#030308]" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            transition: { duration: 15, repeat: Infinity, ease: "easeInOut" as const },
          }}
          className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-[#8b5cf6]/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            transition: { duration: 12, repeat: Infinity, ease: "easeInOut" as const },
          }}
          className="absolute bottom-1/4 right-0 w-[350px] h-[350px] bg-[#3b82f6]/15 rounded-full blur-[100px]"
        />
        
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              Die Lösung
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Agentify ist anders gebaut.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto">
              Die meiste Enterprise-KI liefert nur einfache Antworten und grundlegende Automatisierungen. 
              Agentify kann komplexe Arbeit erledigen, weil es tiefen Kontext über Ihr Unternehmen hat.
            </motion.p>
          </motion.div>

          <div className="space-y-24">
            {solutionSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#8b5cf6] text-sm font-bold">#{step.number}</span>
                    <span className="text-white/40">—</span>
                    <span className="text-white font-semibold">{step.title}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{step.subtitle}</h3>
                  <p className="text-white/50 mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/60">
                        <Check className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#8b5cf6]/10">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030308]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3 p-3 bg-[#0a0a12]/90 backdrop-blur-sm rounded-xl border border-white/10">
                        <step.icon className="w-8 h-8 text-[#8b5cf6]" />
                        <div>
                          <p className="text-white font-semibold text-sm">{step.title}</p>
                          <p className="text-white/50 text-xs">{step.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Gradient Background */}
      <section className="py-24 relative overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 bg-mesh opacity-60" />
        
        {/* Animated Gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#8b5cf6]/20 to-transparent rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#3b82f6]/15 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              Was kann Agentify?
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              KI, die Ihre Teams, Projekte
              <br />
              <span className="text-white/40">und Prioritäten tiefgreifend versteht.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-3xl mx-auto">
              Agentify KI ist nicht nur ein weiteres KI-Tool — es ist Ihr smartester Teamkollege. Bitten Sie es, 
              schwierige Fragen zu beantworten, Projekte zu planen oder Aufgaben über 40+ Tools zu automatisieren.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-8 bg-[#0a0a12]/70 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-[#8b5cf6]/30 transition-all duration-500 hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.4)]"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#3b82f6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <feature.icon className="w-7 h-7 text-[#a78bfa]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0a0a12]" />
        <div className="absolute inset-0 bg-dots opacity-30" />
        
        {/* Gradient Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#8b5cf6]/10 via-[#6366f1]/5 to-[#3b82f6]/10 rounded-full blur-[100px]" />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              Der Unterschied
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Eine neue Art, mit KI zu arbeiten.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto">
              Agentify gibt Ihnen nicht nur Antworten — es erledigt die Aufgabe.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Old Way */}
            <motion.div variants={fadeInUp} className="p-8 bg-[#0f0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-2">Der alte Weg.</h3>
              <p className="text-white/40 text-sm mb-6">
                Dateien und Dokumente in den Chat kopieren, mehrere Threads verwalten, 
                wiederholt prompten für relevante Antworten.
              </p>
              <ul className="space-y-4">
                {oldWayItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-white/50">
                    <X className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* New Way */}
            <motion.div variants={fadeInUp} className="p-8 bg-gradient-to-br from-[#8b5cf6]/15 to-[#3b82f6]/5 backdrop-blur-sm rounded-2xl border border-[#8b5cf6]/30 shadow-[0_0_60px_-20px_rgba(139,92,246,0.4)]">
              <h3 className="text-xl font-bold text-white mb-2">Mit Agentify.</h3>
              <p className="text-white/40 text-sm mb-6">
                Angetrieben von einheitlichem Gedächtnis mit Kontext über Projekte, 
                Gespräche und Prioritäten.
              </p>
              <ul className="space-y-4">
                {newWayItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-white/70">
                    <Check className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Teams Section with Image Backgrounds */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030308] via-[#0a0a12] to-[#030308]" />
        
        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            transition: { duration: 8, repeat: Infinity },
          }}
          className="absolute top-1/3 left-[5%] w-[400px] h-[400px] bg-[#8b5cf6]/20 rounded-full blur-[120px]"
        />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              Für wen ist es?
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Agentify funktioniert für alle Teams.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto">
              Ob Sie Code ausliefern, Kampagnen durchführen, Deals abschliessen oder 
              den Betrieb koordinieren — Agentify verbindet die Punkte.
            </motion.p>
          </motion.div>

          <Tabs.Root value={activeTeam} onValueChange={(v) => setActiveTeam(v as keyof typeof teamUseCases)}>
            <Tabs.List className="flex justify-center gap-2 mb-12 flex-wrap">
              {Object.entries(teamUseCases).map(([key, value]) => (
                <Tabs.Trigger
                  key={key}
                  value={key}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTeam === key
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white shadow-lg shadow-[#8b5cf6]/30"
                      : "bg-[#0f0f1a]/80 backdrop-blur-sm text-white/60 hover:text-white border border-white/5 hover:border-white/10"
                  }`}
                >
                  {value.title}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {Object.entries(teamUseCases).map(([key, value]) => (
              <Tabs.Content key={key} value={key}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid lg:grid-cols-2 gap-12 items-center"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                    <p className="text-white/50 mb-6">{value.description}</p>
                    <ul className="space-y-3">
                      {value.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/70">
                          <Check className="w-5 h-5 text-[#10b981]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#8b5cf6]/10">
                    <Image
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030308]/90 via-[#030308]/20 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1.5 bg-[#8b5cf6]/90 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                        {value.title}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0a0a12]" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        {/* Gradient Accents */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent" />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              Was Kunden sagen
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white">
              Kunden lieben Agentify.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-6 bg-[#0f0f1a]/80 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-[#8b5cf6]/20 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 text-[#8b5cf6]" />
                  ))}
                </div>
                <p className="text-white/70 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-white/40 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Section with Image */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/agents/immobilien.jpg"
            alt="Security Background"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030308] via-[#030308]/95 to-[#030308]" />
        </div>

        {/* Animated Orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            transition: { duration: 10, repeat: Infinity },
          }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] bg-[#8b5cf6]/15 rounded-full blur-[150px]"
        />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
                Sicherheit
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-6">
                Von Anfang an für Enterprise-Sicherheit gebaut.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-white/50 mb-8">
                Agentify ist vollständig konform mit globalen Standards wie SOC 2 und DSGVO, 
                trainiert niemals mit Ihren Daten und besteht strenge Drittanbieter-Audits.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-[#0a0a12]/80 backdrop-blur-sm rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">SOC 2, DSGVO, CASA Tier 2</h4>
                    <p className="text-white/50 text-sm">Erfüllt und übertrifft weltweit anerkannte Sicherheitsstandards</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-[#0a0a12]/80 backdrop-blur-sm rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Unabhängig geprüft</h4>
                    <p className="text-white/50 text-sm">Über 193 Tests und 20 Kontrollen</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-[#0a0a12]/80 backdrop-blur-sm rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                    <Server className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Kein Training mit Ihren Daten</h4>
                    <p className="text-white/50 text-sm">Ihre Daten bleiben immer Ihre</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-[#0f0f1a]/90 to-[#16162a]/90 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-[#8b5cf6]/10">
                <div className="text-center p-8">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[#8b5cf6]/20 rounded-full blur-[60px]" />
                    <Shield className="w-24 h-24 text-[#8b5cf6] mx-auto relative" />
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <span className="px-4 py-2 bg-[#0a0a12] rounded-lg border border-[#8b5cf6]/20 text-white/70 text-sm font-semibold">SOC 2 Type 2</span>
                    <span className="px-4 py-2 bg-[#0a0a12] rounded-lg border border-[#8b5cf6]/20 text-white/70 text-sm font-semibold">DSGVO-konform</span>
                    <span className="px-4 py-2 bg-[#0a0a12] rounded-lg border border-[#8b5cf6]/20 text-white/70 text-sm font-semibold">CASA Tier 2</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Getting Started Section with Video */}
      <section className="py-24 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          >
            <source src="/videos/agentcalismaanimasyonu.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030308] via-[#0a0a12]/95 to-[#030308]" />
        </div>

        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            transition: { duration: 10, repeat: Infinity, ease: "easeInOut" as const },
          }}
          className="absolute top-1/4 left-[10%] w-[350px] h-[350px] bg-[#8b5cf6]/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
            transition: { duration: 12, repeat: Infinity, ease: "easeInOut" as const },
          }}
          className="absolute bottom-1/4 right-[10%] w-[300px] h-[300px] bg-[#3b82f6]/15 rounded-full blur-[80px]"
        />

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              Erste Schritte
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6">
              Einrichtung in Minuten.
              <br />
              <span className="text-white/40">Stunden sparen.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto">
              Es dauert weniger als einen Tag, um mit Agentify loszulegen.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { icon: Layers, title: "Apps verbinden", description: "Integrieren Sie mühelos 50+ Anwendungen und Datenspeicher.", color: "#8b5cf6" },
              { icon: Brain, title: "Gedächtnis generieren", description: "Agentify indexiert historische Daten und generiert Gedächtnis.", color: "#6366f1" },
              { icon: Zap, title: "2x schneller arbeiten", description: "Agentify arbeitet mit Ihnen über alle verbundenen Apps.", color: "#3b82f6" },
            ].map((step, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center group">
                <div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#3b82f6]/10 border border-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 relative"
                >
                  <div className="absolute inset-0 bg-[#8b5cf6]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon className="w-10 h-10 text-[#a78bfa] relative" />
                </div>
                <div className="text-[#8b5cf6] text-sm font-bold mb-2">Schritt {index + 1}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex justify-center gap-4 mt-12"
          >
            <Button size="lg" asChild>
              <Link href="/register">
                Agentify starten
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="backdrop-blur-sm">
              <Link href="/capabilities">Mehr erfahren</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#030308]" />
        <div className="absolute inset-0 bg-dots opacity-20" />

        <div className="container max-w-3xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4 block">
              FAQ
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white">
              Häufig gestellte Fragen
            </motion.h2>
          </motion.div>

          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <Accordion.Item
                key={index}
                value={`item-${index}`}
                className="bg-[#0a0a12]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden hover:border-[#8b5cf6]/20 transition-colors"
              >
                <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-5 text-left text-white font-medium hover:text-[#a78bfa] transition-colors group">
                  {item.question}
                  <ChevronDown className="w-5 h-5 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 pb-5 text-white/60 leading-relaxed">
                  {item.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      {/* Final CTA Section with Video */}
      <section className="py-32 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="/videos/swisstechshowcase.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030308] via-[#030308]/80 to-[#030308]" />
        </div>

        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            transition: { duration: 8, repeat: Infinity },
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/25 rounded-full blur-[180px]"
        />
        
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold text-white mb-6">
              Mehr erreichen mit Agentify.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/50 mb-10">
              Schliessen Sie sich Tausenden von Teams an, die bereits Agentify nutzen, um smarter zu arbeiten.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/register">
                  Agentify starten
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="backdrop-blur-sm">
                <Link href="/capabilities">Mehr erfahren</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
