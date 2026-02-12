// Task Executor - Handles execution of different task types

import { TaskDefinition, TaskResult, TaskExecution, TaskStatus } from './types';

export class TaskExecutor {
  private environment: Record<string, string>;

  constructor(environment: Record<string, string> = {}) {
    this.environment = environment;
  }

  async execute(task: TaskDefinition): Promise<TaskExecution> {
    const startTime = Date.now();
    const execution: TaskExecution = {
      id: task.id,
      name: task.name,
      status: 'running',
      startTime,
    };

    try {
      // Check condition if present
      if (task.condition && !this.evaluateCondition(task.condition)) {
        execution.status = 'skipped';
        execution.endTime = Date.now();
        execution.duration = execution.endTime - startTime;
        return execution;
      }

      // Execute with retry logic
      const result = await this.executeWithRetry(task);
      
      execution.status = 'completed';
      execution.result = result;
      execution.endTime = Date.now();
      execution.duration = execution.endTime - startTime;

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = Date.now();
      execution.duration = execution.endTime - startTime;
      
      return execution;
    }
  }

  private async executeWithRetry(task: TaskDefinition): Promise<TaskResult> {
    const maxAttempts = task.retry?.attempts || 1;
    const delay = task.retry?.delay || 1000;
    const backoff = task.retry?.backoff || 'linear';

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.executeTask(task);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxAttempts) {
          const waitTime = backoff === 'exponential' 
            ? delay * Math.pow(2, attempt - 1) 
            : delay * attempt;
          await this.sleep(waitTime);
        }
      }
    }

    throw lastError;
  }

  private async executeTask(task: TaskDefinition): Promise<TaskResult> {
    const timeout = task.timeout || 300000; // 5 minutes default

    return Promise.race([
      this.runTaskByType(task),
      this.createTimeoutPromise(timeout),
    ]);
  }

  private async runTaskByType(task: TaskDefinition): Promise<TaskResult> {
    switch (task.type) {
      case 'shell':
        return this.executeShellTask(task);
      case 'http':
        return this.executeHttpTask(task);
      case 'javascript':
        return this.executeJavaScriptTask(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async executeShellTask(task: TaskDefinition): Promise<TaskResult> {
    // In browser/edge environment, we'll use API route to execute
    // For now, return a simulated result
    if (typeof window !== 'undefined' || typeof process === 'undefined') {
      return this.executeShellViaApi(task);
    }

    // Server-side execution
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const env = { ...process.env, ...this.environment, ...task.environment };

    try {
      const { stdout, stderr } = await execAsync(task.command || '', {
        cwd: task.cwd || process.cwd(),
        env,
        timeout: task.timeout || 300000,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return {
        stdout,
        stderr,
        exitCode: 0,
      };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; code?: number };
      return {
        stdout: execError.stdout || '',
        stderr: execError.stderr || '',
        exitCode: execError.code || 1,
      };
    }
  }

  private async executeShellViaApi(task: TaskDefinition): Promise<TaskResult> {
    // Execute shell command via API route
    const response = await fetch('/api/workflows/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'shell',
        command: task.command,
        cwd: task.cwd,
        environment: { ...this.environment, ...task.environment },
        timeout: task.timeout,
      }),
    });

    if (!response.ok) {
      throw new Error(`Shell execution failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async executeHttpTask(task: TaskDefinition): Promise<TaskResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), task.timeout || 30000);

    try {
      const response = await fetch(task.url || '', {
        method: task.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...task.headers,
        },
        body: task.data ? JSON.stringify(task.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => response.text());

      return {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async executeJavaScriptTask(task: TaskDefinition): Promise<TaskResult> {
    // Execute JavaScript code in a sandboxed context
    try {
      const fn = new Function('env', 'context', task.script || 'return null;');
      const result = await fn(this.environment, {});
      
      return {
        data: result,
        exitCode: 0,
      };
    } catch (error) {
      throw new Error(`JavaScript execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluateCondition(condition: string): boolean {
    try {
      // Simple condition evaluation
      // Replace ${env.VAR} with actual values
      const evaluated = condition.replace(/\$\{env\.(\w+)\}/g, (_, key) => {
        return this.environment[key] || '';
      });

      // Evaluate the condition
      const fn = new Function(`return ${evaluated};`);
      return Boolean(fn());
    } catch {
      return false;
    }
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Task timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setEnvironment(env: Record<string, string>): void {
    this.environment = { ...this.environment, ...env };
  }
}

export function createExecutor(environment?: Record<string, string>): TaskExecutor {
  return new TaskExecutor(environment);
}
