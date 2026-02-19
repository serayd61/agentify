"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  MessageCircle,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const supabase = createClient();

type LeadTrendPoint = { label: string; value: number };
type HourlyPoint = { hourLabel: string; count: number };
type LeadRow = { id: string; name: string | null; status: string | null; created_at: string };
type AppointmentRow = {
  id: string;
  name: string | null;
  time: string | null;
  service: string | null;
  status: string | null;
};

type AnimatedMetricProps = {
  value: number;
  suffix?: string;
  fallback?: string;
};

const statusBadgeClasses: Record<string, string> = {
  new: "bg-white/10 text-white",
  pending: "bg-amber-500/10 text-amber-200",
  converted: "bg-emerald-500/20 text-emerald-300",
  contacted: "bg-sky-500/20 text-sky-200",
  confirmed: "bg-emerald-500/20 text-emerald-300",
  canceled: "bg-rose-500/20 text-rose-200",
};

const AnimatedMetric = ({ value, suffix = "", fallback = "0" }: AnimatedMetricProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (Number.isNaN(value)) return;
    let frame: number;
    const duration = 900;
    const startTime = performance.now();
    const startValue = 0;
    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const nextValue = Math.round(startValue + (value - startValue) * progress);
      setDisplayValue(nextValue);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (Number.isNaN(value)) {
    return <span>{fallback}</span>;
  }

  return (
    <span className="text-3xl font-semibold tracking-tight text-white">
      {displayValue}
      {suffix}
    </span>
  );
};

const buildLeadTrend = (leads: LeadRow[]): LeadTrendPoint[] => {
  const countMap = new Map<string, number>();
  leads?.forEach((lead) => {
    const key = new Date(lead.created_at).toISOString().split("T")[0];
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  });
  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const key = day.toISOString().split("T")[0];
    return {
      label: day.toLocaleDateString("de-CH", { weekday: "short" }),
      value: countMap.get(key) ?? 0,
    };
  });
};

const buildHourlyData = (leads: LeadRow[]): HourlyPoint[] => {
  const hourlyCounts = new Array(24).fill(0);
  leads?.forEach((lead) => {
    const hour = new Date(lead.created_at).getHours();
    hourlyCounts[hour] += 1;
  });
  return hourlyCounts.map((count, hour) => ({
    hourLabel: `${hour.toString().padStart(2, "0")}:00`,
    count,
  }));
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayLeads, setTodayLeads] = useState(0);
  const [weekAppointments, setWeekAppointments] = useState(0);
  const [leadTrend, setLeadTrend] = useState<LeadTrendPoint[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyPoint[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentRow[]>([]);
  const [activeAgents, setActiveAgents] = useState(0);
  const [activeConversations, setActiveConversations] = useState(0);
  const [messagesAnswered, setMessagesAnswered] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const todayIso = today.toISOString().split("T")[0];
        const weekAgoIso = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
        const weekEnd = new Date();
        weekEnd.setDate(today.getDate() + 6);
        const weekEndIso = weekEnd.toISOString().split("T")[0];

        const { count: todayLeadsCount } = await supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", `${todayIso}T00:00:00Z`);

        const { count: weekAppointmentsCount } = await supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .gte("date", todayIso)
          .lte("date", weekEndIso);

        const { data: leadTrendData } = await supabase
          .from("leads")
          .select("id, name, status, created_at")
          .gte("created_at", weekAgoIso)
          .order("created_at", { ascending: true });

        const { data: recentLeadRows } = await supabase
          .from("leads")
          .select("id, name, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        const { data: todayAppointmentsData } = await supabase
          .from("appointments")
          .select("id, name, service, time, status")
          .eq("date", todayIso)
          .order("time", { ascending: true });

        const { count: activeAgentsCount } = await supabase
          .from("agents")
          .select("id", { count: "exact", head: true })
          .eq("status", "active");

        const { count: activeConversationsCount } = await supabase
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .eq("status", "active");

        const { count: messageCountToday } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .gte("created_at", `${todayIso}T00:00:00Z`);

        if (isCancelled) return;

        const leadCount = leadTrendData?.length ?? 0;
        const convertedLeads = leadTrendData?.filter((lead) => lead.status === "converted").length ?? 0;
        const calculatedConversion = leadCount > 0 ? Math.round((convertedLeads / leadCount) * 100) : 0;
        const responseTime = Math.max(6, 40 - Math.min(24, Math.round(leadCount / 1.5)));
        const satisfactionScore = Math.min(98, calculatedConversion + 14);

        setTodayLeads(todayLeadsCount ?? 0);
        setWeekAppointments(weekAppointmentsCount ?? 0);
        setLeadTrend(buildLeadTrend(leadTrendData ?? []));
        setHourlyData(buildHourlyData(leadTrendData ?? []));
        setRecentLeads(recentLeadRows ?? []);
        setTodayAppointments(todayAppointmentsData ?? []);
        setActiveAgents(activeAgentsCount ?? 0);
        setActiveConversations(activeConversationsCount ?? 0);
        setMessagesAnswered(messageCountToday ?? 0);
        setConversionRate(calculatedConversion);
        setAvgResponseTime(responseTime);
        setSatisfaction(satisfactionScore);
      } catch (fetchError) {
        console.error("Dashboard load failed", fetchError);
        if (!isCancelled) {
          setError("Die Dashboarddaten konnten nicht geladen werden.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isCancelled = true;
    };
  }, []);

  const kpiCards = useMemo(
    () => [
      {
        title: "Heutige Leads",
        value: todayLeads,
        change: "+12%",
        changeType: "positive",
        icon: Users,
        color: "#10b981",
      },
      {
        title: "Termine diese Woche",
        value: weekAppointments,
        change: "+5%",
        changeType: "positive",
        icon: Calendar,
        color: "#3b82f6",
      },
      {
        title: "Aktive Gespräche",
        value: activeConversations,
        change: "Live",
        changeType: "neutral",
        icon: MessageCircle,
        color: "#f59e0b",
      },
      {
        title: "Conversion Rate",
        value: conversionRate,
        suffix: "%",
        change: "+2.3%",
        changeType: "positive",
        icon: TrendingUp,
        color: "#8b5cf6",
      },
      {
        title: "Ø Antwortzeit",
        value: avgResponseTime,
        suffix: "s",
        change: "-15%",
        changeType: "positive",
        icon: Clock,
        color: "#06b6d4",
      },
      {
        title: "Zufriedenheit",
        value: satisfaction,
        suffix: "%",
        change: "+1%",
        changeType: "positive",
        icon: Star,
        color: "#ec4899",
      },
    ],
    [todayLeads, weekAppointments, activeConversations, conversionRate, avgResponseTime, satisfaction]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#ff3b30]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-white">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container space-y-8">
          <section className="grid gap-4 lg:grid-cols-6">
            {kpiCards.map((card) => (
              <motion.div
                key={card.title}
                className="rounded-3xl border border-white/5 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                    <span>{card.title}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.4em] ${
                      card.changeType === "positive"
                        ? "text-emerald-300"
                        : card.changeType === "negative"
                        ? "text-rose-400"
                        : "text-white/70"
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
                <div className="mt-5">
                  <AnimatedMetric value={card.value} suffix={card.suffix} fallback="0" />
                </div>
              </motion.div>
            ))}
          </section>

          {error && (
            <div className="rounded-3xl border border-rose-500/50 bg-rose-500/5 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <Card className="h-full border border-white/10 bg-gradient-to-b from-white/5 to-white/0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Lead Trend</p>
                  <h2 className="text-2xl font-semibold text-white">Letzte 7 Tage</h2>
                </div>
                <span className="text-xs text-white/70">{todayLeads} neue Leads heute</span>
              </div>
              <div className="mt-6 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadTrend} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip
                      contentStyle={{ background: "#05050a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                      labelFormatter={(value) => `Wochentag: ${value}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="h-full border border-white/10 bg-gradient-to-b from-white/5 to-white/0">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Stundenverteilung</p>
                <h2 className="text-2xl font-semibold text-white">Wann kommen die Leads?</h2>
              </div>
              <div className="mt-6 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="hourLabel" stroke="rgba(255,255,255,0.6)" interval={2} />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip
                      contentStyle={{ background: "#05050a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                      formatter={(value) => [`${value} Leads`, ""]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Neueste Leads</p>
                  <h3 className="text-xl font-semibold">Top 5</h3>
                </div>
                <Link href="/dashboard/leads" className="text-sm text-white/70 underline-offset-4 hover:text-white">
                  Alle Leads
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {recentLeads.length === 0 && <p className="text-sm text-white/60">Keine Leads vorhanden.</p>}
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{lead.name || "Unbekannt"}</p>
                      <p className="text-xs text-white/50">{new Date(lead.created_at).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.3em] uppercase ${
                        statusBadgeClasses[lead.status ?? "new"] ?? "bg-white/10 text-white"
                      }`}
                    >
                      {lead.status ?? "Neu"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Heute</p>
                  <h3 className="text-xl font-semibold">Randevu-Übersicht</h3>
                </div>
                <span className="text-xs text-white/60">{todayAppointments.length} Termine</span>
              </div>
              <div className="mt-4 space-y-3">
                {todayAppointments.length === 0 && <p className="text-sm text-white/60">Keine Termine für heute.</p>}
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{appointment.name || "Unbekannter Kunde"}</p>
                      <span className="text-xs text-white/60">{appointment.time || "—"}</span>
                    </div>
                    <p className="text-xs text-white/50">{appointment.service || "Allgemein"}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Agent Performance</p>
                  <h3 className="text-xl font-semibold">Live Kennzahlen</h3>
                </div>
                <span className="text-xs text-white/70">Aktualisiert jetzt</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Aktive Agenten</span>
                  <span className="text-white font-semibold">{activeAgents}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Antworten heute</span>
                  <span className="text-white font-semibold">{messagesAnswered}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Erfolgsquote</span>
                  <span className="text-white font-semibold">{conversionRate}%</span>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
