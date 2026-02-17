"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const supabase = createClient();

interface Sector {
  id: string;
  name_de: string;
  icon: string;
}

interface Package {
  id: string;
  name_de: string;
  tier: string;
  price_monthly: number;
  features: string[];
}

type FormData = {
  company: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  services: string;
  faqs: string;
  instructions: string;
};

const steps = [
  "Sektor",
  "Paket",
  "Firma",
  "Inhalt",
  "Zusammenfassung",
];

export default function AgentBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    company: "",
    address: "",
    phone: "",
    email: "",
    hours: "",
    services: "",
    faqs: "",
    instructions: "",
  });

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("sectors")
        .select("id, name_de, icon")
        .eq("is_active", true)
        .order("sort_order");
      setSectors(data || []);
      if (data?.[0]) {
        setSelectedSector(data[0].id);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedSector || !supabase) return;
    const loadPackages = async () => {
      const { data } = await supabase
        .from("packages")
        .select("id, name_de, tier, price_monthly, features:package_features(feature_name_de)")
        .eq("sector_id", selectedSector)
        .order("price_monthly");
      if (data) {
        setPackages(
          data.map((pkg) => ({
            id: pkg.id,
            name_de: pkg.name_de,
            tier: pkg.tier,
            price_monthly: pkg.price_monthly,
            features: pkg.features?.map((feat: { feature_name_de: string }) => feat.feature_name_de) || [],
          }))
        );
      }
    };
    loadPackages();
  }, [selectedSector]);

  const currentPackage = useMemo(() => packages.find((pkg) => pkg.id === selectedPackage), [packages, selectedPackage]);

  const handleCreate = async () => {
    if (!selectedSector || !selectedPackage) {
      toast({ title: "Auswahl fehlend", description: "Bitte wählen Sie zunächst Sektor und Paket.", variant: "warning" });
      return;
    }
    setIsSubmitting(true);
    try {
      const mutation = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector_id: selectedSector,
          package_id: selectedPackage,
          name: formData.company || "Neuer Agent",
          formData,
          content: { services: formData.services, faqs: formData.faqs },
        }),
      });
      const result = await mutation.json();
      if (!mutation.ok) {
        toast({ title: "Fehler", description: result.error ?? "Agent konnte nicht erstellt werden.", variant: "error" });
      } else {
        router.push("/dashboard/agents");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Fehler", description: "Agent konnte nicht gespeichert werden.", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#ff3b30]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <main className="flex-1 py-12">
        <div className="container space-y-10">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Agent Builder</p>
            <h1 className="text-4xl font-bold">Neuer Agent</h1>
            <p className="text-white/60">Prepare your sector-specific AI assistant in 5 easy steps.</p>
          </div>

          <div className="flex gap-3">
            {steps.map((label, index) => (
              <div key={label} className={`flex-1 rounded-full border ${index === step ? "border-[#ff3b30]" : "border-white/[0.08]"} px-4 py-2 text-xs uppercase tracking-[0.4em] text-center ${index === step ? "text-white" : "text-white/40"}`}>
                {label}
              </div>
            ))}
          </div>

          {step === 0 && (
            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Adım 1 – Sektor wählen</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left ${selectedSector === sector.id ? "border-[#ff3b30] bg-white/5" : "border-white/[0.08]"}`}
                    onClick={() => setSelectedSector(sector.id)}
                  >
                    <span className="text-2xl">{sector.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{sector.name_de}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Adım 2 – Paket wählen</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {packages.slice(0, 3).map((pkg) => (
                  <button
                    key={pkg.id}
                    className={`flex flex-col gap-2 rounded-3xl border p-4 text-left ${selectedPackage === pkg.id ? "border-[#ff3b30] bg-white/5" : "border-white/[0.08]"}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/40">{pkg.tier}</p>
                      {pkg.tier === "business" && <span className="text-xs px-2 py-1 rounded-full bg-[#ff3b30]/20 text-[#ff3b30]">Beliebt</span>}
                    </div>
                    <p className="text-2xl font-bold text-white">{pkg.name_de}</p>
                    <p className="text-lg text-white/60">CHF {pkg.price_monthly}/Monat</p>
                    <div className="flex-1 pt-2 space-y-1">
                      {pkg.features.slice(0, 3).map((feat) => (
                        <p key={feat} className="text-sm text-white/60">• {feat}</p>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Adım 3 – Firmeninfos</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {(
                  [
                    ["company", "Firma"],
                    ["address", "Adresse"],
                    ["phone", "Telefon"],
                    ["email", "E-Mail"],
                    ["hours", "Arbeitszeiten"],
                  ] as Array<[keyof FormData, string]>
                ).map(([key, label]) => (
                  <input
                    key={key}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={label}
                    className="w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-white focus:border-[#ff3b30]/50"
                  />
                ))}
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Adım 4 – Inhalt & FAQ</h2>
              <textarea
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                placeholder="Dienstleistungen"
                className="w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-white focus:border-[#ff3b30]/50"
              />
              <textarea
                value={formData.faqs}
                onChange={(e) => setFormData({ ...formData, faqs: e.target.value })}
                placeholder="FAQ (Frage - Antwort pro Zeile)"
                className="w-full rounded-2xl bg-[#12121c] border border-white/[0.08] px-4 py-3 text-white focus:border-[#ff3b30]/50"
              />
            </Card>
          )}

          {step === 4 && (
            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Adım 5 – Vorschau & Speichern</h2>
              <div className="space-y-2 text-sm text-white/60">
                <p>Firma: {formData.company}</p>
                <p>Paket: {currentPackage?.name_de ?? "—"}</p>
              </div>
              <Button className="rounded-full" onClick={handleCreate} isLoading={isSubmitting} disabled={isSubmitting}>
                Ajan Oluştur
              </Button>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((prev) => prev - 1)}>
              Zurück
            </Button>
            <Button
              variant="default"
              onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}
            >
              {step === steps.length - 1 ? "Fertig" : "Weiter"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
