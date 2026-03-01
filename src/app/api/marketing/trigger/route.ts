import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { callModalWebhook, type ModalSlug } from "@/lib/marketing/modal-client";

// 60s max for Vercel Pro; proposal creation + PandaDoc polling can take ~30s
export const maxDuration = 60;

type JobType = "lead_scrape" | "proposal" | "email_automation";

const JOB_CONFIG: Record<JobType, { slug: ModalSlug; label: string }> = {
  proposal: { slug: "create-proposal", label: "Proposal erstellen" },
  email_automation: { slug: "instantly-autoreply", label: "E-Mail Autoreply" },
  lead_scrape: { slug: "create-proposal", label: "Leads scrapen" }, // placeholder slug
};

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  let body: { jobType: JobType; params: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Anfrage" }, { status: 400 });
  }

  const { jobType, params } = body;
  const config = JOB_CONFIG[jobType];
  if (!config) {
    return NextResponse.json(
      { error: `Unbekannter Job-Typ: ${jobType}` },
      { status: 400 }
    );
  }

  // Create job record in Supabase
  const { data: jobData, error: insertError } = await supabase
    .from("marketing_jobs")
    .insert({
      user_id: user.id,
      job_type: jobType,
      modal_slug: config.slug,
      input_params: params,
      status: "running",
    })
    .select("id")
    .single();

  if (insertError || !jobData) {
    console.error("marketing_jobs insert error:", insertError);
    return NextResponse.json({ error: "Job konnte nicht erstellt werden" }, { status: 500 });
  }

  const jobId = jobData.id;

  try {
    const result = await callModalWebhook({ slug: config.slug, data: params });

    const isSuccess = result.status === "success";
    await supabase
      .from("marketing_jobs")
      .update({
        status: isSuccess ? "completed" : "failed",
        result: result.result ?? (result.response ? { response: result.response } : undefined),
        error: result.error,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ jobId, status: result.status, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("marketing_jobs")
      .update({
        status: "failed",
        error: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ jobId, status: "failed", error: message }, { status: 500 });
  }
}
