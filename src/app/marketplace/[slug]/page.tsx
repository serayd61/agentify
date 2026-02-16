"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Star,
  Users,
  Zap,
  Check,
  Share2,
  Heart,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

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

// Mock agent data
const agentData = {
  "treuhand-assistent": {
    name: "Treuhand-Assistent",
    category: "Treuhand",
    icon: "📊",
    color: "#dc2626",
    rating: 4.8,
    reviews: 156,
    users: 1200,
    price: 199,
    description:
      "Ein professioneller KI-Assistent spezialisiert auf Treuhand- und Steuerfragen.",
    longDescription:
      "Der Treuhand-Assistent ist eine KI-Lösung, die speziell für Treuhand-Büros entwickelt wurde. Er beantwortet Kundenanfragen zu MWST, Buchhaltung, Steuererklärungen und mehr. Mit umfangreichen Schweizer Steuerkenntnissen ist er rund um die Uhr verfügbar.",
    features: [
      "24/7 Verfügbarkeit",
      "MWST-Berechnungen",
      "Buchhaltungs-Support",
      "Terminbuchungen",
      "Kundenanfragen filtern",
      "Mehrsprachig (DE, FR, IT)",
    ],
    highlights: [
      {
        icon: "⚡",
        title: "Blitzschnell",
        description: "Durchschnittliche Antwortzeit unter 2 Sekunden",
      },
      {
        icon: "🎯",
        title: "Präzise",
        description: "Spezialisiert auf Schweizer Steuergesetzgebung",
      },
      {
        icon: "🔒",
        title: "Sicher",
        description: "Alle Daten bleiben in der Schweiz gespeichert",
      },
    ],
    useCases: [
      "Automatische Beantwortung von FAQ",
      "Terminbuchungen und Nachverfolgung",
      "Komplexe Anfragen filtern",
      "Kundenservice 24/7",
      "Reduktion der Telefonbelastung",
    ],
    testimonials: [
      {
        author: "Thomas M.",
        company: "Treuhand Müller AG",
        text: "Seit der Implementierung verpassen wir keine Kundenanfragen mehr. Der Agent ist unglaublich zuverlässig.",
        rating: 5,
      },
      {
        author: "Sandra K.",
        company: "Steuerberatung Küsnacht",
        text: "Die Qualität der Antworten ist beeindruckend. Unsere Kunden sind sehr zufrieden.",
        rating: 5,
      },
      {
        author: "Marco B.",
        company: "TreuhandBrunner GmbH",
        text: "Gutes Preis-Leistungs-Verhältnis. Der Support ist ausgezeichnet.",
        rating: 4,
      },
    ],
    setup: [
      "1. Melden Sie sich auf Agentify an",
      "2. Wählen Sie den Treuhand-Assistenten",
      "3. Passen Sie die FAQ und Antworten an",
      "4. Kopieren Sie den Widget-Code",
      "5. Starten Sie mit Live-Daten",
    ],
  },
  "zahnarzt-praxis": {
    name: "Zahnarzt-Assistent",
    category: "Gesundheit",
    icon: "🦷",
    color: "#10b981",
    rating: 4.9,
    reviews: 243,
    users: 1500,
    price: 249,
    description:
      "Spezialisierter KI-Assistent für Zahnarztpraxen mit Terminbuchung.",
    longDescription:
      "Der Zahnarzt-Assistent automatisiert die Patientenkommunikation in Zahnarztpraxen. Er bucht Termine, beantwortet Fragen zur Behandlung und sendet Reminders.",
    features: [
      "Online-Terminbuchung",
      "Automatische Erinnerungen",
      "Fragen zur Behandlung",
      "Notfall-Support",
      "Mehrsprachig",
      "Integration mit Praxissoftware",
    ],
    highlights: [
      {
        icon: "📅",
        title: "Automatische Terminbuchung",
        description: "Patienten buchen selbst ihre Termine online",
      },
      {
        icon: "📱",
        title: "WhatsApp Integration",
        description: "Direkte Kommunikation über WhatsApp möglich",
      },
      {
        icon: "🎯",
        title: "Spezialisiert",
        description: "Spezifisches Wissen für Zahnarztpraxen",
      },
    ],
    useCases: [
      "Terminbuchungen",
      "Patientenanfragen",
      "Erinnerungsservice",
      "FAQ-Beantwortung",
      "Telefonbelastung reduzieren",
    ],
    testimonials: [
      {
        author: "Dr. Sandra K.",
        company: "Zahnarztpraxis Küsnacht",
        text: "Die Online-Terminbuchung hat unsere Telefonzeit um 60% reduziert.",
        rating: 5,
      },
    ],
    setup: [
      "1. Registrierung",
      "2. Zahnarzt-Template wählen",
      "3. Öffnungszeiten eintragen",
      "4. Behandlungsarten definieren",
      "5. Widget einbinden",
    ],
  },
};

interface AgentInfo {
  [key: string]: {
    name: string;
    category: string;
    icon: string;
    color: string;
    rating: number;
    reviews: number;
    users: number;
    price: number;
    description: string;
    longDescription: string;
    features: string[];
    highlights: Array<{ icon: string; title: string; description: string }>;
    useCases: string[];
    testimonials: Array<{
      author: string;
      company: string;
      text: string;
      rating: number;
    }>;
    setup: string[];
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);

  const slug = params.slug as string;
  const agent = (agentData as AgentInfo)[slug];

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#05050a] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-[#ff3b30] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Agent nicht gefunden</h2>
            <p className="text-white/60 mb-6">
              Der gesuchte Agent konnte nicht gefunden werden.
            </p>
            <Button asChild>
              <Link href="/marketplace">Zurück zum Marketplace</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleInstall = () => {
    toast({
      title: "Erfolg",
      description: "Agent wurde installiert. Sie werden zur Konfiguration weitergeleitet.",
      variant: "success",
    });
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex-1"
      >
        {/* Hero */}
        <section className="py-12 border-b border-white/10">
          <div className="container">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Marketplace
            </Link>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Agent Info */}
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="md:col-span-2 space-y-6">
                {/* Header */}
                <motion.div variants={fadeInUp}>
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-6xl">{agent.icon}</span>
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold text-white mb-2">
                        {agent.name}
                      </h1>
                      <p className="text-white/60 mb-4">{agent.description}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(agent.rating)
                                    ? "fill-[#f59e0b] text-[#f59e0b]"
                                    : "text-white/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {agent.rating}
                          </span>
                          <span className="text-sm text-white/50">
                            ({agent.reviews} Bewertungen)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <Users className="w-4 h-4" />
                          {agent.users.toLocaleString()} Nutzer
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Long Description */}
                <motion.div variants={fadeInUp} className="p-6 bg-white/[0.02] rounded-lg border border-white/10">
                  <p className="text-white/80 leading-relaxed">
                    {agent.longDescription}
                  </p>
                </motion.div>

                {/* Features */}
                <motion.div variants={fadeInUp}>
                  <h2 className="text-2xl font-bold text-white mb-4">Funktionen</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {agent.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/10 hover:border-[#8b5cf6]/30 transition-all"
                      >
                        <Check className="w-5 h-5 text-[#34c759] shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Highlights */}
                <motion.div variants={fadeInUp}>
                  <h2 className="text-2xl font-bold text-white mb-4">Highlights</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {agent.highlights.map((highlight, index) => (
                      <Card key={index} className="p-4">
                        <span className="text-3xl mb-2 block">{highlight.icon}</span>
                        <h3 className="font-semibold text-white mb-1">{highlight.title}</h3>
                        <p className="text-sm text-white/60">{highlight.description}</p>
                      </Card>
                    ))}
                  </div>
                </motion.div>

                {/* Use Cases */}
                <motion.div variants={fadeInUp}>
                  <h2 className="text-2xl font-bold text-white mb-4">Use Cases</h2>
                  <div className="space-y-2">
                    {agent.useCases.map((useCase, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/10"
                      >
                        <Zap className="w-4 h-4 text-[#8b5cf6] shrink-0" />
                        <span className="text-white/80">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Setup */}
                <motion.div variants={fadeInUp}>
                  <h2 className="text-2xl font-bold text-white mb-4">Setup in 5 Schritten</h2>
                  <div className="space-y-3">
                    {agent.setup.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-[#8b5cf6]">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-white/80 pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Testimonials */}
                {agent.testimonials.length > 0 && (
                  <motion.div variants={fadeInUp}>
                    <h2 className="text-2xl font-bold text-white mb-4">Kundenbewertungen</h2>
                    <div className="space-y-4">
                      {agent.testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-6">
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating
                                    ? "fill-[#f59e0b] text-[#f59e0b]"
                                    : "text-white/30"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-white/80 mb-3">&ldquo;{testimonial.text}&rdquo;</p>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {testimonial.author}
                            </p>
                            <p className="text-xs text-white/50">{testimonial.company}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Sidebar - Purchase */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="md:col-span-1"
              >
                <motion.div variants={fadeInUp} className="sticky top-24">
                  <Card className="p-6 border-2 border-[#8b5cf6]/30 bg-[#8b5cf6]/5">
                    {/* Price */}
                    <div className="mb-6">
                      <p className="text-white/60 text-sm mb-2">Preis</p>
                      <p className="text-4xl font-bold text-white">
                        CHF {agent.price}
                        <span className="text-lg font-normal text-white/60">/Monat</span>
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        Keine Einrichtungskosten
                      </p>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full mb-3"
                      onClick={handleInstall}
                    >
                      <Zap className="w-4 h-4" />
                      Agent installieren
                    </Button>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsFavorited(!isFavorited)}
                        className={isFavorited ? "border-[#f59e0b]/50" : ""}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFavorited ? "fill-[#f59e0b]" : ""}`}
                        />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 p-4 bg-white/[0.02] rounded-lg border border-white/10 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                        <span>14 Tage kostenlos testen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                        <span>Jederzeit kündbar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </motion.main>

      <Footer />
    </div>
  );
}
