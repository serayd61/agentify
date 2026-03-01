"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { AutoreplyToggle } from "@/components/marketing/AutoreplyToggle";
import { ChevronLeft, Mail, Info } from "lucide-react";

export default function EmailAutomationPage() {
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
              <Mail className="w-5 h-5 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white">E-Mail Autoreply</h1>
            </div>
            <p className="text-sm text-white/50">
              Claude antwortet automatisch auf Antworten aus deinen Instantly-Kampagnen —
              personalisiert und auf Basis deiner Knowledge Base.
            </p>
          </div>

          {/* Webhook setup info */}
          <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-300">Webhook-Setup</p>
              <p className="text-xs text-blue-300/70">
                Konfiguriere in Instantly als Reply-Webhook:
              </p>
              <code className="block text-xs font-mono text-blue-200/80 bg-blue-900/20 rounded px-2 py-1 mt-1">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/marketing/webhooks/instantly`
                  : "https://deine-domain.vercel.app/api/marketing/webhooks/instantly"}
              </code>
              <p className="text-xs text-blue-300/60 mt-1">
                Header:{" "}
                <code className="font-mono bg-blue-900/20 px-1 rounded">
                  x-webhook-secret: INSTANTLY_WEBHOOK_SECRET
                </code>
              </p>
            </div>
          </div>

          <Card>
            <AutoreplyToggle />
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
