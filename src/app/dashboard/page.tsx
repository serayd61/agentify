"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  Calendar,
  CheckCircle2,
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
};

const navItems = [
  { label: "Übersicht", icon: BarChart3, href: "/dashboard" },
  { label: "Meine Agents", icon: Bot, href: "/dashboard/agents" },
  { label: "Integrationen", icon: Upload, href: "/dashboard/integrations" },
  { label: "Einstellungen", icon: Settings, href: "/dashboard/settings" },
  { label: "Abrechnung", icon: CreditCard, href: "/dashboard/billing" },
];

const sampleActivities = [
  { title: "Agent \"Muster\" gestartet", time: "vor 2h" },
  { title: "Widget-Code kopiert", time: "vor 4h" },
  { title: "Neues Ticket erstellt", time: "gestern" },
];

const formVariant = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.55 } },
};



export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [agents, setAgents] = useState<CustomerAgent[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
        .select("id, name, status")
        .eq("customer_id", customerData?.id)
        .order("created_at", { ascending: false });

      setAgents(agentsData || []);
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
    <div className="min-h-screen bg-[#05050a] text-white">
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
                    className="rounded-2xl bg-[#12121c] border border-white/[0.08] p-5"
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

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <motion.div
                  className="rounded-3xl bg-[#12121c] border border-white/[0.08] p-6"
                  variants={formVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Letzte Aktivitäten</h2>
                      <p className="text-xs text-white/50">Immer auf dem Laufenden bleiben</p>
                    </div>
                    <Calendar className="w-5 h-5 text-white/60" />
                  </div>
                  <ul className="space-y-3">
                    {sampleActivities.map((item) => (
                      <li key={item.title} className="flex items-center justify-between text-sm text-white/60">
                        <span>{item.title}</span>
                        <span className="text-white/40 text-xs">{item.time}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  className="rounded-3xl bg-[#12121c] border border-white/[0.08] p-6 flex flex-col gap-4"
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
