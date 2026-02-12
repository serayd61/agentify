// Workflow Monitor - Metrics and health reporting

import {
  WorkflowExecution,
  WorkflowMetrics,
  TaskMetrics,
  ExecutionStatus,
} from './types';

export class WorkflowMonitor {
  private metrics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    totalDuration: number;
    taskMetrics: Map<string, TaskMetrics>;
    recentExecutions: WorkflowExecution[];
  };

  private maxRecentExecutions: number;

  constructor(maxRecentExecutions: number = 100) {
    this.maxRecentExecutions = maxRecentExecutions;
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalDuration: 0,
      taskMetrics: new Map(),
      recentExecutions: [],
    };
  }

  recordExecution(execution: WorkflowExecution): void {
    this.metrics.totalRuns++;

    if (execution.status === 'completed') {
      this.metrics.successfulRuns++;
    } else if (execution.status === 'failed') {
      this.metrics.failedRuns++;
    }

    if (execution.duration) {
      this.metrics.totalDuration += execution.duration;
    }

    // Record task metrics
    for (const [taskId, task] of Object.entries(execution.tasks)) {
      if (!this.metrics.taskMetrics.has(taskId)) {
        this.metrics.taskMetrics.set(taskId, {
          task_id: taskId,
          runs: 0,
          failures: 0,
          average_duration: 0,
          failure_rate: 0,
        });
      }

      const taskMetrics = this.metrics.taskMetrics.get(taskId)!;
      taskMetrics.runs++;

      if (task.status === 'failed') {
        taskMetrics.failures++;
      }

      if (task.duration) {
        const totalDuration = taskMetrics.average_duration * (taskMetrics.runs - 1) + task.duration;
        taskMetrics.average_duration = totalDuration / taskMetrics.runs;
      }

      taskMetrics.failure_rate = (taskMetrics.failures / taskMetrics.runs) * 100;
    }

    // Store recent execution
    this.metrics.recentExecutions.unshift(execution);
    if (this.metrics.recentExecutions.length > this.maxRecentExecutions) {
      this.metrics.recentExecutions.pop();
    }
  }

  getWorkflowMetrics(): WorkflowMetrics {
    const averageDuration = this.metrics.totalRuns > 0
      ? this.metrics.totalDuration / this.metrics.totalRuns
      : 0;

    const successRate = this.metrics.totalRuns > 0
      ? (this.metrics.successfulRuns / this.metrics.totalRuns) * 100
      : 0;

    const lastRun = this.metrics.recentExecutions[0]?.completed_at;

    return {
      total_runs: this.metrics.totalRuns,
      successful_runs: this.metrics.successfulRuns,
      failed_runs: this.metrics.failedRuns,
      average_duration: Math.round(averageDuration),
      last_run: lastRun,
      success_rate: Math.round(successRate * 100) / 100,
    };
  }

  getTaskMetrics(taskId?: string): TaskMetrics | TaskMetrics[] {
    if (taskId) {
      return this.metrics.taskMetrics.get(taskId) || {
        task_id: taskId,
        runs: 0,
        failures: 0,
        average_duration: 0,
        failure_rate: 0,
      };
    }

    return Array.from(this.metrics.taskMetrics.values());
  }

  getRecentExecutions(limit?: number): WorkflowExecution[] {
    const executions = this.metrics.recentExecutions;
    return limit ? executions.slice(0, limit) : executions;
  }

  getExecutionsByStatus(status: ExecutionStatus): WorkflowExecution[] {
    return this.metrics.recentExecutions.filter(e => e.status === status);
  }

  getHealthReport(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: WorkflowMetrics;
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.getWorkflowMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check success rate
    if (metrics.success_rate < 50) {
      issues.push(`Critical: Success rate is ${metrics.success_rate}%`);
      recommendations.push('Review failed workflows and fix underlying issues');
    } else if (metrics.success_rate < 80) {
      issues.push(`Warning: Success rate is ${metrics.success_rate}%`);
      recommendations.push('Investigate recent failures');
    }

    // Check for slow tasks
    const slowTasks = Array.from(this.metrics.taskMetrics.values())
      .filter(t => t.average_duration > 60000); // > 1 minute

    if (slowTasks.length > 0) {
      issues.push(`${slowTasks.length} task(s) have average duration > 1 minute`);
      recommendations.push('Consider optimizing slow tasks or increasing timeouts');
    }

    // Check for high failure rate tasks
    const problematicTasks = Array.from(this.metrics.taskMetrics.values())
      .filter(t => t.failure_rate > 20);

    if (problematicTasks.length > 0) {
      issues.push(`${problematicTasks.length} task(s) have failure rate > 20%`);
      recommendations.push('Review and fix frequently failing tasks');
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (metrics.success_rate < 50 || problematicTasks.length > 3) {
      status = 'unhealthy';
    } else if (metrics.success_rate < 80 || issues.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      metrics,
      issues,
      recommendations,
    };
  }

  reset(): void {
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalDuration: 0,
      taskMetrics: new Map(),
      recentExecutions: [],
    };
  }

  exportMetrics(): string {
    return JSON.stringify({
      workflow: this.getWorkflowMetrics(),
      tasks: this.getTaskMetrics(),
      recent: this.getRecentExecutions(10),
    }, null, 2);
  }
}

// Singleton instance for global monitoring
let globalMonitor: WorkflowMonitor | null = null;

export function getMonitor(): WorkflowMonitor {
  if (!globalMonitor) {
    globalMonitor = new WorkflowMonitor();
  }
  return globalMonitor;
}

export function createMonitor(maxRecentExecutions?: number): WorkflowMonitor {
  return new WorkflowMonitor(maxRecentExecutions);
}
