"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Sector {
  id: string;
  slug: string;
  name_de: string;
  icon: string;
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
  messages_per_month: number;
  assistants_count: number;
  is_popular: boolean;
  features: PackageFeature[];
}

const supabase = createClient();

function PackageCard({ pkg, isYearly }: { pkg: Package; isYearly: boolean }) {
  return (
    <Card className="space-y-4 bg-card border border-white/[0.08]" hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">{pkg.tier}</p>
          <h3 className="text-2xl font-bold text-white">{pkg.name_de}</h3>
        </div>
        {pkg.is_popular && (
          <span className="px-3 py-1 text-xs font-semibold bg-[#ff3b30]/20 text-[#ff3b30] rounded-full">Beliebt</span>
        )}
      </div>
      <div>
        <p className="text-4xl font-bold text-white">
          CHF {isYearly && pkg.price_yearly ? Math.round(pkg.price_yearly / 12) : pkg.price_monthly}
          <span className="text-white/50 text-sm ml-2">/ Monat</span>
        </p>
        <p className="text-xs text-white/50 mt-1">
          {pkg.messages_per_month.toLocaleString()} Nachrichten • {pkg.assistants_count === -1 ? "Unlimitiert" : `${pkg.assistants_count} Agenten`}
        </p>
      </div>
      <div className="space-y-2">
        {pkg.features.slice(0, 4).map((feature) => (
          <div key={feature.feature_name_de} className="flex items-center gap-2 text-sm text-white/70">
            <span className={`w-3 h-3 rounded-full ${feature.is_included ? "bg-[#34c759]" : "bg-white/20"}`} />
            <span>{feature.feature_name_de}</span>
          </div>
        ))}
      </div>
      <Button className="w-full rounded-full" variant="default" asChild>
        <Link href={`/register?plan=${pkg.tier}`}>Jetzt starten</Link>
      </Button>
    </Card>
  );
}

export default function MarketplacePage() {
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
        .select("id, slug, name_de, icon")
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
        .select(`id, tier, name_de, price_monthly, price_yearly, messages_per_month, assistants_count, is_popular, features:package_features(feature_name_de, is_included, is_highlighted, sort_order)`)
        .eq("sector_id", selectedSector)
        .order("is_popular", { ascending: false })
        .order("price_monthly");
      if (data) {
        setPackages(data);
      }
    };
    loadPackages();
  }, [selectedSector]);

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
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Sektor auswählen</p>
            <div className="flex flex-wrap gap-3">
              {sectors.map((sector) => (
                <Button
                  key={sector.id}
                  variant={selectedSector === sector.id ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => setSelectedSector(sector.id)}
                >
                  {sector.icon} {sector.name_de}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
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
              <PackageCard key={pkg.id} pkg={pkg} isYearly={isYearly} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
