"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PurchaseButton from "@/components/PurchaseButton";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Sector {
  id: string;
  name_de: string;
}

interface PackageFeature {
  feature_name_de: string;
  is_included: boolean;
  is_highlighted: boolean;
}

interface Package {
  id: string;
  tier: string;
  name_de: string;
  price_monthly: number;
  price_yearly: number | null;
  is_popular: boolean;
  features: PackageFeature[];
}

const supabase = createClient();

export default function PricingPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("sectors")
        .select("id, name_de")
        .eq("is_active", true)
        .order("sort_order");
      if (data) {
        setSectors(data);
        setSelectedSector(data[0]?.id ?? null);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedSector || !supabase) return;
    const loadPackages = async () => {
      const { data } = await supabase
        .from("packages")
        .select(
          "id, tier, name_de, price_monthly, price_yearly, is_popular, features:package_features(feature_name_de, is_included, is_highlighted, sort_order)"
        )
        .eq("sector_id", selectedSector)
        .order("price_monthly");
      if (data) {
        setPackages(data);
      }
    };
    loadPackages();
  }, [selectedSector]);

  const featureRows = useMemo(() => {
    const map = new Map<string, PackageFeature>();
    packages.forEach((pkg) => {
      pkg.features.forEach((feature) => {
        if (!map.has(feature.feature_name_de)) {
          map.set(feature.feature_name_de, feature);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.feature_name_de.localeCompare(b.feature_name_de));
  }, [packages]);

  const displayPackages = useMemo(() => packages.slice(0, 3), [packages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#ff3b30]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <Header />

      <section className="py-20">
        <div className="container space-y-8">
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Sektor auswählen</p>
            <select
              className="w-full max-w-sm rounded-full bg-card border border-white/[0.08] px-4 py-2 text-white"
              value={selectedSector ?? ""}
              onChange={(e) => setSelectedSector(e.target.value || null)}
            >
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name_de}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.4em] text-white/50">Abrechnung</span>
            <Button
              variant={isYearly ? "ghost" : "default"}
              className="rounded-full"
              onClick={() => setIsYearly(false)}
            >
              Monatlich
            </Button>
            <Button
              variant={isYearly ? "default" : "ghost"}
              className="rounded-full"
              onClick={() => setIsYearly(true)}
            >
              Jährlich
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {displayPackages.map((pkg) => (
              <Card key={pkg.id} className="space-y-4 bg-card border border-white/[0.08]" hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">{pkg.tier}</p>
                    <h3 className="text-2xl font-bold text-white">{pkg.name_de}</h3>
                  </div>
                  {pkg.is_popular && (
                    <span className="px-3 py-1 text-xs font-semibold bg-[#ff3b30]/20 text-[#ff3b30] rounded-full">
                      Beliebt
                    </span>
                  )}
                </div>
                <p className="text-4xl font-bold text-white">
                  CHF {isYearly && pkg.price_yearly ? Math.round(pkg.price_yearly / 12) : pkg.price_monthly}
                  <span className="text-white/50 text-sm ml-2">/ Monat</span>
                </p>
                <div className="space-y-2">
                  {pkg.features.slice(0, 4).map((feature) => (
                    <div key={feature.feature_name_de} className="flex items-center gap-2 text-sm text-white/70">
                      <span
                        className={`w-3 h-3 rounded-full ${feature.is_included ? "bg-[#34c759]" : "bg-white/20"}`}
                      />
                      <span>{feature.feature_name_de}</span>
                    </div>
                  ))}
                </div>
                <PurchaseButton
                  packageId={pkg.id}
                  sectorId={selectedSector ?? ""}
                  billingCycle={isYearly ? "yearly" : "monthly"}
                  className="w-full rounded-full bg-gradient-to-r from-[#ff6b53] via-[#ff3b30] to-[#c11b21] text-white font-semibold py-3"
                  disabled={!selectedSector}
                >
                  Jetzt starten
                </PurchaseButton>
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-card border border-white/[0.08]">
            <h3 className="text-xl font-semibold text-white mb-4">Feature-Vergleich</h3>
            <div className="grid gap-3">
              {featureRows.map((feature) => (
                <div key={feature.feature_name_de} className="flex items-center justify-between border-b border-white/[0.04] py-3">
                  <span>{feature.feature_name_de}</span>
                  <div className="flex items-center gap-3">
                    {displayPackages.map((pkg) => {
                      const included = pkg.features.some((f) => f.feature_name_de === feature.feature_name_de && f.is_included);
                      return (
                        <span
                          key={`${pkg.id}-${feature.feature_name_de}`}
                          className={`w-5 h-5 rounded-full ${included ? "bg-[#34c759]" : "bg-white/10"}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
