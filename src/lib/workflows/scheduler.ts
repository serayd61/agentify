// Workflow Scheduler - Cron job management

import { WorkflowDefinition, WorkflowExecution } from './types';
import { createOrchestrator } from './orchestrator';
import { getMonitor } from './monitor';

export interface ScheduledJob {
  id: string;
  workflow: WorkflowDefinition;
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

export interface CronJobConfig {
  id: string;
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled?: boolean;
}

// Predefined scheduled jobs for Agentify
export const SCHEDULED_JOBS: CronJobConfig[] = [
  {
    id: 'cleanup-expired-sessions',
    name: 'Cleanup Expired Sessions',
    schedule: '0 2 * * *', // Daily at 2 AM
    handler: async () => {
      console.log('[Scheduler] Running cleanup-expired-sessions');
      // Implementation would clean up expired auth sessions
    },
  },
  {
    id: 'aggregate-analytics',
    name: 'Aggregate Weekly Analytics',
    schedule: '0 0 * * 1', // Every Monday at midnight
    handler: async () => {
      console.log('[Scheduler] Running aggregate-analytics');
      // Implementation would aggregate usage analytics
    },
  },
  {
    id: 'subscription-renewal-check',
    name: 'Check Subscription Renewals',
    schedule: '0 8 * * *', // Daily at 8 AM
    handler: async () => {
      console.log('[Scheduler] Running subscription-renewal-check');
      // Implementation would check for upcoming renewals
    },
  },
  {
    id: 'agent-health-check',
    name: 'Agent Health Check',
    schedule: '0 * * * *', // Every hour
    handler: async () => {
      console.log('[Scheduler] Running agent-health-check');
      // Implementation would check agent status
    },
  },
];

export class WorkflowScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private cronJobs: Map<string, CronJobConfig> = new Map();

  constructor() {
    // Register predefined jobs
    for (const job of SCHEDULED_JOBS) {
      this.cronJobs.set(job.id, { ...job, enabled: job.enabled ?? true });
    }
  }

  registerWorkflow(workflow: WorkflowDefinition, schedule: string): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const job: ScheduledJob = {
      id: jobId,
      workflow,
      schedule,
      enabled: true,
      runCount: 0,
    };

    this.jobs.set(jobId, job);
    this.calculateNextRun(job);

    return jobId;
  }

  unregisterWorkflow(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  enableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = true;
      this.calculateNextRun(job);
      return true;
    }
    return false;
  }

  disableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = false;
      job.nextRun = undefined;
      return true;
    }
    return false;
  }

  async runJob(jobId: string): Promise<WorkflowExecution | null> {
    // Check if it's a workflow job
    const workflowJob = this.jobs.get(jobId);
    if (workflowJob) {
      return this.executeWorkflowJob(workflowJob);
    }

    // Check if it's a cron job
    const cronJob = this.cronJobs.get(jobId);
    if (cronJob) {
      await cronJob.handler();
      return null;
    }

    throw new Error(`Job not found: ${jobId}`);
  }

  private async executeWorkflowJob(job: ScheduledJob): Promise<WorkflowExecution> {
    const orchestrator = createOrchestrator();
    const monitor = getMonitor();

    job.lastRun = new Date().toISOString();
    job.runCount++;

    const execution = await orchestrator.execute(job.workflow);
    monitor.recordExecution(execution);

    this.calculateNextRun(job);

    return execution;
  }

  // Handle Vercel Cron request
  async handleCronRequest(jobId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.runJob(jobId);
      return { success: true, message: `Job ${jobId} executed successfully` };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, message };
    }
  }

  getJob(jobId: string): ScheduledJob | CronJobConfig | undefined {
    return this.jobs.get(jobId) || this.cronJobs.get(jobId);
  }

  getAllJobs(): { workflows: ScheduledJob[]; cron: CronJobConfig[] } {
    return {
      workflows: Array.from(this.jobs.values()),
      cron: Array.from(this.cronJobs.values()),
    };
  }

  getEnabledJobs(): (ScheduledJob | CronJobConfig)[] {
    const workflows = Array.from(this.jobs.values()).filter(j => j.enabled);
    const cron = Array.from(this.cronJobs.values()).filter(j => j.enabled);
    return [...workflows, ...cron];
  }

  private calculateNextRun(job: ScheduledJob): void {
    if (!job.enabled) {
      job.nextRun = undefined;
      return;
    }

    // Simple next run calculation based on cron expression
    // In production, use a proper cron parser library
    const now = new Date();
    const parts = job.schedule.split(' ');
    
    if (parts.length !== 5) {
      console.warn(`Invalid cron expression: ${job.schedule}`);
      return;
    }

    // For simplicity, just add appropriate interval
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    const next = new Date(now);
    
    if (minute !== '*') {
      next.setMinutes(parseInt(minute, 10));
    }
    
    if (hour !== '*') {
      next.setHours(parseInt(hour, 10));
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    }

    job.nextRun = next.toISOString();
  }

  // Parse cron expression (simplified)
  static parseCron(expression: string): {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  } {
    const parts = expression.split(' ');
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression');
    }

    return {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    };
  }
}

// Singleton instance
let globalScheduler: WorkflowScheduler | null = null;

export function getScheduler(): WorkflowScheduler {
  if (!globalScheduler) {
    globalScheduler = new WorkflowScheduler();
  }
  return globalScheduler;
}

export function createScheduler(): WorkflowScheduler {
  return new WorkflowScheduler();
}
