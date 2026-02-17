"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-4xl text-center space-y-12">
          <p className="text-6xl font-bold tracking-wide text-[#ff3b30]">404</p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold">Seite nicht gefunden</h1>
            <p className="text-white/60 text-lg">
              Die angeforderte Seite existiert nicht oder wurde verschoben.
              Versuchen Sie eine Suche oder kehren Sie zur Startseite zurück.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              placeholder="Wonach suchen Sie?"
              className="w-full rounded-[28px] border border-white/[0.08] bg-card px-12 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30]/40"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/">Zur Startseite</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/contact">Support kontaktieren</Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Marketplace", href: "/marketplace" },
              { title: "Pricing", href: "/pricing" },
              { title: "Kontakt", href: "/contact" },
              { title: "Support", href: "/support" },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-2xl border border-white/[0.08] bg-card p-5 text-sm text-white/70 hover:border-white/30 hover:text-white transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-2">Go</p>
                <p className="text-lg font-semibold text-white">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
