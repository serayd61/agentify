"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

const navigation = [
  { name: "Demo", href: "/demo" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Preise", href: "/pricing" },
  { name: "Kontakt", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-[#030308]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-lg blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Agentify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg transition-colors group"
              >
                {item.name}
                <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/[0.05] transition-colors" />
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                Agentify starten
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-white/[0.06] animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-base font-medium text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-white/[0.06]">
                <Button variant="secondary" asChild className="w-full">
                  <Link href="/login">Anmelden</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register">
                    Agentify starten
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
