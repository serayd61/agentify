"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  ThumbsUp,
  CalendarDays,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Mock analytics data
const analyticsData = {
  messages: 1234,
  messagesGrowth: 12.5,
  users: 156,
  usersGrowth: 8.3,
  avgResponse: 2.3,
  satisfaction: 92,
  satisfactionGrowth: 2.1,
};

// Chart data
const messageChart = [
  { day: "Mo", messages: 145 },
  { day: "Di", messages: 189 },
  { day: "Mi", messages: 167 },
  { day: "Do", messages: 212 },
  { day: "Fr", messages: 198 },
  { day: "Sa", messages: 145 },
  { day: "So", messages: 98 },
];

const userChart = [
  { day: "Mo", users: 23 },
  { day: "Di", users: 31 },
  { day: "Mi", users: 28 },
  { day: "Do", users: 39 },
  { day: "Fr", users: 36 },
  { day: "Sa", users: 21 },
  { day: "So", users: 15 },
];

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  growth,
  growthPositive,
}: {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string | number;
  unit?: string;
  growth?: number;
  growthPositive?: boolean;
}) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          {growth !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${
                growthPositive ? "text-[#34c759]" : "text-[#ff3b30]"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              {Math.abs(growth)}%
            </div>
          )}
        </div>
        <p className="text-white/60 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">
          {value}
          {unit && <span className="text-sm font-normal text-white/50"> {unit}</span>}
        </p>
      </Card>
    </motion.div>
  );
}

// Simple bar chart
function SimpleBarChart({
  data,
  label,
}: {
  data: Array<{ day: string; messages?: number; users?: number }>;
  label: string;
}) {
  const values = data.map((d) => d.messages || d.users || 0);
  const maxValue = Math.max(...values);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">{label}</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {data.map((d, i) => {
            const value = d.messages || d.users || 0;
            const height = (value / maxValue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-white/10 rounded-t-lg overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-[#8b5cf6] to-[#a78bfa] transition-all hover:from-[#7c3aed] hover:to-[#8b5cf6]"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs text-white/50">{d.day}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

// Feedback table
function FeedbackTable() {
  const feedbackData = [
    { time: "14:32", user: "User #1234", message: "Sehr hilfreich!", rating: 5 },
    { time: "14:28", user: "User #1233", message: "Gute Antworten", rating: 4 },
    { time: "14:15", user: "User #1232", message: "Schnelle Antworten", rating: 5 },
    { time: "14:05", user: "User #1231", message: "Könnte besser sein", rating: 3 },
    { time: "13:52", user: "User #1230", message: "Perfekt!", rating: 5 },
  ];

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Neuestes Feedback</h3>
        <div className="space-y-3">
          {feedbackData.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-all">
              <div className="flex-1">
                <p className="text-sm text-white font-medium mb-1">{item.message}</p>
                <p className="text-xs text-white/40">{item.user} • {item.time}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < item.rating ? "text-[#f59e0b]" : "text-white/20"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default function AgentAnalyticsPage() {
  const params = useParams();

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex-1 py-12"
      >
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/dashboard/agents/${params.id}`}
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Agent
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Analytik</h1>
                <p className="text-white/60">Detaillierte Statistiken und Metriken Ihres Agenten.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white transition-colors text-sm">
                <Download className="w-4 h-4" />
                Bericht
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <motion.div variants={fadeInUp} className="mb-8 flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white transition-colors text-sm">
              <CalendarDays className="w-4 h-4" />
              Letzte 7 Tage
            </button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              icon={MessageSquare}
              label="Nachrichten"
              value={analyticsData.messages}
              growth={analyticsData.messagesGrowth}
              growthPositive={true}
            />
            <StatCard
              icon={Users}
              label="Benutzer"
              value={analyticsData.users}
              growth={analyticsData.usersGrowth}
              growthPositive={true}
            />
            <StatCard
              icon={Clock}
              label="Durchschn. Antwortzeit"
              value={analyticsData.avgResponse}
              unit="s"
              growthPositive={false}
            />
            <StatCard
              icon={ThumbsUp}
              label="Zufriedenheit"
              value={analyticsData.satisfaction}
              unit="%"
              growth={analyticsData.satisfactionGrowth}
              growthPositive={true}
            />
          </motion.div>

          {/* Charts */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            <SimpleBarChart data={messageChart} label="Nachrichten pro Tag" />
            <SimpleBarChart data={userChart} label="Benutzer pro Tag" />
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-6"
          >
            <FeedbackTable />

            {/* Top Questions */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Fragen</h3>
                <div className="space-y-3">
                  {[
                    { question: "Wie buche ich einen Termin?", count: 45 },
                    { question: "Welche Öffnungszeiten haben Sie?", count: 38 },
                    { question: "Wie kann ich zahlen?", count: 32 },
                    { question: "Gibt es Rabatte?", count: 28 },
                    { question: "Wie lange dauert es?", count: 24 },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-all"
                    >
                      <p className="text-sm text-white">{item.question}</p>
                      <span className="text-xs font-semibold text-[#8b5cf6]">
                        {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
