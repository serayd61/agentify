"use client";

import { useEffect, useState } from "react";
import { listJobs, type MarketingJob } from "@/lib/marketing/job-tracker";
import { Loader2, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const JOB_LABELS: Record<string, string> = {
  proposal: "Proposal erstellt",
  lead_scrape: "Leads gescrapt",
  email_automation: "Autoreply",
  gmaps_pipeline: "Google Maps Pipeline",
};

const STATUS_ICON = {
  pending: <Clock className="w-4 h-4 text-white/40" />,
  running: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  failed: <XCircle className="w-4 h-4 text-rose-400" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return `vor ${Math.floor(hours / 24)} Tagen`;
}

interface Props {
  initialJobs?: MarketingJob[];
}

export function MarketingActivityFeed({ initialJobs = [] }: Props) {
  const [jobs, setJobs] = useState<MarketingJob[]>(initialJobs);
  const [loading, setLoading] = useState(initialJobs.length === 0);

  useEffect(() => {
    if (initialJobs.length > 0) return;
    listJobs(15).then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, [initialJobs.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-white/40">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Aktivitäten werden geladen…</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <Zap className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">Noch keine Aktivitäten</p>
        <p className="text-xs text-white/25 mt-1">
          Starte deinen ersten Marketing-Job über die Karten oben
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div
          key={job.id}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
            "bg-[#12121c] border-white/[0.06] hover:border-white/[0.10]"
          )}
        >
          <div className="shrink-0">{STATUS_ICON[job.status]}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">
              {JOB_LABELS[job.jobType] ?? job.jobType}
            </p>
            <p className="text-xs text-white/35 truncate">
              {Object.entries(job.inputParams)
                .slice(0, 2)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span
              className={cn(
                "inline-block text-xs px-2 py-0.5 rounded-full font-medium",
                job.status === "completed" && "bg-emerald-500/15 text-emerald-400",
                job.status === "failed" && "bg-rose-500/15 text-rose-400",
                job.status === "running" && "bg-blue-500/15 text-blue-400",
                job.status === "pending" && "bg-white/10 text-white/40"
              )}
            >
              {job.status}
            </span>
            <p className="text-xs text-white/25 mt-0.5">{timeAgo(job.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
