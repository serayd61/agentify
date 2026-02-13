"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Zap, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, 
  Info, ArrowLeft, Check
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { motion } from "framer-motion";

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

// Password strength validator
function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  return strength;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
    // Check if we have a valid recovery token
    if (!searchParams.get('code')) {
      setValidToken(false);
    }
  }, [searchParams]);

  const passwordStrengthLabel = [
    "Sehr schwach",
    "Schwach",
    "Mittel",
    "Stark",
    "Sehr stark"
  ];

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(getPasswordStrength(pwd));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    if (passwordStrength < 2) {
      setError("Das Passwort ist nicht sicher genug.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Fehler beim Zurücksetzen des Passworts.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-md w-full"
        >
          <div className="p-6 bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 text-[#ff3b30] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Link ungültig</h2>
            <p className="text-sm text-white/60 mb-6">
              Der Reset-Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.
            </p>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Neuer Reset-Link</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-6 md:p-8 lg:p-12 relative">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      
      <div className="w-full max-w-[400px] relative z-10">
        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Zur Anmeldung
        </Link>

        {/* Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Neues Passwort setzen
          </h1>
          <p className="text-sm text-white/50">
            Erstellen Sie ein starkes Passwort für Ihr Konto.
          </p>
        </motion.div>

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
              <h2 className="text-lg font-bold text-[#34c759] mb-2">Passwort erfolgreich zurückgesetzt!</h2>
              <p className="text-sm text-[#34c759]/80">
                Sie werden in Kürze zur Anmeldung weitergeleitet.
              </p>
            </div>
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

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-white/60 mb-1.5">
                Neues Passwort
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Mindestens 8 Zeichen"
                  className="w-full h-12 pl-11 pr-11 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
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

              {/* Password Strength */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength === 0 ? 'w-1/5 bg-[#ff3b30]' :
                        passwordStrength === 1 ? 'w-2/5 bg-[#f59e0b]' :
                        passwordStrength === 2 ? 'w-3/5 bg-[#f59e0b]' :
                        passwordStrength === 3 ? 'w-4/5 bg-[#34c759]' :
                        'w-full bg-[#34c759]'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/50">
                      Passwortstärke: <span className={
                        passwordStrength === 0 ? 'text-[#ff3b30]' :
                        passwordStrength === 1 ? 'text-[#f59e0b]' :
                        passwordStrength === 2 ? 'text-[#f59e0b]' :
                        passwordStrength === 3 ? 'text-[#34c759]' :
                        'text-[#34c759]'
                      }>{passwordStrengthLabel[passwordStrength]}</span></p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i < passwordStrength 
                              ? passwordStrength < 2 ? 'bg-[#ff3b30]' : 'bg-[#34c759]'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-white/60 mb-1.5">
                Passwort bestätigen
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="w-full h-12 pl-11 pr-11 bg-[#12121c] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {password === confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-[#34c759]" />
                      <span className="text-xs text-[#34c759]">Passwörter stimmen überein</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#ff3b30]" />
                      <span className="text-xs text-[#ff3b30]">Passwörter stimmen nicht überein</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12"
              isLoading={isLoading}
              disabled={!supabaseReady || !password || !confirmPassword || password !== confirmPassword || passwordStrength < 2}
            >
              Passwort ändern
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Info */}
            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg">
              <p className="text-xs text-white/50">
                Ihr Passwort sollte mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten.
              </p>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
