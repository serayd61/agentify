"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  Bot,
  BarChart3,
  Upload,
  Settings,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  ArrowRight,
  User as UserIcon,
  Mail,
  Lock,
  Smartphone,
  Trash2,
  Eye,
  EyeOff,
  LifeBuoy,
} from "lucide-react";

const navItems = [
  { label: "Übersicht", href: "/dashboard", icon: BarChart3 },
  { label: "Meine Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Integrationen", href: "/dashboard/integrations", icon: Upload },
  { label: "Einstellungen", href: "/dashboard/settings", icon: Settings },
  { label: "Abrechnung", href: "/dashboard/billing", icon: CreditCard },
];

const tabList = [
  { value: "profile", label: "Profil", icon: UserIcon },
  { value: "security", label: "Sicherheit", icon: Shield },
  { value: "notifications", label: "Benachrichtigungen", icon: Bell },
  { value: "api", label: "API", icon: Lock },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const notificationOptions = [
  { key: "security", title: "Sicherheitswarnungen" },
  { key: "newAgent", title: "Neue Agents" },
  { key: "billing", title: "Billing-Alerts" },
  { key: "marketing", title: "Marketing-E-Mails" },
] as const;
type NotificationKey = (typeof notificationOptions)[number]["key"] | "push" | "weekly";

const toggleClasses = (enabled: boolean) =>
  enabled
    ? "bg-[#ff3b30]"
    : "bg-white/10 hover:bg-white/20";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({
    company: "",
    email: "",
    phone: "",
    address: "",
  });
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
    show: false,
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<Record<NotificationKey, boolean>>({
    security: true,
    newAgent: true,
    billing: true,
    marketing: false,
    push: true,
    weekly: false,
  });
  const [apiKey, setApiKey] = useState("sk_live_••••••••••••");
  const [webhookUrl, setWebhookUrl] = useState("https://webhook.agentify.ch/events");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setProfile((prev) => ({
        ...prev,
        email: user.email || "",
        company: user.user_metadata?.company_name || "Agentify GmbH",
      }));
    };
    fetchUser();
  }, [router]);

  const today = useMemo(() =>
    new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" }),
    []);

  return (
    <div className="min-h-screen bg-[#05050a] text-white flex">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-12 w-[420px] h-[420px] bg-[#ff3b30]/20 blur-[140px]" />
        <div className="absolute right-0 bottom-0 w-[360px] h-[360px] bg-[#05050a]/70 border border-white/[0.05] rounded-[200px] blur-[110px]" />
      </div>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="hidden lg:flex flex-col w-[260px] bg-[#05050a] border-r border-white/[0.08] p-6 rounded-tr-[32px] rounded-br-[32px]"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#ff6b5e] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Agentify</p>
            <p className="text-base font-semibold">Einstellungen</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                item.label === "Einstellungen"
                  ? "bg-[#ff3b30]/10 border-l-2 border-[#ff3b30] text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4 text-white/60" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-6">
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 rounded-xl"
            onClick={() => router.push("/dashboard")}
          >
            <LogOut className="w-4 h-4" />
            Zurück zum Dashboard
          </Button>
        </div>
      </motion.aside>

      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Einstellungen</p>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60 hover:text-white">
            Menü
          </button>
        </div>
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-white/[0.05]">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <Button
                variant="secondary"
                className="w-full mt-3 rounded-xl flex items-center justify-center gap-2"
                onClick={() => router.push("/dashboard")}
              >
                <LogOut className="w-4 h-4" />
                Zurück zum Dashboard
              </Button>
            </nav>
          </div>
        )}
      </div>

      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex-1 lg:ml-[260px] px-4 py-8 sm:px-6 lg:px-10"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Einstellungen</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">Willkommen zurück{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!</h1>
              <p className="text-sm text-white/50">{today}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="rounded-2xl text-xs uppercase tracking-[0.4em] flex items-center gap-2"
                onClick={() => router.push("/dashboard/agents/new")}
              >
                <ArrowRight className="w-4 h-4" />
                Neuen Agent erstellen
              </Button>
              <Button variant="ghost" className="rounded-2xl text-xs uppercase tracking-[0.4em] text-white/60 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4" />
                Support
              </Button>
            </div>
          </div>

          <div className="bg-[#12121c] border border-white/[0.08] rounded-2xl">
            <div className="flex divide-x divide-white/[0.08] overflow-x-auto">
              {tabList.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab.value
                      ? "text-white border-b-2 border-[#ff3b30]"
                      : "text-white/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {activeTab === "profile" && (
                <motion.section key="profile" initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 bg-[#12121c]/40 rounded-xl border border-white/[0.06] p-4">
                      <p className="text-xs text-white/50 uppercase tracking-[0.3em]">Firma</p>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile((prev) => ({ ...prev, company: e.target.value }))}
                        placeholder="Agentify AG"
                        className="w-full bg-[#12121c] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff3b30]/50"
                      />
                    </div>
                    <div className="space-y-2 bg-[#12121c]/40 rounded-xl border border-white/[0.06] p-4">
                      <p className="text-xs text-white/50 uppercase tracking-[0.3em]">E-Mail</p>
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#12121c] border border-white/[0.08] rounded-xl">
                        <Mail className="w-4 h-4 text-white/50" />
                        <span className="text-sm text-white/60">{profile.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 bg-[#12121c]/40 rounded-xl border border-white/[0.06] p-4">
                      <p className="text-xs text-white/50 uppercase tracking-[0.3em]">Telefon</p>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+41 44 000 00 00"
                        className="w-full bg-[#12121c] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff3b30]/50"
                      />
                    </div>
                    <div className="space-y-2 bg-[#12121c]/40 rounded-xl border border-white/[0.06] p-4">
                      <p className="text-xs text-white/50 uppercase tracking-[0.3em]">Adresse</p>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="Bahnhofstrasse 1, 8001 Zürich"
                        className="w-full bg-[#12121c] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff3b30]/50"
                      />
                    </div>
                  </div>

                  <div className="bg-[#12121c]/40 rounded-xl border border-white/[0.06] p-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold">Profilbild</p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/[0.08] flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white/60" />
                      </div>
                      <Button variant="secondary" className="rounded-2xl px-4">
                        Bild hochladen
                      </Button>
                    </div>
                  </div>

                  <Button className="rounded-2xl px-6">Änderungen speichern</Button>
                </motion.section>
              )}

              {activeTab === "security" && (
                <motion.section key="security" initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                  <div className="space-y-4 border-b border-white/[0.06] pb-4">
                    <h3 className="text-lg font-semibold">Passwort ändern</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        { label: "Aktuelles Passwort", value: password.current, name: "current" },
                        { label: "Neues Passwort", value: password.next, name: "next" },
                        { label: "Passwort bestätigen", value: password.confirm, name: "confirm" },
                      ].map((field) => (
                        <div key={field.label} className="space-y-2 bg-[#12121c]/40 rounded-xl border border-white/[0.06] p-4">
                          <label className="text-xs text-white/60 uppercase tracking-[0.3em]">{field.label}</label>
                          <div className="relative">
                            <input
                              type={password.show ? "text" : "password"}
                              name={field.name}
                              value={field.value}
                              onChange={(e) => setPassword((prev) => ({ ...prev, [field.name]: e.target.value }))}
                              placeholder="••••••••"
                              className="w-full bg-[#12121c] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff3b30]/50"
                            />
                            <button
                              type="button"
                              onClick={() => setPassword((prev) => ({ ...prev, show: !prev.show }))}
                              className="absolute right-3 top-[50%] -translate-y-1/2 text-white/50"
                            >
                              {password.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="rounded-2xl px-6">Passwort speichern</Button>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-[#ff3b30]" />
                        Zwei-Faktor-Authentifizierung
                      </h3>
                      <p className="text-sm text-white/60">Aktivieren Sie eine zusätzliche Sicherheitsebene.</p>
                    </div>
                    <button
                      onClick={() => setTwoFactor((prev) => !prev)}
                      className={`relative w-12 h-6 rounded-full transition-all ${toggleClasses(twoFactor)}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                          twoFactor ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-[#12121c]/40 rounded-xl border border-white/[0.06] p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-white">Aktive Sitzungen</h4>
                    {[
                      "Desktop • Zürich",
                      "Web • Remote Work",
                      "iOS App • Zug",
                    ].map((session) => (
                      <div key={session} className="flex items-center justify-between text-xs text-white/60">
                        <span>{session}</span>
                        <span className="text-white/40">Vor 2h</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {activeTab === "notifications" && (
                <motion.section key="notifications" initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4">
                  {notificationOptions.map((item) => (
                    <div key={item.key} className="flex items-center justify-between bg-[#12121c]/40 border border-white/[0.06] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-white/50">Erhalten Sie E-Mail-Updates.</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                        className={`relative w-12 h-6 rounded-full transition-all ${toggleClasses(notificationPrefs[item.key])}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                            notificationPrefs[item.key] ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-[#12121c]/40 border border-white/[0.06] rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Push-Benachrichtigungen</p>
                      <p className="text-xs text-white/50">Erhalte sofortige Alerts auf dem Gerät.</p>
                    </div>
                    <button
                      onClick={() => setNotificationPrefs((prev) => ({ ...prev, push: !prev.push }))}
                      className={`relative w-12 h-6 rounded-full transition-all ${toggleClasses(notificationPrefs.push)}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${notificationPrefs.push ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-[#12121c]/40 border border-white/[0.06] rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Wöchentlicher Bericht</p>
                      <p className="text-xs text-white/50">Zusammenfassung direkt in Ihr Postfach.</p>
                    </div>
                    <button
                      onClick={() => setNotificationPrefs((prev) => ({ ...prev, weekly: !prev.weekly }))}
                      className={`relative w-12 h-6 rounded-full transition-all ${toggleClasses(notificationPrefs.weekly)}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all ${notificationPrefs.weekly ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </motion.section>
              )}

              {activeTab === "api" && (
                <motion.section key="api" initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4">
                  <div className="bg-[#12121c]/40 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                    <p className="text-xs text-white/50 uppercase tracking-[0.3em]">API Key</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={apiKey}
                        readOnly
                        className="flex-1 bg-[#05050a] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white tracking-widest"
                      />
                      <Button variant="secondary" className="rounded-xl px-4">Neuen Key generieren</Button>
                    </div>
                    <p className="text-xs text-white/40">Bewahren Sie diesen Schlüssel sicher auf. Er wird nicht erneut angezeigt.</p>
                  </div>
                  <div className="bg-[#12121c]/40 border border-white/[0.06] rounded-2xl p-4">
                    <p className="text-xs text-white/50 uppercase tracking-[0.3em]">Webhook URL</p>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://example.com/webhook"
                      className="w-full bg-[#05050a] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff3b30]/50"
                    />
                    <p className="text-xs text-white/40 mt-2">Wir versenden Update-Events an diese URL.</p>
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
