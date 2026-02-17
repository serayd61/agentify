"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ArrowRight, Check } from "lucide-react";

const steps = ["Sektor", "Paket", "Firma", "Inhalt", "Zusammenfassung"];

const SECTOR_OPTIONS = [
  {
    id: "treuhand",
    name: "Treuhand & Finanzen",
    icon: "📊",
    description: "Steuern, MWST & Jahresabschlüsse automatisieren.",
  },
  {
    id: "handwerk",
    name: "Handwerk & Technik",
    icon: "🔧",
    description: "Pikett, Termine und Materialflüsse im Chat steuern.",
  },
  {
    id: "gesundheit",
    name: "Gesundheit & Praxis",
    icon: "🏥",
    description: "Terminvergabe, Rezepte und Notfälle zuverlässig abdecken.",
  },
  {
    id: "gastronomie",
    name: "Gastronomie",
    icon: "🍽️",
    description: "Reservierungen, Specials und Menüfragen schlau beantworten.",
  },
  {
    id: "immobilien",
    name: "Immobilien & Verwaltung",
    icon: "🏠",
    description: "Besichtigungen, Finanzierung und Leads professionell managen.",
  },
];

const PLAN_OPTIONS = [
  {
    id: "starter",
    title: "Starter",
    price: "CHF 290",
    description: "Ideal für Solo-Unternehmer und Pilotprojekte.",
    features: ["50 Gespräche/Monat", "Basis-Widget", "Einfaches Reporting"],
    tier: "basic",
  },
  {
    id: "business",
    title: "Business",
    price: "CHF 590",
    description: "Für wachsende Teams mit hohem Volumen.",
    features: ["300 Gespräche/Monat", "Widget + Dashboard", "Analytics Dashboard"],
    tier: "business",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    price: "Auf Anfrage",
    description: "Custom-Prompts, SLA & dedizierter Support.",
    features: ["Unlimitierte Gespräche", "Premium Support", "Individuelle Integrationen"],
    tier: "enterprise",
  },
];

const COMPARISON_FEATURES = [
  { label: "Konversationen", values: ["50", "300", "∞"] },
  { label: "Widget Branding", values: ["Agentify Branding", "Custom Logo", "Weiß-label"] },
  { label: "Analytics", values: ["Basic", "Dashboard", "Advanced"] },
  { label: "Support", values: ["Self-Service", "Priority", "Dedicated"] },
];

const COMPANY_FIELDS: Array<{ key: keyof CompanyInfo; label: string }> = [
  { key: "name", label: "Agent- oder Firmenname" },
  { key: "address", label: "Adresse" },
  { key: "phone", label: "Telefon" },
  { key: "website", label: "Website" },
  { key: "email", label: "E-Mail" },
];

type CompanyInfo = {
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  logoName?: string;
};

type ContentInfo = {
  welcome: string;
  hours: string;
  contactEmail: string;
  contactPhone: string;
};

type FAQEntry = {
  question: string;
  answer: string;
};

export default function AgentBuilderPage() {
  const router = useRouter();
  const toast = useToast().toast;
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState(SECTOR_OPTIONS[0]);
  const [plan, setPlan] = useState(PLAN_OPTIONS[1]);
  const [company, setCompany] = useState<CompanyInfo>({
    name: "",
    address: "",
    phone: "",
    website: "",
    email: "",
  });
  const [content, setContent] = useState<ContentInfo>({
    welcome: "",
    hours: "Mo–Fr 08:00–18:00",
    contactEmail: "",
    contactPhone: "",
  });
  const [faqs, setFaqs] = useState<FAQEntry[]>([
    { question: "Was kostet die Dienstleistung?", answer: "" },
    { question: "Wie läuft die Termineinbuchung ab?", answer: "" },
  ]);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceedToNextStep = (targetStep: number) => {
    if (targetStep === 1) return Boolean(sector);
    if (targetStep === 2) return Boolean(plan);
    if (targetStep === 3) return Boolean(company.name && company.email);
    if (targetStep === 4) return Boolean(content.welcome && content.contactEmail);
    return true;
  };

  const onFaqChange = (index: number, field: keyof FAQEntry, value: string) => {
    setFaqs((prev) => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };

  const addFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const summaryRows = useMemo(
    () => [
      { label: "Sektor", value: sector.name },
      { label: "Paket", value: `${plan.title} · ${plan.price}` },
      { label: "Firma", value: `${company.name || "-"} · ${company.website || "-"}` },
      { label: "Kontakt", value: `${content.contactEmail || "-"} · ${content.contactPhone || "-"}` },
    ],
    [sector, plan, company, content]
  );

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/agent-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: sector.id,
          plan: plan.id,
          company,
          logoName,
          content,
          faqs: faqs.filter((entry) => entry.question && entry.answer),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Der Agent konnte nicht erstellt werden.");
      }
      toast({ title: "Agent wird erstellt", description: "Wir melden uns, sobald Ihr Agent bereitsteht.", variant: "success" });
      router.push("/dashboard/agents");
    } catch (submissionError) {
      console.error("Agent Builder", submissionError);
      setError(submissionError instanceof Error ? submissionError.message : "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoName(file ? file.name : null);
  };

  const switchStep = (nextStep: number) => {
    if (nextStep < 0 || nextStep >= steps.length) return;
    if (nextStep > step && !canProceedToNextStep(nextStep)) return;
    setStep(nextStep);
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white py-12">
      <div className="container max-w-6xl space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Agent Builder</p>
          <h1 className="text-4xl font-bold">Neuen Agenten konfigurieren</h1>
          <p className="text-white/60">5 Schritte bis zur Demo-Instanz. Alles in Schweizer Optik.</p>
        </div>
        <div className="rounded-full border border-white/[0.1] flex overflow-hidden text-[10px] uppercase tracking-[0.4em] text-white/60">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => switchStep(index)}
              className={`flex-1 px-3 py-2 transition ${index <= step ? "bg-white/[0.08] text-white" : "bg-transparent"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {step === 0 && (
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">1. Sektor wählen</h2>
                <span className="text-xs text-white/50">Branchenspezifische Startkonfiguration</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {SECTOR_OPTIONS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSector(entry)}
                    className={`group rounded-3xl border p-5 text-left transition ${
                      sector.id === entry.id
                        ? "border-[#ff3b30] bg-white/5"
                        : "border-white/[0.08] hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{entry.icon}</span>
                      <div>
                        <p className="text-lg font-semibold text-white">{entry.name}</p>
                        <p className="text-xs text-white/60">{entry.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">2. Paket wählen</h2>
                <span className="text-xs text-white/50">Plan, Preis und Features</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {PLAN_OPTIONS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setPlan(entry)}
                    className={`group flex flex-col gap-3 rounded-[28px] border p-5 text-left transition ${
                      plan.id === entry.id
                        ? "border-[#ff3b30] bg-white/5"
                        : "border-white/[0.08] hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/50">{entry.tier}</p>
                      {entry.id === "business" && <span className="text-xs px-2 py-1 rounded-full bg-[#ff3b30]/20 text-[#ff3b30]">Beliebt</span>}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{entry.title}</h3>
                      <p className="text-3xl font-semibold text-white/90">{entry.price}</p>
                      <p className="text-sm text-white/60 mt-1">{entry.description}</p>
                    </div>
                    <ul className="space-y-1 text-sm text-white/60">
                      {entry.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#ff3b30]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white/70">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.4em] text-white/40">
                      <th className="pb-2">Feature</th>
                      {PLAN_OPTIONS.map((entry) => (
                        <th key={entry.id} className="pb-2 text-center">{entry.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((feature) => (
                      <tr key={feature.label} className="border-t border-white/[0.08]">
                        <td className="py-2 text-white/80">{feature.label}</td>
                        {feature.values.map((value, colIndex) => (
                          <td key={`${feature.label}-${colIndex}`} className="py-2 text-center">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">3. Firma</h2>
                <span className="text-xs text-white/50">Marke, Adresse und Kommunikation</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {COMPANY_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">{label}</label>
                    <input
                      type="text"
                      value={company[key]}
                      onChange={(e) => setCompany({ ...company, [key]: e.target.value })}
                      className="mt-2 w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#ff3b30]/50 focus:ring-1 focus:ring-[#ff3b30]/30"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">Logo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-[#09090f] px-4 py-3 text-sm text-white"
                />
                {logoName && <p className="mt-1 text-xs text-white/50">Ausgewählt: {logoName}</p>}
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">4. Inhalt</h2>
                <span className="text-xs text-white/50">FAQ, Begrüssung & Kontakte</span>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">Begrüssungsnachricht</label>
                <textarea
                  value={content.welcome}
                  onChange={(e) => setContent({ ...content, welcome: e.target.value })}
                  rows={4}
                  placeholder="Grüezi! Ich bin Ihr digitaler Assistent ..."
                  className="w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#ff3b30]/50 focus:ring-1 focus:ring-[#ff3b30]/30"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">Öffnungszeiten</label>
                  <input
                    type="text"
                    value={content.hours}
                    onChange={(e) => setContent({ ...content, hours: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">Kontakt-E-Mail</label>
                  <input
                    type="email"
                    value={content.contactEmail}
                    onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">Kontakt-Telefon</label>
                  <input
                    type="text"
                    value={content.contactPhone}
                    onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
                    className="mt-2 w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-sm text-white"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">FAQ-Fragen</p>
                  <Button size="sm" variant="ghost" onClick={addFaq}>
                    Frage hinzufügen
                  </Button>
                </div>
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={`${faq.question}-${index}`} className="rounded-2xl border border-white/[0.08] bg-[#0b0b15] p-4 space-y-2">
                      <input
                        type="text"
                        placeholder="Frage"
                        value={faq.question}
                        onChange={(e) => onFaqChange(index, "question", e.target.value)}
                        className="w-full rounded-xl bg-[#12121c] border border-white/[0.08] px-3 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="Antwort"
                        value={faq.answer}
                        onChange={(e) => onFaqChange(index, "answer", e.target.value)}
                        className="w-full rounded-xl bg-[#12121c] border border-white/[0.08] px-3 py-2 text-sm text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">5. Zusammenfassung</h2>
                <span className="text-xs text-white/50">Alles prüfen & Agent erstellen</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {summaryRows.map((row) => (
                  <div key={row.label} className="rounded-2xl border border-white/[0.08] bg-[#0b0b15] p-4">
                    <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">{row.label}</p>
                    <p className="text-lg font-semibold text-white mt-2">{row.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">FAQ-Vorschau</p>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  {faqs.filter((entry) => entry.question && entry.answer).map((faq) => (
                    <li key={faq.question} className="rounded-2xl border border-white/[0.08] bg-[#12121c] p-3">
                      <p className="font-semibold text-white">{faq.question}</p>
                      <p className="text-white/60">{faq.answer}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {error && (
                <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button
                  variant="default"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Agent erstellen
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-xs text-white/50">
                  Alle Daten werden live an Supabase gesendet und als Customer Agent gespeichert. Wir benachrichtigen Sie per E-Mail.
                </p>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => switchStep(step - 1)} disabled={step === 0}>
              Zurück
            </Button>
            {step < steps.length - 1 && (
              <Button variant="default" onClick={() => switchStep(step + 1)}>
                Weiter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
