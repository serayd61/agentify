"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  items: FooterLink[];
}

const footerLinks: Record<string, FooterSection> = {
  unternehmen: {
    title: "Unternehmen",
    items: [
      { name: "Über uns", href: "https://swissdigital.life", external: true },
      { name: "Kontakt", href: "/contact" },
      { name: "Support", href: "/support" },
    ],
  },
  produkt: {
    title: "Produkt",
    items: [
      { name: "Marketplace", href: "/marketplace" },
      { name: "Preise", href: "/pricing" },
      { name: "Funktionen", href: "/capabilities" },
    ],
  },
  rechtliches: {
    title: "Rechtliches",
    items: [
      { name: "Impressum", href: "/impressum" },
      { name: "Datenschutz", href: "/privacy" },
      { name: "AGB", href: "/terms" },
    ],
  },
};

const securityBadges = [
  { name: "SOC 2 Type 2", icon: Shield },
  { name: "DSGVO-konform", icon: CheckCircle },
  { name: "CASA Tier 2", icon: Shield },
];

export function Footer() {
  return (
    <footer className="relative bg-[#030308] border-t border-white/[0.06] mt-auto">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent" />

      {/* CTA Section */}
      <div className="container py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 p-5 sm:p-8 bg-gradient-to-r from-[#8b5cf6]/10 to-[#3b82f6]/5 rounded-2xl border border-[#8b5cf6]/20">
          <div className="text-center lg:text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Mehr erreichen mit Agentify.
            </h3>
            <p className="text-white/50 text-sm sm:text-base">
              Starten Sie noch heute Ihre kostenlose Testversion und erleben Sie den Unterschied.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/capabilities">Mehr erfahren</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/register">
                Agentify starten
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Agentify
              </span>
            </Link>
            <p className="text-sm text-white/40 mb-6 max-w-xs leading-relaxed">
              Arbeit, die zählt. Enterprise KI, die Ihr Unternehmen wirklich versteht.
            </p>
            
            {/* Security Badges */}
            <div className="flex flex-wrap gap-3">
              {securityBadges.map((badge) => (
                <div
                  key={badge.name}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a12] rounded-lg border border-white/5 text-xs text-white/50"
                >
                  <badge.icon className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  {badge.name}
                </div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white/80 mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/40 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/40 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06]">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-white/30">
              <span>Agentify ist eine Marke der Agentify AG</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-white/30 hover:text-white transition-colors text-sm"
              >
                Datenschutz
              </Link>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors text-sm"
              >
                LinkedIn
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors text-sm"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
