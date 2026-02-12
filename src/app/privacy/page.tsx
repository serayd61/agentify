"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, CheckCircle } from "lucide-react";

export default function PrivacyPage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#34c759]/10 border border-[#34c759]/20 text-[#34c759] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Datenschutz
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Datenschutzerklärung
            </h1>
            <p className="text-white/50">
              Letzte Aktualisierung: Februar 2026
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d14] rounded-lg border border-white/[0.06]">
              <CheckCircle className="w-4 h-4 text-[#34c759]" />
              <span className="text-sm text-white/70">DSG-konform</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d14] rounded-lg border border-white/[0.06]">
              <CheckCircle className="w-4 h-4 text-[#34c759]" />
              <span className="text-sm text-white/70">DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0d0d14] rounded-lg border border-white/[0.06]">
              <CheckCircle className="w-4 h-4 text-[#34c759]" />
              <span className="text-sm text-white/70">Daten in der Schweiz</span>
            </div>
          </div>

          {/* Content */}
          <Card className="p-8 md:p-12">
            <div className="prose prose-invert prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  1. Verantwortliche Stelle
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Verantwortlich für die Datenverarbeitung ist:
                </p>
                <div className="mt-4 p-4 bg-[#0d0d14] rounded-lg text-white/70">
                  Agentify AG<br />
                  Musterstrasse 123<br />
                  8000 Zürich<br />
                  Schweiz<br /><br />
                  E-Mail: datenschutz@agentify.ch
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  2. Welche Daten wir erheben
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Wir erheben und verarbeiten folgende Kategorien personenbezogener Daten:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2">
                  <li><strong>Kontaktdaten:</strong> Name, E-Mail-Adresse, Telefonnummer, Firmenname</li>
                  <li><strong>Nutzungsdaten:</strong> Anmeldedaten, Nutzungsstatistiken, Geräte- und Browserinformationen</li>
                  <li><strong>Kommunikationsdaten:</strong> Chatverläufe zwischen Ihren Kunden und Ihren KI-Assistenten</li>
                  <li><strong>Zahlungsdaten:</strong> Rechnungsadresse, Zahlungsinformationen (werden von Stripe verarbeitet)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  3. Zweck der Datenverarbeitung
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Wir verarbeiten Ihre Daten für folgende Zwecke:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2">
                  <li>Bereitstellung und Verbesserung unserer Dienstleistungen</li>
                  <li>Abwicklung von Zahlungen und Rechnungsstellung</li>
                  <li>Kundensupport und Kommunikation</li>
                  <li>Erfüllung rechtlicher Verpflichtungen</li>
                  <li>Analyse und Verbesserung der Plattform (anonymisiert)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  4. Rechtsgrundlagen
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Die Verarbeitung Ihrer Daten erfolgt auf Basis folgender Rechtsgrundlagen:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2 mt-4">
                  <li>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</li>
                  <li>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</li>
                  <li>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
                  <li>Rechtliche Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  5. Datenspeicherung und -sicherheit
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  <strong>Speicherort:</strong> Alle Daten werden ausschliesslich auf Servern 
                  in der Schweiz (Rechenzentrum in Zürich) gespeichert. Es findet keine 
                  Übermittlung in Drittländer statt.
                </p>
                <p className="text-white/70 leading-relaxed mb-4">
                  <strong>Sicherheitsmassnahmen:</strong> Wir setzen technische und 
                  organisatorische Massnahmen ein, um Ihre Daten zu schützen:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2">
                  <li>Verschlüsselung aller Daten bei Übertragung (TLS 1.3) und Speicherung (AES-256)</li>
                  <li>Regelmässige Sicherheitsaudits und Penetrationstests</li>
                  <li>Zugriffskontrolle und Authentifizierung</li>
                  <li>Regelmässige Backups</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  6. Aufbewahrungsdauer
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Wir speichern Ihre Daten nur so lange, wie es für die Erfüllung der 
                  Vertragszwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten 
                  bestehen. Nach Vertragsende werden Ihre Daten innerhalb von 90 Tagen 
                  gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  7. Ihre Rechte
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2">
                  <li><strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
                  <li><strong>Berichtigungsrecht:</strong> Sie können die Berichtigung unrichtiger Daten verlangen</li>
                  <li><strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten verlangen</li>
                  <li><strong>Einschränkungsrecht:</strong> Sie können die Einschränkung der Verarbeitung verlangen</li>
                  <li><strong>Datenportabilität:</strong> Sie können Ihre Daten in einem gängigen Format erhalten</li>
                  <li><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung widersprechen</li>
                </ul>
                <p className="text-white/70 leading-relaxed mt-4">
                  Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter datenschutz@agentify.ch
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  8. Cookies und Tracking
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Wir verwenden nur technisch notwendige Cookies für den Betrieb der Plattform. 
                  Wir setzen keine Tracking- oder Marketing-Cookies ein.
                </p>
                <p className="text-white/70 leading-relaxed">
                  Für die Analyse nutzen wir anonymisierte Nutzungsstatistiken, die keine 
                  Rückschlüsse auf einzelne Personen ermöglichen.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  9. Drittanbieter
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Wir arbeiten mit folgenden Drittanbietern zusammen:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2">
                  <li><strong>Stripe:</strong> Zahlungsabwicklung (PCI-DSS zertifiziert)</li>
                  <li><strong>OpenAI:</strong> KI-Modelle (Daten werden nicht für Training verwendet)</li>
                  <li><strong>Supabase:</strong> Datenbankhosting (Server in der Schweiz)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  10. Kontakt und Beschwerden
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie:
                </p>
                <div className="p-4 bg-[#0d0d14] rounded-lg text-white/70">
                  Datenschutzbeauftragter<br />
                  Agentify AG<br />
                  E-Mail: datenschutz@agentify.ch
                </div>
                <p className="text-white/70 leading-relaxed mt-4">
                  Sie haben das Recht, eine Beschwerde bei der zuständigen Aufsichtsbehörde 
                  einzureichen (Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter, EDÖB).
                </p>
              </section>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
