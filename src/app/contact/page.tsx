"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    type: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "E-Mail",
      value: "kontakt@agentify.ch",
      href: "mailto:kontakt@agentify.ch",
    },
    {
      icon: Phone,
      title: "Telefon",
      value: "+41 44 XXX XX XX",
      href: "tel:+41440000000",
    },
    {
      icon: MapPin,
      title: "Adresse",
      value: "Zürich, Schweiz",
      href: null,
    },
    {
      icon: Clock,
      title: "Geschäftszeiten",
      value: "Mo-Fr: 09:00-18:00",
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <section className="pt-32 pb-20 flex-1">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#ff6b5e] text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Kontakt
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Wir freuen uns auf
              <br />
              <span className="bg-gradient-to-r from-[#dc2626] to-[#f97316] bg-clip-text text-transparent">
                Ihre Nachricht
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Haben Sie Fragen zu unseren KI-Assistenten? Möchten Sie eine Demo?
              Wir sind für Sie da.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#34c759]/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-[#34c759]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Vielen Dank!
                    </h3>
                    <p className="text-white/50 mb-6">
                      Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>
                      Neue Nachricht senden
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0d0d14] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#dc2626]/50"
                          placeholder="Ihr Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          E-Mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0d0d14] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#dc2626]/50"
                          placeholder="ihre@email.ch"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Unternehmen
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0d0d14] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#dc2626]/50"
                          placeholder="Firmenname"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0d0d14] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#dc2626]/50"
                          placeholder="+41 XX XXX XX XX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Betreff
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0d0d14] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#dc2626]/50"
                      >
                        <option value="general">Allgemeine Anfrage</option>
                        <option value="demo">Demo anfragen</option>
                        <option value="support">Technischer Support</option>
                        <option value="sales">Verkauf / Preise</option>
                        <option value="partnership">Partnerschaft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Nachricht *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0d0d14] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#dc2626]/50 resize-none"
                        placeholder="Wie können wir Ihnen helfen?"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      <Send className="w-4 h-4" />
                      Nachricht senden
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <Card key={item.title} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#dc2626]/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#dc2626]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white/50 mb-1">
                        {item.title}
                      </h3>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-white hover:text-[#dc2626] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Quick Response Promise */}
              <Card className="p-6 bg-gradient-to-br from-[#dc2626]/10 to-[#f97316]/5 border-[#dc2626]/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Schnelle Antwort garantiert
                </h3>
                <p className="text-sm text-white/50">
                  Wir antworten auf alle Anfragen innerhalb von 24 Stunden an Werktagen.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
