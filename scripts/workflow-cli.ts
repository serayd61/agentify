#!/usr/bin/env npx ts-node

/**
 * Workflow CLI Tool
 * 
 * Usage:
 *   npx ts-node scripts/workflow-cli.ts run <workflow-file>
 *   npx ts-node scripts/workflow-cli.ts status
 *   npx ts-node scripts/workflow-cli.ts history [--limit N]
 *   npx ts-node scripts/workflow-cli.ts jobs
 *   npx ts-node scripts/workflow-cli.ts trigger <job-id>
 */

import * as fs from 'fs';
import * as path from 'path';

// Simple color helpers for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message: string): void {
  console.error(`${colors.red}Error: ${message}${colors.reset}`);
}

function logSuccess(message: string): void {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logInfo(message: string): void {
  console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

async function main(): Promise<void> {
  if (!command) {
    printHelp();
    process.exit(1);
  }

  switch (command) {
    case 'run':
      await runWorkflow(args[1]);
      break;
    case 'status':
      await showStatus();
      break;
    case 'history':
      await showHistory(parseInt(args[2]) || 10);
      break;
    case 'jobs':
      await listJobs();
      break;
    case 'trigger':
      await triggerJob(args[1]);
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      logError(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
${colors.cyan}Workflow CLI - Agentify Workflow Orchestrator${colors.reset}

${colors.yellow}Usage:${colors.reset}
  workflow-cli <command> [options]

${colors.yellow}Commands:${colors.reset}
  run <file>        Run a workflow from a JSON file
  status            Show current workflow system status
  history [--limit] Show recent workflow executions
  jobs              List all scheduled jobs
  trigger <job-id>  Manually trigger a scheduled job
  help              Show this help message

${colors.yellow}Examples:${colors.reset}
  workflow-cli run deployment.workflow.json
  workflow-cli status
  workflow-cli history --limit 5
  workflow-cli jobs
  workflow-cli trigger cleanup-expired-sessions

${colors.yellow}Workflow File Format:${colors.reset}
  {
    "name": "my-workflow",
    "version": "1.0.0",
    "tasks": [
      {
        "id": "task-1",
        "name": "First Task",
        "type": "shell",
        "command": "echo 'Hello World'"
      }
    ]
  }
`);
}

async function runWorkflow(filePath: string): Promise<void> {
  if (!filePath) {
    logError('Please provide a workflow file path');
    process.exit(1);
  }

  const fullPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    logError(`Workflow file not found: ${fullPath}`);
    process.exit(1);
  }

  logInfo(`Loading workflow from: ${fullPath}`);

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const workflow = JSON.parse(content);

    log(`\n${colors.cyan}Workflow: ${workflow.name}${colors.reset}`);
    log(`Version: ${workflow.version || '1.0.0'}`, 'gray');
    log(`Tasks: ${workflow.tasks?.length || 0}`, 'gray');
    log('');

    // Import and run orchestrator
    const { createOrchestrator, getMonitor } = await import('../src/lib/workflows');
    
    const orchestrator = createOrchestrator({ log_level: 'info' });
    const monitor = getMonitor();

    log('Starting workflow execution...', 'yellow');
    console.log('');

    const startTime = Date.now();
    const execution = await orchestrator.execute(workflow);
    const duration = Date.now() - startTime;

    monitor.recordExecution(execution);

    console.log('');
    
    if (execution.status === 'completed') {
      logSuccess(`Workflow completed successfully in ${duration}ms`);
    } else {
      logError(`Workflow failed: ${execution.error}`);
    }

    // Print task summary
    console.log('\n--- Task Summary ---');
    for (const [_taskId, task] of Object.entries(execution.tasks)) {
      const statusIcon = task.status === 'completed' ? '✓' : task.status === 'failed' ? '✗' : '○';
      const statusColor = task.status === 'completed' ? 'green' : task.status === 'failed' ? 'red' : 'gray';
      log(`${statusIcon} ${task.name} (${task.duration || 0}ms)`, statusColor);
    }

    process.exit(execution.status === 'completed' ? 0 : 1);
  } catch (error) {
    logError(`Failed to run workflow: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function showStatus(): Promise<void> {
  logInfo('Fetching workflow system status...\n');

  try {
    const { getMonitor, getScheduler } = await import('../src/lib/workflows');
    
    const monitor = getMonitor();
    const scheduler = getScheduler();

    const health = monitor.getHealthReport();
    const jobs = scheduler.getAllJobs();

    // Health status
    const statusColor = health.status === 'healthy' ? 'green' : health.status === 'degraded' ? 'yellow' : 'red';
    log(`System Status: ${health.status.toUpperCase()}`, statusColor);
    console.log('');

    // Metrics
    log('--- Metrics ---', 'cyan');
    log(`Total Runs: ${health.metrics.total_runs}`);
    log(`Success Rate: ${health.metrics.success_rate}%`);
    log(`Average Duration: ${health.metrics.average_duration}ms`);
    log(`Failed Runs: ${health.metrics.failed_runs}`);
    console.log('');

    // Jobs
    log('--- Scheduled Jobs ---', 'cyan');
    log(`Workflow Jobs: ${jobs.workflows.length}`);
    log(`Cron Jobs: ${jobs.cron.length}`);
    console.log('');

    // Issues
    if (health.issues.length > 0) {
      log('--- Issues ---', 'yellow');
      for (const issue of health.issues) {
        log(`⚠ ${issue}`, 'yellow');
      }
      console.log('');
    }

    // Recommendations
    if (health.recommendations.length > 0) {
      log('--- Recommendations ---', 'cyan');
      for (const rec of health.recommendations) {
        log(`→ ${rec}`, 'gray');
      }
    }
  } catch (error) {
    logError(`Failed to get status: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function showHistory(limit: number): Promise<void> {
  logInfo(`Fetching last ${limit} executions...\n`);

  try {
    const { getMonitor } = await import('../src/lib/workflows');
    
    const monitor = getMonitor();
    const executions = monitor.getRecentExecutions(limit);

    if (executions.length === 0) {
      log('No executions found.', 'gray');
      return;
    }

    log('--- Recent Executions ---', 'cyan');
    console.log('');

    for (const exec of executions) {
      const statusIcon = exec.status === 'completed' ? '✓' : exec.status === 'failed' ? '✗' : '○';
      const statusColor = exec.status === 'completed' ? 'green' : exec.status === 'failed' ? 'red' : 'yellow';
      
      log(`${statusIcon} ${exec.workflow_name}`, statusColor);
      log(`  ID: ${exec.id}`, 'gray');
      log(`  Status: ${exec.status}`, 'gray');
      log(`  Duration: ${exec.duration || 0}ms`, 'gray');
      if (exec.started_at) {
        log(`  Started: ${new Date(exec.started_at).toLocaleString()}`, 'gray');
      }
      if (exec.error) {
        log(`  Error: ${exec.error}`, 'red');
      }
      console.log('');
    }
  } catch (error) {
    logError(`Failed to get history: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function listJobs(): Promise<void> {
  logInfo('Fetching scheduled jobs...\n');

  try {
    const { getScheduler } = await import('../src/lib/workflows');
    
    const scheduler = getScheduler();
    const jobs = scheduler.getAllJobs();

    // Cron jobs
    log('--- Cron Jobs ---', 'cyan');
    if (jobs.cron.length === 0) {
      log('No cron jobs configured.', 'gray');
    } else {
      for (const job of jobs.cron) {
        const statusIcon = job.enabled ? '●' : '○';
        const statusColor = job.enabled ? 'green' : 'gray';
        log(`${statusIcon} ${job.name}`, statusColor);
        log(`  ID: ${job.id}`, 'gray');
        log(`  Schedule: ${job.schedule}`, 'gray');
        log(`  Enabled: ${job.enabled}`, 'gray');
        console.log('');
      }
    }

    // Workflow jobs
    if (jobs.workflows.length > 0) {
      log('--- Workflow Jobs ---', 'cyan');
      for (const job of jobs.workflows) {
        const statusIcon = job.enabled ? '●' : '○';
        const statusColor = job.enabled ? 'green' : 'gray';
        log(`${statusIcon} ${job.workflow.name}`, statusColor);
        log(`  ID: ${job.id}`, 'gray');
        log(`  Schedule: ${job.schedule}`, 'gray');
        log(`  Run Count: ${job.runCount}`, 'gray');
        if (job.lastRun) {
          log(`  Last Run: ${new Date(job.lastRun).toLocaleString()}`, 'gray');
        }
        console.log('');
      }
    }
  } catch (error) {
    logError(`Failed to list jobs: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function triggerJob(jobId: string): Promise<void> {
  if (!jobId) {
    logError('Please provide a job ID');
    process.exit(1);
  }

  logInfo(`Triggering job: ${jobId}\n`);

  try {
    const { getScheduler } = await import('../src/lib/workflows');
    
    const scheduler = getScheduler();

    const result = await scheduler.handleCronRequest(jobId);

    if (result.success) {
      logSuccess(result.message);
    } else {
      logError(result.message);
      process.exit(1);
    }
  } catch (error) {
    logError(`Failed to trigger job: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  logError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
