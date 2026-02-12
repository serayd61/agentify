"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Zap,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Timer,
} from "lucide-react";

interface WorkflowMetrics {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  average_duration: number;
  last_run?: string;
  success_rate: number;
}

interface HealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  metrics: WorkflowMetrics;
  issues: string[];
  recommendations: string[];
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
}

interface WorkflowExecution {
  id: string;
  workflow_name: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  duration?: number;
  error?: string;
}

export default function WorkflowsPage() {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      // Load health data
      const healthRes = await fetch("/api/workflows/health");
      const healthData = await healthRes.json();

      if (healthData.success) {
        setHealth(healthData.health);
        setCronJobs(healthData.scheduler?.jobs?.cron || []);
      }

      // Load recent executions
      const execRes = await fetch("/api/workflows");
      const execData = await execRes.json();

      if (execData.success) {
        setExecutions(execData.data?.recentExecutions || []);
      }
    } catch (error) {
      console.error("Failed to load workflow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runJob = async (jobId: string) => {
    setRunningJob(jobId);
    try {
      const res = await fetch("/api/workflows/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (data.success) {
        // Reload data after job execution
        await loadWorkflowData();
      } else {
        console.error("Job failed:", data.error);
      }
    } catch (error) {
      console.error("Failed to run job:", error);
    } finally {
      setRunningJob(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-[#34c759]" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-[#ff3b30]" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-[#007aff] animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-[#34c759]";
      case "degraded":
        return "text-[#ff9500]";
      case "unhealthy":
        return "text-[#ff3b30]";
      default:
        return "text-white/40";
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatSchedule = (cron: string) => {
    const scheduleMap: Record<string, string> = {
      "0 2 * * *": "Täglich um 02:00",
      "0 0 * * 1": "Montags um 00:00",
      "0 8 * * *": "Täglich um 08:00",
      "0 * * * *": "Stündlich",
    };
    return scheduleMap[cron] || cron;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Workflow Orchestrator
              </h1>
              <p className="text-white/50">
                Verwalten Sie automatisierte Aufgaben und überwachen Sie deren Ausführung.
              </p>
            </div>
            <Button onClick={loadWorkflowData} variant="secondary">
              <RefreshCw className="w-4 h-4" />
              Aktualisieren
            </Button>
          </div>

          {/* Health Status */}
          {health && (
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      health.status === "healthy"
                        ? "bg-[#34c759]/15"
                        : health.status === "degraded"
                        ? "bg-[#ff9500]/15"
                        : "bg-[#ff3b30]/15"
                    }`}
                  >
                    <Activity
                      className={`w-6 h-6 ${getHealthStatusColor(health.status)}`}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      System Status
                    </h2>
                    <p className={`text-sm ${getHealthStatusColor(health.status)}`}>
                      {health.status === "healthy"
                        ? "Alle Systeme funktionieren"
                        : health.status === "degraded"
                        ? "Einige Probleme erkannt"
                        : "Kritische Probleme"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white/[0.02] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[#8b5cf6]" />
                    <span className="text-sm text-white/50">Ausführungen</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {health.metrics.total_runs}
                  </p>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#34c759]" />
                    <span className="text-sm text-white/50">Erfolgsrate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {health.metrics.success_rate}%
                  </p>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-[#007aff]" />
                    <span className="text-sm text-white/50">Ø Dauer</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatDuration(health.metrics.average_duration)}
                  </p>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-[#ff3b30]" />
                    <span className="text-sm text-white/50">Fehlgeschlagen</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {health.metrics.failed_runs}
                  </p>
                </div>
              </div>

              {/* Issues & Recommendations */}
              {(health.issues.length > 0 || health.recommendations.length > 0) && (
                <div className="space-y-3">
                  {health.issues.map((issue, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-[#ff9500]/10 rounded-lg"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#ff9500] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#ff9500]">{issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Scheduled Jobs */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Geplante Aufgaben
              </h2>
              <div className="space-y-4">
                {cronJobs.map((job) => (
                  <Card key={job.id} className="hover:border-[#8b5cf6]/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            job.enabled ? "bg-[#8b5cf6]/15" : "bg-white/5"
                          }`}
                        >
                          <Calendar
                            className={`w-5 h-5 ${
                              job.enabled ? "text-[#8b5cf6]" : "text-white/30"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{job.name}</h3>
                          <p className="text-sm text-white/40">
                            {formatSchedule(job.schedule)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            job.enabled
                              ? "bg-[#34c759]/15 text-[#34c759]"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {job.enabled ? "Aktiv" : "Inaktiv"}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => runJob(job.id)}
                          disabled={runningJob === job.id}
                        >
                          {runningJob === job.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {cronJobs.length === 0 && (
                  <Card className="text-center py-8">
                    <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">Keine geplanten Aufgaben</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Executions */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Letzte Ausführungen
              </h2>
              <div className="space-y-4">
                {executions.slice(0, 5).map((exec) => (
                  <Card key={exec.id} className="hover:border-[#8b5cf6]/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(exec.status)}
                        <div>
                          <h3 className="font-semibold text-white">
                            {exec.workflow_name}
                          </h3>
                          <p className="text-sm text-white/40">
                            {exec.started_at
                              ? new Date(exec.started_at).toLocaleString("de-CH")
                              : "Unbekannt"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            exec.status === "completed"
                              ? "text-[#34c759]"
                              : exec.status === "failed"
                              ? "text-[#ff3b30]"
                              : "text-[#007aff]"
                          }`}
                        >
                          {exec.status === "completed"
                            ? "Erfolgreich"
                            : exec.status === "failed"
                            ? "Fehlgeschlagen"
                            : "Läuft"}
                        </p>
                        {exec.duration && (
                          <p className="text-xs text-white/30">
                            {formatDuration(exec.duration)}
                          </p>
                        )}
                      </div>
                    </div>
                    {exec.error && (
                      <div className="mt-3 p-2 bg-[#ff3b30]/10 rounded text-xs text-[#ff3b30]">
                        {exec.error}
                      </div>
                    )}
                  </Card>
                ))}

                {executions.length === 0 && (
                  <Card className="text-center py-8">
                    <Activity className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">Keine Ausführungen vorhanden</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
