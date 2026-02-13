"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, ListSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Save,
  LogOut,
  Trash2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface UserProfile {
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface SettingsState {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  twoFactorEnabled: boolean;
}

function SettingsContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [settings, setSettings] = useState<SettingsState>({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    twoFactorEnabled: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = getSupabaseBrowser();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        setUser(user as UserProfile);
        setSettings((prev) => ({
          ...prev,
          fullName: user.user_metadata?.full_name || "",
          email: user.email || "",
        }));
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Fehler",
          description: "Benutzerinformationen konnten nicht geladen werden.",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router, toast]);

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.updateUser({
        data: { full_name: settings.fullName },
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Profil wurde aktualisiert.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht aktualisiert werden.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein.",
        variant: "error",
      });
      return;
    }

    if (settings.newPassword.length < 8) {
      toast({
        title: "Fehler",
        description: "Passwort muss mindestens 8 Zeichen lang sein.",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.updateUser({
        password: settings.newPassword,
      });

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast({
        title: "Erfolg",
        description: "Passwort wurde aktualisiert.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Passwort konnte nicht aktualisiert werden.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen.",
        variant: "error",
      });
    }
  };

  const handleAccountDelete = async () => {
    if (!window.confirm("Sind Sie sicher? Dies kann nicht rückgängig gemacht werden.")) {
      return;
    }

    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      // In production, you'd call an API to delete the user account
      toast({
        title: "Erfolg",
        description: "Konto wurde gelöscht.",
        variant: "success",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Konto konnte nicht gelöscht werden.",
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex flex-col">
        <Header />
        <div className="flex-1 py-12">
          <div className="container">
            <Skeleton className="h-8 w-32 mb-8" />
            <ListSkeleton count={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <motion.main 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex-1 py-12"
      >
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Einstellungen</h1>
            <p className="text-white/60">Verwalten Sie Ihre Kontoeinstellungen und Präferenzen.</p>
          </div>

          {/* Tabs */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Tabs.List className="flex gap-4 border-b border-white/10 overflow-x-auto">
              {[
                { value: "profile", label: "Profil", icon: User },
                { value: "security", label: "Sicherheit", icon: Shield },
                { value: "notifications", label: "Benachrichtigungen", icon: Bell },
                { value: "dangerous", label: "Gefährliche Zone", icon: AlertCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white/60 hover:text-white border-b-2 border-transparent hover:border-white/20 transition-all data-[state=active]:border-[#8b5cf6] data-[state=active]:text-white cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>

            {/* Profile Tab */}
            <Tabs.Content value="profile" className="space-y-6">
              <Card className="p-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Vollständiger Name
                  </label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                    placeholder="Ihr Name"
                    className="w-full px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    E-Mail-Adresse
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg">
                    <Mail className="w-4 h-4 text-white/50" />
                    <input
                      type="email"
                      value={settings.email}
                      disabled
                      className="flex-1 bg-transparent text-white/50 text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    E-Mail kann über den Support geändert werden.
                  </p>
                </div>

                <Button onClick={handleProfileUpdate} isLoading={isSaving} className="w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  Änderungen speichern
                </Button>
              </Card>
            </Tabs.Content>

            {/* Security Tab */}
            <Tabs.Content value="security" className="space-y-6">
              {/* Change Password */}
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#8b5cf6]" />
                  Passwort ändern
                </h3>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Aktuelles Passwort
                  </label>
                  <div className="relative">
                    <input
                      type={settings.showCurrentPassword ? "text" : "password"}
                      value={settings.currentPassword}
                      onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pr-12 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          showCurrentPassword: !settings.showCurrentPassword,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                    >
                      {settings.showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Neues Passwort
                  </label>
                  <div className="relative">
                    <input
                      type={settings.showNewPassword ? "text" : "password"}
                      value={settings.newPassword}
                      onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pr-12 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          showNewPassword: !settings.showNewPassword,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                    >
                      {settings.showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Passwort bestätigen
                  </label>
                  <input
                    type={settings.showNewPassword ? "text" : "password"}
                    value={settings.confirmPassword}
                    onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-[#0f0f1a] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
                  />
                </div>

                <Button
                  onClick={handlePasswordChange}
                  isLoading={isSaving}
                  className="w-full sm:w-auto"
                >
                  <Lock className="w-4 h-4" />
                  Passwort ändern
                </Button>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <Smartphone className="w-5 h-5 text-[#8b5cf6]" />
                      Zwei-Faktor-Authentifizierung
                    </h3>
                    <p className="text-sm text-white/60">
                      Erhöhen Sie die Sicherheit Ihres Kontos mit 2FA.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    {settings.twoFactorEnabled ? "Deaktivieren" : "Aktivieren"}
                  </Button>
                </div>
              </Card>
            </Tabs.Content>

            {/* Notifications Tab */}
            <Tabs.Content value="notifications" className="space-y-6">
              <Card className="p-6 space-y-4">
                {[
                  {
                    title: "Sicherheitswarnungen",
                    description: "Benachrichtigungen über verdächtige Aktivitäten",
                  },
                  {
                    title: "Neue Agents",
                    description: "Benachrichtigungen über neue AI Agents",
                  },
                  {
                    title: "Billing-Alerts",
                    description: "Benachrichtigungen über Rechnungen",
                  },
                  {
                    title: "Marketing-E-Mails",
                    description: "Neuigkeiten und Angebote",
                  },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <p className="text-xs text-white/50">{notification.description}</p>
                    </div>
                    <button className="relative w-12 h-7 bg-white/10 border border-white/20 rounded-full transition-all hover:bg-[#8b5cf6]/30">
                      <div className="absolute inset-0.5 bg-[#8b5cf6] rounded-full w-3 h-3 left-1 transition-all" />
                    </button>
                  </div>
                ))}
              </Card>
            </Tabs.Content>

            {/* Dangerous Zone */}
            <Tabs.Content value="dangerous" className="space-y-6">
              {/* Logout All Devices */}
              <Card className="p-6 border border-[#f59e0b]/20 bg-[#f59e0b]/5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
                  Aus allen Geräten abmelden
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  Sie werden aus allen aktiven Sitzungen abgemeldet.
                </p>
                <Button variant="secondary" className="border-[#f59e0b]/30">
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </Button>
              </Card>

              {/* Delete Account */}
              <Card className="p-6 border border-[#ff3b30]/20 bg-[#ff3b30]/5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-[#ff3b30]" />
                  Konto löschen
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  Dies wird Ihr Konto und alle zugehörigen Daten dauerhaft löschen.
                  Dies kann nicht rückgängig gemacht werden.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleAccountDelete}
                  className="border-[#ff3b30]/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Konto löschen
                </Button>
              </Card>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6] rounded-full animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
