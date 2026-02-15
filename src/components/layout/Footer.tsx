"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

const links: Record<string, FooterLink[]> = {
  Produkt: [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Preise", href: "/pricing" },
    { name: "Funktionen", href: "/capabilities" },
    { name: "Demo", href: "/demo" },
  ],
  Unternehmen: [
    { name: "Über uns", href: "https://swissdigital.life", external: true },
    { name: "Kontakt", href: "/contact" },
    { name: "Support", href: "/support" },
  ],
  Rechtliches: [
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutz", href: "/privacy" },
    { name: "AGB", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      {/* Main */}
      <div className="container py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-base font-bold text-gray-900">Agentify</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-5">
              KI-Assistenten für Schweizer KMU. Swiss Hosting, DSGVO-konform.
            </p>
            <Button size="sm" asChild className="bg-red-600 hover:bg-red-700 text-white rounded-full px-5">
              <Link href="/register">
                Kostenlos starten
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
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

      {/* Bottom */}
      <div className="border-t border-gray-200">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© 2026 Agentify — eine Marke der Agentify AG</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Datenschutz</Link>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
