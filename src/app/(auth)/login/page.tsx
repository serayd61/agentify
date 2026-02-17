"use client";

import React, { useState, Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const isSupabaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const registered = searchParams.get("registered");
  const [supabaseReady, setSupabaseReady] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(
          signInError.message.includes("Invalid login")
            ? "E-Mail oder Passwort ist falsch."
            : signInError.message
        );
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirectTo}`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch {
      setError("Google-Anmeldung fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  const highlights = useMemo(
    () => [
      "DSG-konformes Hosting in der Schweiz",
      "Enterprise-Sicherheit + 99.9% Uptime",
      "Marketplace, Builder & Widget in einem Interface",
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center px-4 py-12">
      <div className="absolute-bg">
        <div className="absolute -left-20 top-16 w-[420px] h-[420px] bg-[#ff3b30]/20 blur-[160px]" />
        <div className="absolute right-0 top-1/4 w-[360px] h-[360px] bg-[#05050a]/70 border border-white/[0.05] rounded-[200px] blur-[110px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl grid gap-4 lg:grid-cols-[1.1fr_0.9fr] rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-[#05050a]/90 via-[#0c0c12] to-[#05050a]/95 shadow-2xl overflow-hidden"
      >
        <motion.div
          variants={cardVariant}
          className="relative px-8 py-10 lg:px-11 lg:py-12 bg-card border-r border-white/[0.04] shadow-soft"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full border border-white/[0.12] text-[10px] font-semibold uppercase tracking-[0.4em] text-white/60">
              <Sparkles className="w-4 h-4 text-[#ff3b30]" />
              Swiss Agents
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
              Alle Agents in einer Plattform.
              <br />
              Von Marketplace bis Widget.
            </h2>

            <p className="text-sm text-white/60 max-w-xl">
              Agentify verbindet Builder Bot, Marketplace, Supabase & Stripe in einem Schweizer Produktiv-Stack.
              Verwalten Sie Kampagnen, Push-Konfigurationen und Abonnements ohne mehrere Tools.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-white/70">
                <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-white/[0.08] text-white/70">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-[#ff3b30]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Savings</p>
                <p className="text-lg font-semibold">CHF 6&apos;000 / Jahr</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#ff3b30]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Time saved</p>
                <p className="text-lg font-semibold">320h / Jahr</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariant}
          className="px-6 py-8 sm:px-8 sm:py-10 bg-card border border-white/[0.08] shadow-soft rounded-[36px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#ff754f] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Jetzt einloggen</h1>
              <p className="text-xs text-white/50">Fahre deine Agentify-Konsole hoch.</p>
            </div>
          </div>

          {registered && (
            <div className="mb-4 p-3 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/30 flex items-center gap-2 text-xs text-[#34c759]">
              <CheckCircle2 className="w-4 h-4" /> Registrierung erfolgreich. Bitte einloggen.
            </div>
          )}

          {!supabaseReady && (
            <div className="mb-4 p-4 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#f59e0b]">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Demo-Modus</p>
                  <p>Supabase fehlt. Bitte Admin kontaktieren für Vollzugang.</p>
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
              <label className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60" htmlFor="email">
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
                  placeholder="name@firma.ch"
                  className="w-full h-12 pl-12 pr-4 bg-[#12121c] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-white/30 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30]/40 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
                <label htmlFor="password">Passwort</label>
                <Link href="/forgot-password" className="text-xs text-[#ff3b30] hover:text-[#ff6b5e]">
                  Passwort vergessen?
                </Link>
              </div>
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
                  placeholder="••••••••••"
                  className="w-full h-12 pl-12 pr-12 bg-[#12121c] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-white/30 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30]/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded-lg border flex items-center justify-center transition-all ${
                  rememberMe
                    ? "bg-[#ff3b30] border-[#ff3b30]"
                    : "border-white/[0.18] hover:border-white/60"
                }`}
              >
                {rememberMe && <span className="w-2 h-2 bg-white rounded-sm" />}
              </button>
              <span className="text-xs text-white/50">Angemeldet bleiben</span>
              <div className="text-xs text-white/40">
                Brauchst du Hilfe? <Link href="/contact" className="text-[#ff3b30] underline">Support</Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm rounded-2xl flex items-center justify-center gap-2"
              isLoading={isLoading}
              disabled={!supabaseReady}
            >
              Einloggen
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
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-3 border border-white/[0.08]"
            onClick={handleGoogleSignIn}
            disabled={isLoading || !supabaseReady}
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
            Mit Google anmelden
          </Button>

          <p className="mt-6 text-center text-xs text-white/40">
            Noch kein Account? <Link href="/register" className="text-[#ff3b30] font-semibold">Registrieren</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[#ff3b30] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
