// Workflow Orchestrator - Main engine for workflow execution

import {
  WorkflowDefinition,
  WorkflowExecution,
  TaskDefinition,
  OrchestratorConfig,
} from './types';
import { TaskExecutor, createExecutor } from './executor';

export class WorkflowOrchestrator {
  private config: OrchestratorConfig;
  private executor: TaskExecutor;
  private running: Set<string> = new Set();
  private completed: Set<string> = new Set();
  private failed: Set<string> = new Set();

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      log_level: 'info',
      max_parallel_tasks: 5,
      default_timeout: 300000,
      retry_defaults: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
      },
      ...config,
    };
    this.executor = createExecutor();
  }

  async execute(workflow: WorkflowDefinition): Promise<WorkflowExecution> {
    const executionId = this.generateExecutionId();
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflow_id: workflow.id || workflow.name,
      workflow_name: workflow.name,
      status: 'running',
      started_at: new Date().toISOString(),
      tasks: {},
      environment: workflow.environment,
    };

    this.log('info', `Starting workflow: ${workflow.name} (${executionId})`);

    try {
      // Setup environment
      if (workflow.environment) {
        this.executor.setEnvironment(workflow.environment);
      }

      // Reset state
      this.running.clear();
      this.completed.clear();
      this.failed.clear();

      // Build dependency graph and execute
      const taskMap = this.buildTaskMap(workflow.tasks);
      await this.executeWorkflow(taskMap, execution);

      // Determine final status
      if (this.failed.size > 0) {
        execution.status = 'failed';
        execution.error = `${this.failed.size} task(s) failed`;
      } else {
        execution.status = 'completed';
      }

      execution.completed_at = new Date().toISOString();
      execution.duration = new Date(execution.completed_at).getTime() - 
                          new Date(execution.started_at!).getTime();

      this.log('info', `Workflow ${workflow.name} ${execution.status} in ${execution.duration}ms`);

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completed_at = new Date().toISOString();
      
      this.log('error', `Workflow ${workflow.name} failed: ${execution.error}`);
      
      return execution;
    }
  }

  private async executeWorkflow(
    taskMap: Map<string, TaskDefinition>,
    execution: WorkflowExecution
  ): Promise<void> {
    while (this.hasRunnableTasks(taskMap)) {
      const runnableTasks = this.getRunnableTasks(taskMap);

      if (runnableTasks.length === 0) {
        // Check for circular dependencies or all failed
        const pending = [...taskMap.keys()].filter(
          id => !this.completed.has(id) && !this.failed.has(id) && !this.running.has(id)
        );
        
        if (pending.length > 0) {
          this.log('warn', `Circular dependency or blocked tasks detected: ${pending.join(', ')}`);
        }
        break;
      }

      // Execute tasks in parallel (respecting max_parallel_tasks)
      const batch = runnableTasks.slice(0, this.config.max_parallel_tasks);
      
      await Promise.all(
        batch.map(task => this.executeTask(task, execution))
      );
    }
  }

  private async executeTask(
    task: TaskDefinition,
    execution: WorkflowExecution
  ): Promise<void> {
    this.running.add(task.id);
    this.log('info', `Starting task: ${task.name} (${task.id})`);

    try {
      const taskExecution = await this.executor.execute(task);
      execution.tasks[task.id] = taskExecution;

      if (taskExecution.status === 'completed' || taskExecution.status === 'skipped') {
        this.completed.add(task.id);
        this.log('info', `Task ${task.name} ${taskExecution.status} in ${taskExecution.duration}ms`);

        // Execute success callbacks
        if (task.on_success && taskExecution.status === 'completed') {
          await this.executeCallbacks(task.on_success, execution);
        }
      } else {
        this.failed.add(task.id);
        this.log('error', `Task ${task.name} failed: ${taskExecution.error}`);

        // Execute failure callbacks
        if (task.on_failure) {
          await this.executeCallbacks(task.on_failure, execution);
        }
      }
    } catch (error) {
      this.failed.add(task.id);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      execution.tasks[task.id] = {
        id: task.id,
        name: task.name,
        status: 'failed',
        error: errorMessage,
      };

      this.log('error', `Task ${task.name} threw error: ${errorMessage}`);
    } finally {
      this.running.delete(task.id);
    }
  }

  private async executeCallbacks(
    callbackIds: string[],
    _execution: WorkflowExecution
  ): Promise<void> {
    // Callbacks are task IDs to trigger
    // In a full implementation, these would be looked up and executed
    this.log('info', `Executing callbacks: ${callbackIds.join(', ')}`);
  }

  private buildTaskMap(tasks: TaskDefinition[]): Map<string, TaskDefinition> {
    const map = new Map<string, TaskDefinition>();
    for (const task of tasks) {
      map.set(task.id, task);
    }
    return map;
  }

  private hasRunnableTasks(taskMap: Map<string, TaskDefinition>): boolean {
    for (const [id] of taskMap) {
      if (!this.completed.has(id) && !this.failed.has(id) && !this.running.has(id)) {
        return true;
      }
    }
    return false;
  }

  private getRunnableTasks(taskMap: Map<string, TaskDefinition>): TaskDefinition[] {
    const runnable: TaskDefinition[] = [];

    for (const [id, task] of taskMap) {
      // Skip if already processed or running
      if (this.completed.has(id) || this.failed.has(id) || this.running.has(id)) {
        continue;
      }

      // Check if all dependencies are satisfied
      const dependencies = task.depends_on || [];
      const allDependenciesMet = dependencies.every(
        depId => this.completed.has(depId)
      );

      // Check if any dependency failed
      const anyDependencyFailed = dependencies.some(
        depId => this.failed.has(depId)
      );

      if (anyDependencyFailed) {
        // Mark as failed due to dependency failure
        this.failed.add(id);
        continue;
      }

      if (allDependenciesMet) {
        runnable.push(task);
      }
    }

    return runnable;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private log(level: string, message: string): void {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = levels.indexOf(this.config.log_level);
    const messageLevel = levels.indexOf(level);

    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }
}

export function createOrchestrator(config?: Partial<OrchestratorConfig>): WorkflowOrchestrator {
  return new WorkflowOrchestrator(config);
}
