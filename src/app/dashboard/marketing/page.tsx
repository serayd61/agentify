"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { MarketingActivityFeed } from "@/components/marketing/MarketingActivityFeed";
import { Users, FileText, Mail, ArrowRight, Zap } from "lucide-react";

const CARDS = [
  {
    href: "/dashboard/marketing/leads",
    icon: Users,
    title: "Lead Generation",
    description:
      "Scrape B2B-Leads via Google Maps & Apify. Mit E-Mail-Anreicherung und Geo-Filterung.",
    badge: "Apify",
    color: "from-blue-500/10",
  },
  {
    href: "/dashboard/marketing/proposals",
    icon: FileText,
    title: "Proposal Builder",
    description:
      "Erstelle professionelle PandaDoc-Angebote aus Kundendaten oder einem Gesprächstranskript.",
    badge: "PandaDoc",
    color: "from-violet-500/10",
  },
  {
    href: "/dashboard/marketing/email-automation",
    icon: Mail,
    title: "E-Mail Autoreply",
    description:
      "Claude antwortet automatisch auf Leads aus deinen Instantly-Kampagnen — mit deiner Knowledge Base.",
    badge: "Instantly × Claude",
    color: "from-emerald-500/10",
  },
];

export default function MarketingDashboard() {
  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 container max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#ff3b30]/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#ff3b30]" />
            </div>
            <span className="text-xs font-semibold text-[#ff3b30] uppercase tracking-wider">
              Marketing Automation
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Vertrieb auf Autopilot
          </h1>
          <p className="text-white/50 mt-2 max-w-xl">
            Leads generieren, Proposals erstellen und E-Mails automatisch beantworten —
            alles aus einem Dashboard.
          </p>
        </motion.div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={card.href} className="block h-full">
                <Card
                  hover
                  className={`h-full bg-gradient-to-br ${card.color} to-transparent cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.07] flex items-center justify-center">
                      <card.icon className="w-5 h-5 text-white/70" />
                    </div>
                    <span className="text-xs font-medium text-white/30 bg-white/[0.05] border border-white/[0.07] rounded-full px-2.5 py-0.5">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{card.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white/40 group-hover:text-white/70 transition-colors">
                    Starten
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Letzte Aktivitäten</h2>
          <MarketingActivityFeed />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
