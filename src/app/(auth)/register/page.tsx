"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  Check,
  AlertCircle,
  ArrowRight,
  Info,
  Sparkles,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const isSupabaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

const panelVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const formVariant = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.55 } },
};

export default function RegisterPage() {
  const [supabaseReady, setSupabaseReady] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    if (formData.password !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!supabaseReady) {
      setError("Supabase ist derzeit nicht konfiguriert.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowser();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            company_name: formData.companyName,
          },
        },
      });

      if (signUpError) {
        console.error("SignUp error:", signUpError);
        setError(`Auth Error: ${signUpError.message}`);
        return;
      }

      if (signUpData?.user?.id) {
        const { error: upsertError } = await supabase
          .from("customers")
          .upsert(
            {
              auth_user_id: signUpData.user.id,
              email: formData.email,
              company_name: formData.companyName,
            },
            { onConflict: "auth_user_id" }
          );

        if (upsertError) {
          console.error("Upsert error:", upsertError);
          setError(`DB Error: ${upsertError.message}`);
          return;
        }
      }

      setSuccess(true);
    } catch (error) {
      console.error("Registration failed", error);
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const advantages = useMemo(
    () => [
      "Swiss Made · DSG-konformes Hosting",
      "Marketplace, Builder und Widget in einem Hub",
      "Supabase + Stripe Automation",
      "24/7 KI-Service und Analytics",
    ],
    []
  );

  if (success) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-[28px] border border-white/[0.08] bg-[#05050a]/95 p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/30 flex items-center justify-center">
              <Check className="w-10 h-10 text-[#34c759]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Fast fertig!</h1>
            <p className="text-sm text-white/60">
              Wir haben einen Bestätigungslink an <span className="text-white font-semibold">{formData.email}</span> gesendet.
              Folge dem Link, um dein Agentify-Konto zu aktivieren.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/login">Zur Anmeldung</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] flex items-stretch">
      <div className="absolute-bg">
        <div className="absolute -left-16 top-10 w-[420px] h-[420px] bg-[#ff3b30]/20 blur-[150px]" />
        <div className="absolute right-0 bottom-0 w-[360px] h-[360px] bg-[#05050a]/60 border border-white/[0.05] rounded-[200px] blur-[110px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto grid gap-4 lg:grid-cols-[1.05fr_0.95fr] rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-[#05050a]/90 via-[#0b0b11] to-[#05050a]/95 shadow-2xl overflow-hidden m-4"
      >
        <motion.div
          variants={panelVariant}
          className="hidden lg:flex flex-col justify-evenly gap-6 bg-gradient-to-br from-[#ff3b30] via-[#dd1c19] to-[#c11b21] px-10 py-12 text-white"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/[0.3] text-[10px] font-semibold uppercase tracking-[0.4em]">
              <Sparkles className="w-4 h-4 text-white" />
              Agentify Vorteile
            </div>
            <h2 className="mt-6 text-3xl font-bold leading-snug">
              KI-Assistenten für Schweizer KMU.
            </h2>
            <p className="text-sm text-white/80 mt-3 max-w-sm">
              Marketplace, Builder Bot, Widget und Billing laufen in einem Interface. DSGVO und Swiss Hosting inklusive.
            </p>
          </div>
          <div className="space-y-4">
            {advantages.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <span className="w-8 h-8 rounded-2xl bg-white/20 border border-white/[0.5] flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#34c759]" />
                </span>
                <p className="text-white/90 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={formVariant}
          className="px-6 py-8 sm:px-8 sm:py-10 bg-card border border-white/[0.08] shadow-soft rounded-[36px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#ff6b5e] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Registrieren</h1>
              <p className="text-xs text-white/60">In wenigen Minuten dein Agentify-Konto aufsetzen.</p>
            </div>
          </div>

          {!supabaseReady && (
            <div className="mb-4 p-4 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#f59e0b]">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Demo-Modus</p>
                  <p>Supabase ist noch nicht konfiguriert. Bitte Kontakt aufnehmen für Freischaltung.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/30 flex items-center gap-2 text-xs text-[#ff3b30]">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
                Firma
              </label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Muster AG"
                  className="w-full h-12 pl-12 pr-4 bg-[#12121c] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-[#ff3b30]/50 focus:ring-1 focus:ring-[#ff3b30]/40 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
                E-Mail
              </label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="kontakt@firma.ch"
                  className="w-full h-12 pl-12 pr-4 bg-[#12121c] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-[#ff3b30]/50 focus:ring-1 focus:ring-[#ff3b30]/40 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
                  Passwort
                </label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mindestens 8 Zeichen"
                    minLength={8}
                    className="w-full h-12 pl-12 pr-12 bg-[#12121c] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-[#ff3b30]/50 focus:ring-1 focus:ring-[#ff3b30]/40 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/30 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
                  Passwort bestätigen
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Passwort wiederholen"
                  className="w-full h-12 mt-2 px-3 bg-[#12121c] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:border-[#ff3b30]/50 focus:ring-1 focus:ring-[#ff3b30]/40 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  agreedToTerms
                    ? "bg-[#ff3b30] border-[#ff3b30]"
                    : "border-white/[0.18] hover:border-white/60"
                }`}
              >
                {agreedToTerms && <span className="w-2 h-2 bg-white rounded-sm" />}
              </button>
              <p className="text-xs text-white/50 leading-tight">
                Ich akzeptiere die <Link href="/terms" className="text-[#ff3b30] hover:underline">AGB</Link> und die <Link href="/privacy" className="text-[#ff3b30] hover:underline">Datenschutzerklärung</Link>.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm"
              isLoading={isLoading}
              disabled={!agreedToTerms || !supabaseReady}
            >
              Konto erstellen
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#05050a] px-3 text-[11px] uppercase tracking-[0.4em] text-white/40">oder</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full h-12 rounded-xl flex items-center justify-center gap-3 border border-white/[0.08]"
            onClick={async () => {
              setIsLoading(true);
              setError(null);
              try {
                const supabase = getSupabaseBrowser();
                const { error: oauthError } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/api/auth/callback` },
                });
                if (oauthError) setError(oauthError.message);
              } catch {
                setError("Google-Registrierung fehlgeschlagen.");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={!supabaseReady || isLoading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Mit Google registrieren
          </Button>

          <p className="mt-6 text-center text-xs text-white/40">
            Bereits ein Konto? <Link href="/login" className="text-[#ff3b30] hover:text-[#ff6b5e] font-semibold">Anmelden</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
