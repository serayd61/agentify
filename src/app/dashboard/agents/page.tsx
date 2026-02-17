"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  BarChart3,
  Upload,
  Settings,
  CreditCard,
  LogOut,
  ArrowRight,
  LifeBuoy,
  MessageSquare,
  Users,
  Shield,
} from "lucide-react";

type CustomerAgent = {
  id: string;
  name: string;
  status: string;
  template_id: string | null;
  updated_at: string;
};

type StatCard = { label: string; value: string; icon: LucideIcon; accent: string };

type Customer = {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

const navItems = [
  { label: "Übersicht", href: "/dashboard", icon: BarChart3 },
  { label: "Meine Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Integrationen", href: "/dashboard/integrations", icon: Upload },
  { label: "Einstellungen", href: "/dashboard/settings", icon: Settings },
  { label: "Abrechnung", href: "/dashboard/billing", icon: CreditCard },
];

const statsData: StatCard[] = [
  { label: "Nachrichten", value: "120", icon: MessageSquare, accent: "#007aff" },
  { label: "Gespräche", value: "34", icon: Users, accent: "#34c759" },
  { label: "Aktive Agents", value: "3", icon: Bot, accent: "#ff3b30" },
  { label: "Verfügbarkeit", value: "98%", icon: Shield, accent: "#ffd60a" },
];

const formatLastActivity = (updatedAt?: string) =>
  updatedAt ? new Date(updatedAt).toLocaleDateString("de-CH") : "Noch keine Aktivität";


export default function AgentsPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [agents, setAgents] = useState<CustomerAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: customerData } = await supabase
        .from("customers")
        .select("id, company_name, first_name, last_name")
        .eq("auth_user_id", user.id)
        .single();

      setCustomer(customerData);

      const { data: agentsData } = await supabase
        .from("customer_agents")
        .select("id, name, status, template_id, updated_at")
        .eq("customer_id", customerData?.id)
        .order("created_at", { ascending: false });

      setAgents(agentsData || []);
      setLoading(false);
    };

    load();
  }, [router]);

  const today = useMemo(() =>
    new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" }),
    [],
  );

  const customerLabel = useMemo(() => {
    if (!customer) return null;
    if (customer.company_name) return customer.company_name;
    const names = [customer.first_name, customer.last_name].filter(Boolean);
    return names.length > 0 ? names.join(" ") : "Kunde";
  }, [customer]);

  const badgeColor = (status: string) =>
    status === "active" ? "bg-[#34c759]/20 text-[#34c759]" : "bg-white/10 text-white/60";

  return (
    <div className="min-h-screen bg-[#05050a] text-white flex">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-16 top-10 w-[420px] h-[420px] bg-[#ff3b30]/20 blur-[140px]" />
        <div className="absolute right-0 bottom-0 w-[360px] h-[360px] bg-[#05050a]/70 border border-white/[0.05] rounded-[200px] blur-[110px]" />
      </div>

      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        className="hidden lg:flex flex-col w-[260px] bg-[#05050a] border-r border-white/[0.08] p-6 rounded-tr-[32px] rounded-br-[32px]"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#ff6b5e] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Agentify</p>
            <p className="text-base font-semibold">Meine Agents</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                item.label === "Meine Agents"
                  ? "bg-[#ff3b30]/10 border-l-2 border-[#ff3b30] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 text-white/60" />}
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
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Agentify</p>
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
                  {item.icon && <item.icon className="w-4 h-4" />}
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

      <motion.div className="flex-1 lg:ml-[260px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="px-4 py-6 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Agent Dashboard</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-3">Meine Agents</h1>
              <p className="text-sm text-white/50 mt-1">
                {loading ? "Daten werden geladen..." : today}
              </p>
              {customerLabel && (
                <p className="text-xs text-white/40 mt-1">Account: {customerLabel}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="rounded-2xl flex items-center gap-2 text-xs uppercase tracking-[0.4em]"
                onClick={() => router.push("/dashboard/agents/new")}
              >
                <ArrowRight className="w-4 h-4" />
                Neuen Agent erstellen
              </Button>
              <Button variant="ghost" className="rounded-2xl flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/60">
                <LifeBuoy className="w-4 h-4" />
                Support
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 grid-container">
            {statsData.map((stat) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl bg-[#12121c] border border-white/[0.08] p-5"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 text-sm text-white/50 mb-2">
                  <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                  {stat.label}
                </div>
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {!loading && agents.length === 0 && (
            <motion.div
              className="mt-12 rounded-3xl bg-[#12121c] border border-white/[0.08] p-10 text-center"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                <Bot className="w-10 h-10 text-white/40" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Noch keine Agents</h2>
              <p className="text-sm text-white/50 mb-6">
                Beginnen Sie mit Ihrem ersten Agenten und lassen Sie Kundenanfragen automatisch beantworten.
              </p>
              <Button
                className="rounded-2xl px-6"
                onClick={() => router.push("/dashboard/agents/new")}
              >
                Ersten Agent erstellen
              </Button>
            </motion.div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3 grid-container">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                className="rounded-3xl bg-[#12121c] border border-white/[0.08] p-6 flex flex-col gap-4"
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-[0.3em]">{agent.template_id || "Agent"}</p>
                    <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(agent.status)}`}>
                    {agent.status === "active" ? "Aktiv" : "Inaktiv"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-white/50">
                  <div>
                    <p className="text-white text-xl font-bold">{120 + index * 6}</p>
                    <p className="text-xs uppercase tracking-[0.3em]">Nachrichten</p>
                  </div>
                  <div>
                    <p className="text-white text-xl font-bold">{28 + index * 3}</p>
                    <p className="text-xs uppercase tracking-[0.3em]">Gespräche</p>
                  </div>
                </div>

                <div className="text-xs text-white/40">
                  Letzte Aktivität: {formatLastActivity(agent.updated_at)}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Link href={`/dashboard/agents/${agent.id}`} className="w-full flex items-center justify-center gap-1">
                      Bearbeiten
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 border border-white/[0.08]">
                    Löschen
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 border border-white/[0.08]">
                    Vorschau
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
