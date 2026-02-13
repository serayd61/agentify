"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  CreditCard,
  Download,
  ArrowRight,
  Check,
  AlertCircle,
  Calendar,
  TrendingUp,
  Zap,
  Settings,
  Plus,
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

interface Subscription {
  plan: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  status: "active" | "inactive" | "cancelled";
  nextBillingDate: string;
  features: string[];
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  description: string;
}

const currentSubscription: Subscription = {
  plan: "Business",
  price: 399,
  currency: "CHF",
  billingCycle: "monthly",
  status: "active",
  nextBillingDate: "2025-02-10",
  features: [
    "3 KI-Assistenten",
    "10'000 Nachrichten/Monat",
    "Priority Support",
    "WhatsApp-Integration",
    "Eigenes Branding",
  ],
};

const invoices: Invoice[] = [
  {
    id: "INV-2025-001",
    date: "2025-01-10",
    amount: 399,
    status: "paid",
    description: "Business Plan - Monthly",
  },
  {
    id: "INV-2024-012",
    date: "2024-12-10",
    amount: 399,
    status: "paid",
    description: "Business Plan - Monthly",
  },
  {
    id: "INV-2024-011",
    date: "2024-11-10",
    amount: 399,
    status: "paid",
    description: "Business Plan - Monthly",
  },
  {
    id: "INV-2024-010",
    date: "2024-10-10",
    amount: 399,
    status: "paid",
    description: "Business Plan - Monthly",
  },
];

const plans = [
  {
    name: "Starter",
    price: 199,
    description: "Für kleine Unternehmen",
    features: [
      "1 KI-Assistent",
      "2'500 Nachrichten/Monat",
      "E-Mail-Support",
      "Widget für Website",
    ],
    popular: false,
  },
  {
    name: "Business",
    price: 399,
    description: "Für wachsende KMU",
    features: [
      "3 KI-Assistenten",
      "10'000 Nachrichten/Monat",
      "Priority Support",
      "WhatsApp-Integration",
      "Eigenes Branding",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 899,
    description: "Für grössere Unternehmen",
    features: [
      "Unbegrenzte Assistenten",
      "50'000 Nachrichten/Monat",
      "Dedicated Support",
      "API-Zugang",
      "Custom Integrationen",
    ],
    popular: false,
  },
];

export default function BillingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"current" | "plans" | "invoices">("current");

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Upgrade gestartet",
      description: `Sie werden zum ${planName} Plan weitergeleitet.`,
      variant: "success",
    });
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Sind Sie sicher, dass Sie Ihr Abonnement kündigen möchten?")) {
      toast({
        title: "Abonnement gekündigt",
        description: "Ihr Abonnement wird am Ende des Abrechnungszeitraums beendet.",
        variant: "success",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex-1 py-12"
      >
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Abrechnung & Pläne</h1>
            <p className="text-white/60">Verwalten Sie Ihr Abonnement und sehen Sie Ihre Rechnungen.</p>
          </div>

          {/* Current Plan */}
          {activeTab === "current" && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <Card className="p-8 border-2 border-[#8b5cf6]/30 bg-[#8b5cf6]/5">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {currentSubscription.plan} Plan
                      </h2>
                      <p className="text-white/60">Aktiv seit Oktober 2024</p>
                    </div>
                    <div className="px-4 py-2 bg-[#34c759]/20 border border-[#34c759]/30 rounded-lg">
                      <p className="text-sm font-semibold text-[#34c759]">Aktiv</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-white/60 text-sm mb-2">Monatliche Gebühren</p>
                      <p className="text-4xl font-bold text-white">
                        {currentSubscription.currency} {currentSubscription.price}
                        <span className="text-lg font-normal text-white/60">/Monat</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-2">Nächste Abrechnung</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#8b5cf6]" />
                        <p className="text-lg font-semibold text-white">
                          {new Date(currentSubscription.nextBillingDate).toLocaleDateString(
                            "de-CH"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Inklusive Funktionen
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {currentSubscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-[#34c759] shrink-0" />
                          <span className="text-white/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={() => setActiveTab("plans")}
                      className="flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Zu anderem Plan wechseln
                    </Button>
                    <Button variant="secondary">
                      <Settings className="w-4 h-4" />
                      Zahlungsmethode
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelSubscription}
                      className="text-[#ff3b30] border-[#ff3b30]/30 hover:border-[#ff3b30]/50"
                    >
                      Abonnement kündigen
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Usage Stats */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Nutzung (Diesen Monat)</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80">Nachrichten</p>
                        <p className="text-sm text-white/60">3'456 / 10'000</p>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6]"
                          style={{ width: "34.56%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80">Assistenten</p>
                        <p className="text-sm text-white/60">2 / 3</p>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6]" style={{ width: "66.66%" }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Invoices Preview */}
              <motion.div variants={fadeInUp}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Letzte Rechnungen</h3>
                    <button
                      onClick={() => setActiveTab("invoices")}
                      className="text-[#8b5cf6] hover:text-[#a78bfa] text-sm font-medium transition-colors"
                    >
                      Alle anzeigen
                    </button>
                  </div>
                  <div className="space-y-2">
                    {invoices.slice(0, 3).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{invoice.description}</p>
                          <p className="text-xs text-white/50">
                            {new Date(invoice.date).toLocaleDateString("de-CH")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white">
                            {invoice.amount} CHF
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              invoice.status === "paid"
                                ? "bg-[#34c759]/20 text-[#34c759]"
                                : "bg-[#f59e0b]/20 text-[#f59e0b]"
                            }`}
                          >
                            {invoice.status === "paid" ? "Bezahlt" : "Ausstehend"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Plans Tab */}
          {activeTab === "plans" && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-3 gap-6"
            >
              {plans.map((plan, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card
                    className={`p-6 h-full flex flex-col ${
                      plan.popular
                        ? "border-2 border-[#8b5cf6] bg-[#8b5cf6]/5"
                        : "border-2 border-white/10"
                    }`}
                  >
                    {plan.popular && (
                      <div className="px-3 py-1 bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-full text-xs font-semibold text-[#8b5cf6] w-fit mb-4">
                        Beliebt
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/60 text-sm mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <p className="text-4xl font-bold text-white">
                        CHF {plan.price}
                        <span className="text-lg font-normal text-white/60">/Monat</span>
                      </p>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                          <span className="text-white/80 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "secondary"}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      {currentSubscription.plan === plan.name
                        ? "Aktueller Plan"
                        : "Wechseln"}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <motion.div variants={fadeInUp} className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{invoice.description}</p>
                      <p className="text-xs text-white/50">
                        {new Date(invoice.date).toLocaleDateString("de-CH")} • {invoice.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {invoice.amount} CHF
                        </p>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
                            invoice.status === "paid"
                              ? "bg-[#34c759]/20 text-[#34c759]"
                              : "bg-[#f59e0b]/20 text-[#f59e0b]"
                          }`}
                        >
                          {invoice.status === "paid" ? "Bezahlt" : "Ausstehend"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Tab Buttons */}
          <div className="mt-8 flex gap-2 border-t border-white/10 pt-6">
            <button
              onClick={() => setActiveTab("current")}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${
                activeTab === "current"
                  ? "bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Aktueller Plan
            </button>
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${
                activeTab === "plans"
                  ? "bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Alle Pläne
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${
                activeTab === "invoices"
                  ? "bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Rechnungen
            </button>
          </div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
