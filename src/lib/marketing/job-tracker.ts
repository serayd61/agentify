/**
 * Marketing job tracker
 * CRUD operations for marketing_jobs table in Supabase
 */

import { createClient } from "@/lib/supabase/client";

export type JobType = "lead_scrape" | "proposal" | "email_automation" | "gmaps_pipeline";
export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface MarketingJob {
  id: string;
  jobType: JobType;
  status: JobStatus;
  modalSlug: string;
  inputParams: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

function mapRow(row: Record<string, unknown>): MarketingJob {
  return {
    id: row.id as string,
    jobType: row.job_type as JobType,
    status: row.status as JobStatus,
    modalSlug: row.modal_slug as string,
    inputParams: (row.input_params as Record<string, unknown>) ?? {},
    result: row.result as Record<string, unknown> | undefined,
    error: row.error as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    completedAt: row.completed_at as string | undefined,
  };
}

export async function createJob(params: {
  userId: string;
  jobType: JobType;
  modalSlug: string;
  inputParams: Record<string, unknown>;
}): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketing_jobs")
    .insert({
      user_id: params.userId,
      job_type: params.jobType,
      modal_slug: params.modalSlug,
      input_params: params.inputParams,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("createJob error:", error);
    return null;
  }
  return data.id;
}

export async function updateJob(
  jobId: string,
  update: {
    status?: JobStatus;
    result?: Record<string, unknown>;
    error?: string;
  }
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  const payload: Record<string, unknown> = {};
  if (update.status !== undefined) payload.status = update.status;
  if (update.result !== undefined) payload.result = update.result;
  if (update.error !== undefined) payload.error = update.error;
  if (update.status === "completed" || update.status === "failed") {
    payload.completed_at = new Date().toISOString();
  }

  await supabase.from("marketing_jobs").update(payload).eq("id", jobId);
}

export async function getJob(jobId: string): Promise<MarketingJob | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketing_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function listJobs(limit = 20): Promise<MarketingJob[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("marketing_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}
