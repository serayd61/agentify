"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
              <FileText className="w-4 h-4" />
              Rechtliches
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Allgemeine Geschäftsbedingungen (AGB)
            </h1>
            <p className="text-white/50">
              Letzte Aktualisierung: Februar 2026
            </p>
          </div>

          {/* Content */}
          <Card className="p-8 md:p-12">
            <div className="prose prose-invert prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  1. Geltungsbereich
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen 
                  der Agentify AG (nachfolgend &quot;Agentify&quot;) und ihren Kunden (nachfolgend &quot;Kunde&quot;) 
                  über die Nutzung der Agentify-Plattform und der damit verbundenen Dienstleistungen.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  2. Leistungsbeschreibung
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Agentify stellt dem Kunden eine cloudbasierte Plattform zur Verfügung, die 
                  KI-gestützte Assistenten für verschiedene Geschäftsbereiche bereitstellt. 
                  Der Leistungsumfang richtet sich nach dem gewählten Abonnement:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2">
                  <li>Starter: 1 Agent, 2.500 Nachrichten/Monat</li>
                  <li>Business: 3 Agenten, 10.000 Nachrichten/Monat</li>
                  <li>Enterprise: Unbegrenzte Agenten, 50.000 Nachrichten/Monat</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  3. Vertragsschluss
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Der Vertrag kommt durch die Registrierung auf der Agentify-Plattform und 
                  die Auswahl eines kostenpflichtigen Abonnements zustande. Mit der Registrierung 
                  akzeptiert der Kunde diese AGB sowie die Datenschutzerklärung.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  4. Preise und Zahlung
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Die aktuellen Preise sind auf der Website unter /pricing einsehbar. 
                  Alle Preise verstehen sich in Schweizer Franken (CHF) und exklusive 
                  der gesetzlichen Mehrwertsteuer (MWST).
                </p>
                <p className="text-white/70 leading-relaxed">
                  Die Zahlung erfolgt monatlich oder jährlich im Voraus per Kreditkarte 
                  oder auf Rechnung (nur für Enterprise-Kunden).
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  5. Laufzeit und Kündigung
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Bei monatlicher Zahlung kann der Vertrag jederzeit zum Ende des 
                  laufenden Abrechnungszeitraums gekündigt werden. Bei jährlicher 
                  Zahlung ist eine Kündigung zum Ende der Vertragslaufzeit möglich.
                </p>
                <p className="text-white/70 leading-relaxed">
                  Die Kündigung kann über das Dashboard oder per E-Mail an 
                  kuendigung@agentify.ch erfolgen.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  6. Nutzungsrechte
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Agentify räumt dem Kunden für die Dauer des Vertrags ein nicht-exklusives, 
                  nicht übertragbares Recht zur Nutzung der Plattform im Rahmen des gewählten 
                  Abonnements ein. Der Kunde darf die Plattform nur für eigene geschäftliche 
                  Zwecke nutzen.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  7. Datenschutz
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Die Verarbeitung personenbezogener Daten erfolgt gemäss unserer 
                  Datenschutzerklärung und im Einklang mit dem Schweizer Datenschutzgesetz 
                  (DSG) sowie der EU-Datenschutz-Grundverordnung (DSGVO). Alle Daten werden 
                  ausschliesslich in der Schweiz gespeichert.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  8. Haftung
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Agentify haftet nur für Schäden, die auf Vorsatz oder grobe Fahrlässigkeit 
                  zurückzuführen sind. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, 
                  soweit gesetzlich zulässig. Die Haftung ist in jedem Fall auf die vom Kunden 
                  gezahlten Gebühren der letzten 12 Monate begrenzt.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  9. Verfügbarkeit
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Agentify strebt eine Verfügbarkeit der Plattform von 99.9% an. 
                  Geplante Wartungsarbeiten werden mindestens 48 Stunden im Voraus angekündigt. 
                  Für Ausfälle aufgrund höherer Gewalt übernimmt Agentify keine Haftung.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  10. Änderungen der AGB
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Agentify behält sich vor, diese AGB jederzeit zu ändern. Änderungen werden 
                  dem Kunden mindestens 30 Tage vor Inkrafttreten per E-Mail mitgeteilt. 
                  Widerspricht der Kunde nicht innerhalb von 30 Tagen, gelten die Änderungen 
                  als akzeptiert.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  11. Anwendbares Recht und Gerichtsstand
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Es gilt ausschliesslich Schweizer Recht. Gerichtsstand für alle Streitigkeiten 
                  aus diesem Vertrag ist Zürich, Schweiz.
                </p>
              </section>
            </div>
          </Card>

          {/* Contact */}
          <div className="mt-8 text-center text-white/40 text-sm">
            Bei Fragen zu diesen AGB kontaktieren Sie uns unter{" "}
            <a href="mailto:legal@agentify.ch" className="text-white/60 hover:text-white">
              legal@agentify.ch
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
