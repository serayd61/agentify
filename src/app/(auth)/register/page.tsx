"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Zap, Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff, 
  Check, Sparkles, AlertCircle, Info
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const [supabaseReady, setSupabaseReady] = useState(true);
  
  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
    
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            company_name: formData.companyName,
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch {
      setError('Google-Registrierung fehlgeschlagen.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strengthColors = ["#ff3b30", "#ff9500", "#ffd60a", "#34c759"];
  const strengthLabels = ["Schwach", "Mittel", "Gut", "Stark"];

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-[#34c759]/20 border border-[#34c759]/30 flex items-center justify-center">
            <Check className="w-10 h-10 text-[#34c759]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 font-[family-name:var(--font-display)]">
            Überprüfen Sie Ihre E-Mail
          </h1>
          <p className="text-white/60 mb-8">
            Wir haben Ihnen einen Bestätigungslink an <span className="text-white">{formData.email}</span> gesendet.
            Bitte klicken Sie auf den Link, um Ihr Konto zu aktivieren.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/login">Zurück zur Anmeldung</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 relative overflow-y-auto">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        
        <div className="w-full max-w-[420px] relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
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
              Konto erstellen
            </h1>
            <p className="text-sm text-white/50">
              Starten Sie mit Ihrem eigenen KI-Assistenten.
            </p>
          </div>

          {/* Supabase Not Configured Warning */}
          {!supabaseReady && (
            <div className="mb-4 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#f59e0b] mb-1">Demo-Modus</p>
                  <p className="text-xs text-[#f59e0b]/80">
                    Die Registrierung ist derzeit nicht verfügbar. Bitte kontaktieren Sie uns für einen Zugang.
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-white/60 mb-1.5">
                Firmenname
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
                  <Building2 className="w-4 h-4 text-white/30" />
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Muster AG"
                  className="w-full h-11 pl-10 pr-3 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff3b30]/50 focus:ring-2 focus:ring-[#ff3b30]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-white/60 mb-1.5">
                  Vorname
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
                    <User className="w-4 h-4 text-white/30" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Max"
                    className="w-full h-11 pl-10 pr-3 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff3b30]/50 focus:ring-2 focus:ring-[#ff3b30]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-white/60 mb-1.5">
                  Nachname
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Muster"
                  className="w-full h-11 px-3 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff3b30]/50 focus:ring-2 focus:ring-[#ff3b30]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/60 mb-1.5">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
                  <Mail className="w-4 h-4 text-white/30" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ihre@email.ch"
                  className="w-full h-11 pl-10 pr-3 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff3b30]/50 focus:ring-2 focus:ring-[#ff3b30]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-white/60 mb-1.5">
                Passwort
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mindestens 8 Zeichen"
                  className="w-full h-11 pl-10 pr-10 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff3b30]/50 focus:ring-2 focus:ring-[#ff3b30]/20 transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          backgroundColor: i < passwordStrength() ? strengthColors[passwordStrength() - 1] : "rgba(255,255,255,0.1)"
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/40">
                    Stärke: <span style={{ color: strengthColors[passwordStrength() - 1] || "rgba(255,255,255,0.4)" }}>{strengthLabels[passwordStrength() - 1] || "Sehr schwach"}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  agreedToTerms
                    ? "bg-[#ff3b30] border-[#ff3b30]"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {agreedToTerms && <Check className="w-2.5 h-2.5 text-white" />}
              </button>
              <p className="text-xs text-white/50 leading-relaxed">
                Ich akzeptiere die{" "}
                <Link href="/terms" className="text-[#ff3b30] hover:underline">
                  AGB
                </Link>{" "}
                und die{" "}
                <Link href="/privacy" className="text-[#ff3b30] hover:underline">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 mt-2"
              isLoading={isLoading}
              disabled={!agreedToTerms || !supabaseReady}
            >
              Konto erstellen
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
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
            className="w-full h-11"
            onClick={handleGoogleSignUp}
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
            Mit Google registrieren
          </Button>

          {/* Login Link */}
          <p className="text-center mt-5 text-sm text-white/50">
            Bereits ein Konto?{" "}
            <Link href="/login" className="text-[#ff3b30] hover:text-[#ff6b5e] font-medium transition-colors">
              Anmelden
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding (hidden on mobile and tablet) */}
      <div className="hidden xl:flex w-[500px] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff3b30] via-[#ff5840] to-[#ff9500]" />
        <div className="absolute inset-0 swiss-cross opacity-20" />
        
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-white/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[180px] h-[180px] bg-black/20 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col items-center justify-center p-10 text-white text-center w-full">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3 leading-tight">
            Jetzt kostenlos
            <br />
            starten
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-[280px]">
            Erstellen Sie Ihren ersten KI-Assistenten in wenigen Minuten. 14 Tage kostenlos testen.
          </p>
          
          <div className="space-y-2.5 w-full max-w-[280px]">
            {[
              "Keine Kreditkarte erforderlich",
              "In 5 Minuten einsatzbereit",
              "14 Tage Geld-zurück-Garantie",
              "Schweizer Datenhaltung",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-white/90 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
