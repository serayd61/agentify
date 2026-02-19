"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  Bot,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  CreditCard,
  LogOut,
  ArrowRight,
  Upload,
  LifeBuoy,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

type Customer = {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

type CustomerAgent = {
  id: string;
  name: string;
  status: string;
  widget_config?: Record<string, unknown>;
  stripe_subscription_id?: string;
  sectors?: { name_de: string };
  packages?: { name_de: string };
};

const navItems = [
  { label: "Übersicht", icon: BarChart3, href: "/dashboard" },
  { label: "Meine Agents", icon: Bot, href: "/dashboard/agents" },
  { label: "Leads", icon: LifeBuoy, href: "/dashboard/leads" },
  { label: "Termine", icon: CalendarDays, href: "/dashboard/appointments" },
  { label: "Integrationen", icon: Upload, href: "/dashboard/integrations" },
  { label: "Einstellungen", icon: Settings, href: "/dashboard/settings" },
  { label: "Abrechnung", icon: CreditCard, href: "/dashboard/billing" },
];

const formVariant = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.55 } },
};



export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [agents, setAgents] = useState<CustomerAgent[]>([]);
  const [subscription, setSubscription] = useState<{ plan: string; price_monthly: number; message_limit: number | null; status: string; current_period_end: string | null } | null>(null);
  const [messageUsage, setMessageUsage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedAgentId, setCopiedAgentId] = useState<string | null>(null);

  const widgetSnippet = (agentId: string) => `<script src="https://agentify.ch/api/widget/${agentId}"></script>`;

  const handleCopyWidget = async (agentId: string) => {
    try {
      await navigator.clipboard.writeText(widgetSnippet(agentId));
      setCopiedAgentId(agentId);
      toast({ title: "Widget kopiert", description: "Embed-Code in die Zwischenablage kopiert.", variant: "success" });
      setTimeout(() => setCopiedAgentId(null), 2500);
    } catch (error) {
      console.error(error);
      toast({ title: "Kopieren fehlgeschlagen", description: "Bitte manuell kopieren.", variant: "warning" });
    }
  };

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: customerData } = await supabase
        .from("customers")
        .select("id, company_name, first_name, last_name")
        .eq("auth_user_id", user.id)
        .single();

      setCustomer(customerData);

      const { data: agentsData } = await supabase
        .from("customer_agents")
        .select("id, name, status, stripe_subscription_id, sectors(name_de), packages(name_de)")
        .eq("customer_id", customerData?.id)
        .order("created_at", { ascending: false });

      setAgents(agentsData || []);

      const agentIds = (agentsData || []).map((agent: CustomerAgent) => agent.id);
      if (agentIds.length > 0) {
        const { data: usageData } = await supabase
          .from("usage_stats")
          .select("message_count")
          .in("agent_id", agentIds);
        const totalUsage = usageData?.reduce((sum: number, row: { message_count: number | null }) => sum + (row.message_count ?? 0), 0) ?? 0;
        setMessageUsage(totalUsage);
      }

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("plan, price_monthly, message_limit, status, current_period_end")
        .eq("customer_id", customerData?.id)
        .order("current_period_end", { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(subscriptionData ?? null);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const today = useMemo(() => new Date().toLocaleDateString("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }), []);

  const customerLabel = useMemo(() => {
    if (!customer) return null;
    if (customer.company_name) return customer.company_name;
    const names = [customer.first_name, customer.last_name].filter(Boolean);
    return names.length > 0 ? names.join(" ") : "Agentify Kunde";
  }, [customer]);

  const heroSubtitle = loading ? "Daten werden geladen..." : today;

  const activeAgents = useMemo(() => agents.filter((agent) => agent.status === "active").length, [agents]);

  const statsData = useMemo(() => [
    { label: "Aktive Agents", value: `${activeAgents}`, icon: Bot, accent: "#ff3b30" },
    { label: "Nachrichten heute", value: "0", icon: MessageSquare, accent: "#007aff" },
    { label: "Gespräche diese Woche", value: "0", icon: Users, accent: "#34c759" },
    { label: "Kundenzufriedenheit", value: "89%", icon: CheckCircle2, accent: "#ffd60a" },
  ], [activeAgents]);

  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="relative z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,48,0.35),_transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050a] via-[#05050a]/90 to-[#05050a]/95 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className={`fixed inset-y-0 left-0 w-[260px] bg-[#05050a] border-r border-white/[0.08] shadow-2xl hidden lg:flex flex-col px-6 pt-8 pb-6`}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#ff6b5e] flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm tracking-[0.4em] uppercase text-white/60">Agentify</p>
                <p className="text-sm font-semibold">Dashboard</p>
              </div>
            </div>
            <nav className="space-y-2 flex-1">
              {navItems.map((item) => {
                const active = item.href === "/dashboard";
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[#ff3b30]/10 border-l-2 border-[#ff3b30] text-white"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] hover:border-[#ff3b30] hover:text-[#ff3b30] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.aside>

          {/* Mobile sidebar overlay */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#ff6b5e] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold tracking-[0.2em] uppercase text-white/60">Agentify</p>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white/60 hover:text-white"
              >
                Menü
              </button>
            </div>
            {sidebarOpen && (
              <div className="px-4 py-4 bg-[#05050a] border-b border-white/[0.06]">
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
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] mt-3 text-sm hover:border-[#ff3b30] hover:text-[#ff3b30]"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Main content */}
          <motion.div
            className="flex-1 lg:ml-[260px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="px-4 py-6 sm:px-6 lg:px-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Dashboard</p>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                    Willkommen zurück{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""} 👋
                  </h1>
                  <p className="text-sm text-white/50 mt-1">{heroSubtitle}</p>
                  {customerLabel && (
                    <p className="text-xs text-white/40 mt-1">Account: {customerLabel}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="rounded-2xl flex items-center gap-2 text-xs uppercase tracking-[0.4em]"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Neuen Agent erstellen
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-2xl flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/70"
                  >
                    <LifeBuoy className="w-4 h-4" />
                    Support
                  </Button>
                </div>
              </div>

              <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 grid-container">
                {statsData.map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="rounded-2xl bg-card border border-white/[0.08] p-5 shadow-soft"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-center gap-3 text-sm text-white/50 mb-2">
                      <stat.icon className="w-5 h-5" style={{ color: stat.accent.replace("[", "").replace("]", "") }} />
                      <span>{stat.label}</span>
                    </div>
                    <p className="text-4xl font-semibold text-white">{stat.value}</p>
                  </motion.div>
                ))}
              </section>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] grid-container">
                <motion.div
                  className="rounded-[32px] bg-card border border-white/[0.08] p-6 shadow-soft"
                  variants={formVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">Aktive Abonnement</h2>
                      <p className="text-xs text-white/50">Übersicht zu deinem aktuellen Plan</p>
                    </div>
                    <CreditCard className="w-5 h-5 text-white/60" />
                  </div>
                  {subscription ? (
                    <div className="space-y-3">
                      <p className="text-sm text-white/60">Paket: <span className="text-white font-semibold">{subscription.plan}</span></p>
                      <p className="text-sm text-white/60">Nachrichten: {messageUsage} / {subscription.message_limit ?? "unlimitiert"}</p>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#ff6b53] to-[#c11b21]"
                          style={{ width: subscription.message_limit ? `${Math.min((messageUsage / subscription.message_limit) * 100, 100)}%` : "100%" }}
                        />
                      </div>
                      {subscription.current_period_end && (
                        <p className="text-xs text-white/50">Nächste Verlängerung: {new Date(subscription.current_period_end).toLocaleDateString("de-CH")}</p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <Button variant="default" className="rounded-full" asChild>
                          <Link href="/dashboard/billing">Paket verwalten</Link>
                        </Button>
                        <Button variant="ghost" className="rounded-full" asChild>
                          <Link href="/dashboard/agents/new">Neuen Agent erstellen</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-white/60">Noch kein aktives Abo vorhanden.</p>
                      <Button variant="default" className="rounded-full" asChild>
                        <Link href="/pricing">Jetzt starten</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="rounded-[32px] bg-card border border-white/[0.08] p-6 flex flex-col gap-4 shadow-soft"
                  variants={formVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-xl font-bold">Quick Actions</h2>
                  <div className="flex flex-col gap-3 text-sm">
                    <Button variant="secondary" className="rounded-2xl w-full justify-between" asChild>
                      <Link href="/dashboard/agents/new">
                        <span>Neuen Agent erstellen</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" className="rounded-2xl w-full text-white/70 border border-white/[0.08] justify-between" asChild>
                      <Link href="mailto:support@agentify.ch">
                        <span>Support kontaktieren</span>
                        <LifeBuoy className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>

              <section className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Meine Agenten</h2>
                    <p className="text-sm text-white/50">Verwalte deine laufenden Assistenten und kopiere Widget-Codes</p>
                  </div>
                  <Button variant="secondary" asChild className="rounded-full">
                    <Link href="/dashboard/agents/new">Erstellen</Link>
                  </Button>
                </div>

                {agents.length === 0 ? (
                  <Card className="text-center space-y-3">
                    <p className="text-white/70">Noch keine Agenten konfiguriert.</p>
                    <Button asChild>
                      <Link href="/dashboard/agents/new">Ersten Agenten erstellen</Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {agents.map((agent) => (
                      <Card key={agent.id} className="space-y-4 bg-[#06060d] border border-white/[0.08]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                            <p className="text-xs uppercase tracking-[0.4em] text-white/40">{agent.sectors?.name_de ?? "Agent"}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full ${agent.status === "active" ? "bg-[#34c759]/20 text-[#34c759]" : "bg-white/10 text-white/60"}`}>
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/60">Widget Snippet:</p>
                        <div className="relative rounded-2xl border border-white/[0.08] bg-[#05050a]/70 p-3 text-xs font-mono text-white/70">
                          <code className="block break-words">{widgetSnippet(agent.id)}</code>
                          <button
                            onClick={() => handleCopyWidget(agent.id)}
                            className="absolute top-2 right-2 text-white/60 hover:text-white text-[10px]"
                          >
                            {copiedAgentId === agent.id ? "Kopiert" : "Kopieren"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/dashboard/agents/${agent.id}`}>Agent bearbeiten</Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyWidget(agent.id)}>
                            Widget-Code
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
