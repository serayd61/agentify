"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Building2, ArrowLeft, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <section className="pt-32 pb-20 flex-1">
        <div className="container max-w-4xl">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Rechtliches
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Impressum
            </h1>
            <p className="text-white/50">
              Angaben gemäss Art. 3 UWG und Art. 5 DSG
            </p>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Info */}
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#8b5cf6]" />
                Unternehmen
              </h2>
              <div className="space-y-4 text-white/70">
                <p className="text-lg font-medium text-white">Agentify AG</p>
                <p>
                  Musterstrasse 123<br />
                  8000 Zürich<br />
                  Schweiz
                </p>
                <div className="pt-4 border-t border-white/[0.06]">
                  <p><strong>UID:</strong> CHE-XXX.XXX.XXX</p>
                  <p><strong>Handelsregister:</strong> Zürich</p>
                  <p><strong>Rechtsform:</strong> Aktiengesellschaft</p>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#3b82f6]" />
                Kontakt
              </h2>
              <div className="space-y-4">
                <a
                  href="mailto:kontakt@agentify.ch"
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  kontakt@agentify.ch
                </a>
                <a
                  href="tel:+41440000000"
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +41 44 XXX XX XX
                </a>
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="w-4 h-4" />
                  Zürich, Schweiz
                </div>
                <a
                  href="https://agentify.ch"
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  www.agentify.ch
                </a>
              </div>
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="p-8 mt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Vertretungsberechtigte Personen
                </h3>
                <p className="text-white/70">
                  Geschäftsführer: [Name]<br />
                  Verwaltungsrat: [Name]
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Mehrwertsteuer
                </h3>
                <p className="text-white/70">
                  MWST-Nr.: CHE-XXX.XXX.XXX MWST
                </p>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card className="p-8 mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Haftungsausschluss
            </h2>
            <div className="space-y-4 text-white/70 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Haftung für Inhalte:</strong><br />
                Die Inhalte unserer Seiten wurden mit grösster Sorgfalt erstellt. 
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
                können wir jedoch keine Gewähr übernehmen.
              </p>
              <p>
                <strong className="text-white">Haftung für Links:</strong><br />
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren 
                Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden 
                Inhalte auch keine Gewähr übernehmen.
              </p>
              <p>
                <strong className="text-white">Urheberrecht:</strong><br />
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen 
                Seiten unterliegen dem Schweizer Urheberrecht. Die Vervielfältigung, 
                Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der 
                Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des 
                jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </Card>

          {/* Links to other legal pages */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/terms"
              className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              AGB →
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Datenschutz →
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Kontakt →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
