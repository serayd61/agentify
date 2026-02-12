import { NextResponse } from 'next/server';
import { getMonitor, getScheduler } from '@/lib/workflows';

// GET /api/workflows/health - Get workflow system health
export async function GET() {
  try {
    const monitor = getMonitor();
    const scheduler = getScheduler();

    const healthReport = monitor.getHealthReport();
    const jobs = scheduler.getAllJobs();
    const enabledJobs = scheduler.getEnabledJobs();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        status: healthReport.status,
        metrics: healthReport.metrics,
        issues: healthReport.issues,
        recommendations: healthReport.recommendations,
      },
      scheduler: {
        total_workflow_jobs: jobs.workflows.length,
        total_cron_jobs: jobs.cron.length,
        enabled_jobs: enabledJobs.length,
        jobs: {
          workflows: jobs.workflows.map(j => ({
            id: j.id,
            workflow: j.workflow.name,
            schedule: j.schedule,
            enabled: j.enabled,
            lastRun: j.lastRun,
            nextRun: j.nextRun,
            runCount: j.runCount,
          })),
          cron: jobs.cron.map(j => ({
            id: j.id,
            name: j.name,
            schedule: j.schedule,
            enabled: j.enabled,
          })),
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: message,
        health: { status: 'unhealthy' },
      },
      { status: 500 }
    );
  }
}
