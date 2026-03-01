"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { LeadScraperForm } from "@/components/marketing/LeadScraperForm";
import { JobStatusBadge } from "@/components/marketing/JobStatusBadge";
import { ChevronLeft, Database, AlertTriangle } from "lucide-react";

export default function LeadsPage() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <Link
            href="/dashboard/marketing"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Marketing
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Lead Generation</h1>
            </div>
            <p className="text-sm text-white/50">
              Scrape B2B-Leads nach Branche und Standort. Ergebnisse landen in Google Sheets.
            </p>
          </div>

          {/* Warning about Modal slug */}
          <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80">
              Der Apify-Scraper-Slug muss noch in Modal deployed werden.
              Führe zuerst{" "}
              <code className="font-mono bg-white/10 px-1 rounded">
                modal deploy agents/execution/modal_webhook.py
              </code>{" "}
              aus, nachdem du den Slug in{" "}
              <code className="font-mono bg-white/10 px-1 rounded">
                agents/execution/webhooks.json
              </code>{" "}
              eingetragen hast.
            </p>
          </div>

          <Card>
            <LeadScraperForm onJobStarted={setActiveJobId} />
          </Card>

          {activeJobId && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <JobStatusBadge jobId={activeJobId} />
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
