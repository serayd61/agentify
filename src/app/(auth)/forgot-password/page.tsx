"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, Info
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { motion } from "framer-motion";

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabaseReady = isSupabaseConfigured();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message || "Ein Fehler ist aufgetreten.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex">
      {/* Left Panel - Branding */}
      <div className="hidden xl:flex w-[500px] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] via-[#6366f1] to-[#3b82f6]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] bg-[#8b5cf6]/30 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8">
            <Mail className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Passwort
            <br />
            zurücksetzen
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm">
            Keine Sorge, wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts per E-Mail.
          </p>
          
          <div className="space-y-4 max-w-sm">
            {[
              { title: "Sicher", desc: "Verschlüsselte Übertragung" },
              { title: "Schnell", desc: "Link kommt in wenigen Minuten" },
              { title: "Einfach", desc: "Folgen Sie einfach den Anweisungen" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-white/60 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 relative">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        
        <div className="w-full max-w-[400px] relative z-10">
          {/* Back Button */}
          <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Anmeldung
          </Link>

          {/* Header */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Passwort zurücksetzen
            </h1>
            <p className="text-sm text-white/50">
              Geben Sie Ihre E-Mail-Adresse ein, um einen Reset-Link zu erhalten.
            </p>
          </motion.div>

          {/* Supabase Not Configured Warning */}
          {!supabaseReady && (
            <div className="mb-4 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#f59e0b] mb-1">Demo-Modus</p>
                  <p className="text-xs text-[#f59e0b]/80">
                    Die Passwort-Wiederherstellung ist derzeit nicht verfügbar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {success ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="space-y-6"
            >
              <div className="p-6 bg-[#34c759]/10 border border-[#34c759]/30 rounded-xl text-center">
                <div className="w-16 h-16 rounded-full bg-[#34c759]/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#34c759]" />
                </div>
                <h2 className="text-lg font-bold text-[#34c759] mb-2">E-Mail versendet!</h2>
                <p className="text-sm text-[#34c759]/80 mb-4">
                  Wir haben einen Reset-Link an Ihre E-Mail-Adresse gesendet.
                  Überprüfen Sie Ihren Posteingang und folgen Sie den Anweisungen.
                </p>
                <p className="text-xs text-[#34c759]/60">
                  Der Link ist 1 Stunde lang gültig.
                </p>
              </div>

              <Button asChild className="w-full h-12" variant="secondary">
                <Link href="/login">
                  Zur Anmeldung
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.form 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-[#ff3b30] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#ff3b30]">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-white/60 mb-1.5">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                    <Mail className="w-4 h-4 text-white/30" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihre@email.ch"
                    className="w-full h-12 pl-11 pr-4 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12"
                isLoading={isLoading}
                disabled={!supabaseReady || !email}
              >
                Reset-Link senden
                <ArrowRight className="w-4 h-4" />
              </Button>

              {/* Info Box */}
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg text-center">
                <p className="text-xs text-white/50">
                  Erhalten Sie keine E-Mail?{" "}
                  <Link href="/contact" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                    Kontaktieren Sie uns
                  </Link>
                </p>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6] rounded-full animate-spin" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
