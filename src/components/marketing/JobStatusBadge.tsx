"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  jobId: string;
}

type JobStatus = "pending" | "running" | "completed" | "failed";

interface JobData {
  status: JobStatus;
  result?: Record<string, unknown>;
  error?: string;
  job_type?: string;
}

export function JobStatusBadge({ jobId }: JobStatusBadgeProps) {
  const [job, setJob] = useState<JobData | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/marketing/status/${jobId}`);
        if (!res.ok) return;
        const data: JobData = await res.json();
        if (active) setJob(data);
      } catch {
        // network error — will retry
      }
    }

    poll();

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [jobId, tick]);

  // Once terminal, stop polling
  useEffect(() => {
    if (job?.status === "completed" || job?.status === "failed") {
      // No-op: interval will still run but we check in poll
    }
  }, [job?.status]);

  if (!job) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Job wird gestartet…</span>
      </div>
    );
  }

  const isRunning = job.status === "pending" || job.status === "running";

  // Extract result link (PandaDoc, Google Sheet, etc.)
  const resultLink =
    (job.result?.internalLink as string) ||
    (job.result?.sheet_url as string) ||
    (job.result?.documentId
      ? `https://app.pandadoc.com/a/#/documents/${job.result.documentId}`
      : undefined);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        job.status === "completed" &&
          "bg-emerald-500/10 border-emerald-500/20",
        job.status === "failed" && "bg-rose-500/10 border-rose-500/20",
        isRunning && "bg-white/5 border-white/10"
      )}
    >
      <div className="flex items-start gap-3">
        {isRunning && (
          <Loader2 className="w-5 h-5 text-white/60 animate-spin mt-0.5 shrink-0" />
        )}
        {job.status === "completed" && (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        )}
        {job.status === "failed" && (
          <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-semibold",
              isRunning && "text-white/70",
              job.status === "completed" && "text-emerald-300",
              job.status === "failed" && "text-rose-300"
            )}
          >
            {isRunning && "Wird verarbeitet…"}
            {job.status === "completed" && "Erfolgreich abgeschlossen"}
            {job.status === "failed" && "Fehlgeschlagen"}
          </p>

          {job.status === "completed" && resultLink && (
            <a
              href={resultLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Ergebnis öffnen
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {job.status === "failed" && job.error && (
            <p className="mt-1 text-xs text-rose-300/70 font-mono truncate">
              {job.error}
            </p>
          )}

          <p className="mt-1 text-xs text-white/30">Job ID: {jobId.slice(0, 8)}…</p>
        </div>
      </div>
    </div>
  );
}
