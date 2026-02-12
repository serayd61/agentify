"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Zap, Mail, Lock, ArrowRight, Eye, EyeOff, 
  Shield, AlertCircle, CheckCircle2, Info
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
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
  const [rememberMe, setRememberMe] = useState(false);
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
        if (signInError.message.includes('Invalid login')) {
          setError('E-Mail oder Passwort ist falsch.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
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
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirectTo}`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch {
      setError('Google-Anmeldung fehlgeschlagen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex">
      {/* Left Panel - Branding (hidden on mobile and tablet) */}
      <div className="hidden xl:flex w-[500px] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#007aff] via-[#0055d4] to-[#0a2885]" />
        <div className="absolute inset-0 swiss-cross opacity-10" />
        
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] bg-[#007aff]/30 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white w-full">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Willkommen
            <br />
            zurück
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm">
            Melden Sie sich an, um Ihre KI-Assistenten zu verwalten und Ihr Unternehmen zu automatisieren.
          </p>
          
          <div className="space-y-4 max-w-sm">
            {[
              { title: "Enterprise-Sicherheit", desc: "ISO 27001 zertifizierte Infrastruktur" },
              { title: "Schweizer Hosting", desc: "Alle Daten bleiben in der Schweiz" },
              { title: "24/7 Verfügbarkeit", desc: "99.9% Uptime garantiert" },
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
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff3b30] to-[#ff9500] rounded-xl blur-lg opacity-50" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff3b30] to-[#ff6b5e] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                Agentify
              </span>
              <span className="text-[9px] font-semibold text-white/40 -mt-1 tracking-[0.2em] uppercase">
                Swiss
              </span>
            </div>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Anmelden
            </h1>
            <p className="text-sm text-white/50">
              Geben Sie Ihre Anmeldedaten ein, um fortzufahren.
            </p>
          </div>

          {/* Success Message */}
          {registered && (
            <div className="mb-4 p-3 bg-[#34c759]/10 border border-[#34c759]/30 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
              <p className="text-xs text-[#34c759]">
                Registrierung erfolgreich! Bitte melden Sie sich an.
              </p>
            </div>
          )}

          {/* Supabase Not Configured Warning */}
          {!supabaseReady && (
            <div className="mb-4 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#f59e0b] mb-1">Demo-Modus</p>
                  <p className="text-xs text-[#f59e0b]/80">
                    Die Anmeldung ist derzeit nicht verfügbar. Bitte kontaktieren Sie uns für einen Zugang.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#ff3b30] shrink-0" />
              <p className="text-xs text-[#ff3b30]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ihre@email.ch"
                  className="w-full h-12 pl-11 pr-4 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#007aff]/50 focus:ring-2 focus:ring-[#007aff]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-white/60">
                  Passwort
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-[#007aff] hover:text-[#3395ff] transition-colors"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ihr Passwort"
                  className="w-full h-12 pl-11 pr-11 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#007aff]/50 focus:ring-2 focus:ring-[#007aff]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  rememberMe
                    ? "bg-[#007aff] border-[#007aff]"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-white/50">Angemeldet bleiben</span>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12"
              isLoading={isLoading}
              disabled={!supabaseReady}
            >
              Anmelden
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#05050a] text-white/30">oder</span>
            </div>
          </div>

          {/* Social Login */}
          <Button 
            variant="secondary" 
            className="w-full h-12"
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

          {/* Register Link */}
          <p className="text-center mt-6 text-sm text-white/50">
            Noch kein Konto?{" "}
            <Link href="/register" className="text-[#007aff] hover:text-[#3395ff] font-medium transition-colors">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff3b30]/30 border-t-[#ff3b30] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
