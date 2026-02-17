"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { categories, agentTemplates, getAgentsByCategory } from "@/lib/data/agents";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Star,
  Users,
  ArrowRight,
  Filter,
  X,
  Sparkles,
  TrendingUp,
  Check,
  Loader2,
} from "lucide-react";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredAgents = useMemo(() => {
    let agents = [...agentTemplates];

    if (selectedCategory) {
      agents = agents.filter((agent) => agent.categorySlug === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      agents = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.category.toLowerCase().includes(query)
      );
    }

    if (priceRange) {
      switch (priceRange) {
        case "low":
          agents = agents.filter((agent) => agent.priceMonthly < 250);
          break;
        case "mid":
          agents = agents.filter(
            (agent) => agent.priceMonthly >= 250 && agent.priceMonthly < 350
          );
          break;
        case "high":
          agents = agents.filter((agent) => agent.priceMonthly >= 350);
          break;
      }
    }

    return agents;
  }, [selectedCategory, searchQuery, priceRange]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setPriceRange(null);
  };

  const hasActiveFilters = selectedCategory || searchQuery || priceRange;

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden flex-1 bg-gradient-to-b from-[#05050a] to-[#05050a]">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ WebkitTransform: 'translateZ(0)' }}
          >
            <source src="/videos/agentcalismaanimasyonu.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,48,0.3),_transparent_45%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05050a]/90" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
              <Sparkles className="w-4 h-4 text-[#ff3b30]" />
              <span className="text-sm font-medium text-white/60">40+ Agents verfügbar</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-display)]">
              Agent Marketplace
            </h1>
            <p className="text-lg text-white/50 mb-10">
              Finden Sie den perfekten KI-Assistenten für Ihre Branche.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Agent suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#12121c] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff3b30]/50 focus:shadow-[0_0_0_4px_rgba(255,59,48,0.1)] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-28 space-y-6">
                {/* Categories */}
                <div className="bg-card rounded-2xl border border-white/[0.08] p-6">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] mb-5">
                    Kategorien
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                        !selectedCategory
                          ? "bg-[#ff3b30]/10 text-[#ff6b5e] border border-[#ff3b30]/20"
                          : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <span>Alle Kategorien</span>
                      <span className="text-white/30">{agentTemplates.length}</span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                          selectedCategory === category.slug
                            ? "bg-[#ff3b30]/10 text-[#ff6b5e] border border-[#ff3b30]/20"
                            : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                        <span className="text-white/30">
                          {getAgentsByCategory(category.slug).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="bg-card rounded-2xl border border-white/[0.08] p-6">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] mb-5">
                    Preis
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: null, label: "Alle Preise" },
                      { value: "low", label: "Unter CHF 250/Mo." },
                      { value: "mid", label: "CHF 250-350/Mo." },
                      { value: "high", label: "Über CHF 350/Mo." },
                    ].map((option) => (
                      <button
                        key={option.value || "all"}
                        onClick={() => setPriceRange(option.value)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                          priceRange === option.value
                            ? "bg-[#ff3b30]/10 text-[#ff6b5e] border border-[#ff3b30]/20"
                            : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            priceRange === option.value
                              ? "border-[#ff3b30]"
                              : "border-white/20"
                          }`}
                        >
                          {priceRange === option.value && (
                            <div className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                          )}
                        </div>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-[#ff3b30] hover:bg-[#ff3b30]/5 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Filter zurücksetzen
                  </button>
                )}
              </div>
            </aside>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1"
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-2 w-5 h-5 rounded-full bg-[#ff3b30] text-white text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Agents Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-white/50">
                  <span className="font-semibold text-white">{filteredAgents.length}</span>{" "}
                  Agents gefunden
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff3b30]/10 text-[#ff6b5e] rounded-full text-sm border border-[#ff3b30]/20"
                  >
                    {categories.find((c) => c.slug === selectedCategory)?.icon}{" "}
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filteredAgents.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAgents.map((agent) => (
                    <Link key={agent.id} href={`/marketplace/${agent.slug}`}>
                      <Card hover className="h-full flex flex-col">
                        <div className="flex items-start justify-between mb-5">
                          {agent.image ? (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#0a0a12]">
                              <Image
                                src={agent.image}
                                alt={agent.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ff3b30]/20 to-[#ff9500]/20 flex items-center justify-center text-4xl">
                              {agent.icon}
                            </div>
                          )}
                          <div className="flex gap-2">
                            {agent.isNew && (
                              <span className="px-3 py-1 text-xs font-semibold bg-[#34c759]/15 text-[#34c759] rounded-full border border-[#34c759]/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Neu
                              </span>
                            )}
                            {agent.isPopular && (
                              <span className="px-3 py-1 text-xs font-semibold bg-[#ffd60a]/15 text-[#ffd60a] rounded-full border border-[#ffd60a]/30 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Beliebt
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-display)]">
                            {agent.name}
                          </h3>
                          <p className="text-sm text-white/40 mb-4">
                            {agent.category}
                          </p>
                          <p className="text-white/50 text-sm mb-5 line-clamp-2">
                            {agent.description}
                          </p>

                          <div className="space-y-2 mb-5">
                            {agent.features.slice(0, 3).map((feature, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2.5 text-sm text-white/50"
                              >
                                <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                                <span className="line-clamp-1">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-5 mb-5 text-sm text-white/40">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-[#ffd60a] fill-[#ffd60a]" />
                            <span className="text-white">{agent.rating}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{agent.userCount} Nutzer</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-white/[0.06]">
                          <div>
                            <span className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
                              {formatPrice(agent.priceMonthly)}
                            </span>
                            <span className="text-white/40">/Mo.</span>
                          </div>
                          <Button size="sm">
                            Details
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                    <Search className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-display)]">
                    Keine Agents gefunden
                  </h3>
                  <p className="text-white/50 mb-8">
                    Versuchen Sie es mit anderen Suchbegriffen oder Filtern
                  </p>
                  <Button variant="secondary" onClick={clearFilters}>
                    Filter zurücksetzen
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#ff3b30]" />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MarketplaceContent />
    </Suspense>
  );
}
