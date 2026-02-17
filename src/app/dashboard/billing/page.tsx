"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import {
  Check,
  Download,
  ArrowRight,
  CreditCard,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const currentSubscription = {
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

const invoices = [
  { id: "INV-2025-001", date: "2025-01-10", amount: 399, status: "paid", description: "Business Plan - Monthly" },
  { id: "INV-2024-012", date: "2024-12-10", amount: 399, status: "paid", description: "Business Plan - Monthly" },
  { id: "INV-2024-011", date: "2024-11-10", amount: 399, status: "paid", description: "Business Plan - Monthly" },
  { id: "INV-2024-010", date: "2024-10-10", amount: 399, status: "paid", description: "Business Plan - Monthly" },
];

const plans = [
  {
    name: "Starter",
    price: 199,
    description: "Für kleine Teams",
    highlights: ["1 Agent", "2'500 Nachrichten", "E-Mail Support"],
    popular: false,
  },
  {
    name: "Business",
    price: 399,
    description: "Für wachsende KMU",
    highlights: ["3 Agenten", "WhatsApp", "Priority Support"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 899,
    description: "Individuelle Lösungen",
    highlights: ["Unbegrenzte Agenten", "Custom Integrationen", "Dedicated PM"],
    popular: false,
  },
];

const usageStats = [
  { label: "Nachrichten", value: "3'456", detail: "von 10'000" },
  { label: "Agenten", value: "2 / 3", detail: "aktiv" },
  { label: "Verfügbarkeit", value: "98%", detail: "Letzte 30 Tage" },
];

const paymentMethod = {
  brand: "Visa",
  last4: "4242",
  expiry: "05/26",
  holder: "Agentify GmbH",
};

export default function BillingPage() {
  const { toast } = useToast();

  const handleUpgrade = () =>
    toast({ title: "Plan wechseln", description: "Wir leiten Sie zum Upgrade weiter.", variant: "success" });
  const handleCancel = () =>
    toast({ title: "Abonnement kündigen", description: "Ihre Kündigung wird zum Monatsende aktiv.", variant: "success" });

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <Header />

      <motion.main
        className="flex-1 py-10"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <div className="container max-w-6xl space-y-10">
          <motion.section
            variants={fadeInUp}
            className="rounded-[32px] bg-card border border-white/[0.08] p-8 shadow-soft space-y-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Abrechnung</p>
                <h1 className="text-4xl font-bold">Aktuelle Übersicht</h1>
                <p className="text-white/60 mt-2">
                  Kontrollieren Sie Plan, Nutzung und Rechnungen an einem Ort.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" className="rounded-full" asChild>
                  <Link href="/dashboard/billing/statement">
                    <Download className="w-4 h-4" />
                    Kontoauszug
                  </Link>
                </Button>
                <Button variant="default" className="rounded-full" onClick={handleUpgrade}>
                  Upgrade
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-sm text-white/70">
              <div className="rounded-2xl bg-white/5 border border-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Plan</p>
                <p className="text-lg font-semibold text-white mt-2">{currentSubscription.plan}</p>
                <p className="text-white/40">{currentSubscription.currency} {currentSubscription.price}/Monat</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Nächste Abrechnung</p>
                <p className="text-lg font-semibold text-white mt-2">
                  {new Date(currentSubscription.nextBillingDate).toLocaleDateString("de-CH")}
                </p>
                <p className="text-white/40">{currentSubscription.status === "active" ? "Aktiv" : "Inaktiv"}</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Status</p>
                <p className="text-lg font-semibold text-[#34c759] mt-2">Gesichert</p>
                <p className="text-white/40">Priority Support & SLA</p>
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {usageStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-card border border-white/[0.08] p-4 shadow-soft">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-3">{stat.value}</p>
                  <p className="text-white/50 text-sm mt-1">{stat.detail}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
            <motion.div variants={fadeInUp} className="space-y-6">
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Aktueller Plan</h2>
                  <span className="text-xs uppercase tracking-[0.4em] text-white/40">#{currentSubscription.plan}</span>
                </div>
                <div className="rounded-3xl bg-white/5 border border-white/[0.06] p-6 space-y-3">
                  <p className="text-sm text-white/60">Features</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {currentSubscription.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-[#34c759]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default" className="rounded-full" onClick={handleUpgrade}>
                    Plan ändern
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={handleCancel}>
                    Abonnement kündigen
                  </Button>
                  <Button variant="ghost" className="rounded-full" asChild>
                    <Link href="/dashboard/billing/plans">Alle Pläne</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Letzte Rechnungen</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/billing/invoices">Alle anzeigen</Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/[0.05] p-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{invoice.description}</p>
                        <p className="text-xs text-white/50">
                          {new Date(invoice.date).toLocaleDateString("de-CH")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{invoice.amount} CHF</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${invoice.status === "paid" ? "bg-[#34c759]/15 text-[#34c759]" : "bg-[#f59e0b]/15 text-[#f59e0b]"}`}>
                          {invoice.status === "paid" ? "Bezahlt" : "Ausstehend"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-6">
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-[#ff3b30]" />
                  <h3 className="text-xl font-semibold">Zahlungsmethode</h3>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/[0.06] p-5 space-y-2">
                  <p className="text-sm text-white/60">{paymentMethod.brand} •••• {paymentMethod.last4}</p>
                  <p className="text-white text-lg font-semibold">{paymentMethod.holder}</p>
                  <p className="text-xs text-white/50">Ablauf: {paymentMethod.expiry}</p>
                </div>
                <Button className="w-full rounded-full" variant="outline">
                  Zahlungsmethode aktualisieren
                </Button>
                <Button className="w-full rounded-full" variant="ghost">
                  Rechnung per E-Mail erhalten
                </Button>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Weitere Pläne</h3>
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.name} className="rounded-2xl border border-white/[0.05] bg-white/5 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{plan.name}</p>
                        <p className="text-sm text-white/50">{plan.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs text-white/60">
                          {plan.highlights.map((item) => (
                            <span key={item} className="px-2 py-0.5 bg-white/10 rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">CHF {plan.price}</p>
                        <Button size="sm" variant="ghost" className="mt-3">
                          {plan.popular ? "Empfohlen" : "Details"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
