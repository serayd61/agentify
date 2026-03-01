"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { ProposalBuilderForm } from "@/components/marketing/ProposalBuilderForm";
import { JobStatusBadge } from "@/components/marketing/JobStatusBadge";
import { ChevronLeft, FileText } from "lucide-react";

export default function ProposalsPage() {
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
              <FileText className="w-5 h-5 text-violet-400" />
              <h1 className="text-2xl font-bold text-white">Proposal Builder</h1>
            </div>
            <p className="text-sm text-white/50">
              Gib Kundendaten ein — Claude generiert ein professionelles PandaDoc-Angebot
              und sendet eine Follow-up-E-Mail.
            </p>
          </div>

          <Card>
            <ProposalBuilderForm onJobStarted={setActiveJobId} />
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

          <p className="text-xs text-white/25 text-center">
            Powered by{" "}
            <span className="text-white/40">Modal × Claude Opus 4.5 × PandaDoc</span>
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
