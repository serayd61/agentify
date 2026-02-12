// Workflow Orchestrator Type Definitions

export type TriggerType = 'manual' | 'schedule' | 'webhook' | 'file_change';
export type TaskType = 'shell' | 'http' | 'javascript' | 'conditional' | 'parallel' | 'loop';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type WorkflowStatus = 'active' | 'inactive' | 'archived';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface RetryConfig {
  attempts: number;
  delay: number; // milliseconds
  backoff?: 'linear' | 'exponential';
}

export interface TriggerConfig {
  type: TriggerType;
  config?: {
    schedule?: string; // cron expression
    files?: string[]; // glob patterns
    webhook?: string; // webhook path
  };
}

export interface TaskDefinition {
  id: string;
  name: string;
  type: TaskType;
  command?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  script?: string;
  depends_on?: string[];
  condition?: string;
  timeout?: number; // milliseconds
  retry?: RetryConfig;
  parallel?: boolean;
  on_success?: string[];
  on_failure?: string[];
  environment?: Record<string, string>;
  cwd?: string;
  live_output?: boolean;
}

export interface ConditionalTask extends TaskDefinition {
  type: 'conditional';
  condition: string;
  then: TaskDefinition;
  else?: TaskDefinition;
}

export interface ParallelTask extends TaskDefinition {
  type: 'parallel';
  tasks: TaskDefinition[];
  wait_for?: 'all' | 'any' | 'first';
}

export interface LoopTask extends TaskDefinition {
  type: 'loop';
  items: string[] | string; // array or variable reference
  task: TaskDefinition;
  stop_on_failure?: boolean;
}

export interface NotificationConfig {
  channels: ('slack' | 'email' | 'webhook')[];
  on_completion?: boolean;
  on_failure?: boolean;
  on_success?: boolean;
}

export interface WorkflowDefinition {
  id?: string;
  name: string;
  version: string;
  description?: string;
  trigger: TriggerConfig;
  environment?: Record<string, string>;
  tasks: TaskDefinition[];
  notifications?: NotificationConfig;
  timeout?: number; // overall workflow timeout
  created_at?: string;
  updated_at?: string;
}

export interface TaskExecution {
  id: string;
  name: string;
  status: TaskStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  result?: TaskResult;
  error?: string;
  retries?: number;
}

export interface TaskResult {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  data?: unknown;
  status?: number;
  headers?: Record<string, string>;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: ExecutionStatus;
  started_at?: string;
  completed_at?: string;
  duration?: number;
  tasks: Record<string, TaskExecution>;
  error?: string;
  triggered_by?: string;
  environment?: Record<string, string>;
}

export interface WorkflowMetrics {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  average_duration: number;
  last_run?: string;
  success_rate: number;
}

export interface TaskMetrics {
  task_id: string;
  runs: number;
  failures: number;
  average_duration: number;
  failure_rate: number;
}

export interface AlertConfig {
  name: string;
  condition: string;
  channels: string[];
  template: string;
}

export interface OrchestratorConfig {
  log_level: 'debug' | 'info' | 'warn' | 'error';
  max_parallel_tasks: number;
  default_timeout: number;
  retry_defaults: RetryConfig;
  notifications?: NotificationConfig;
  alerts?: AlertConfig[];
}

// Database models
export interface WorkflowRecord {
  id: string;
  name: string;
  config: WorkflowDefinition;
  status: WorkflowStatus;
  created_at: string;
  updated_at: string;
}

export interface ExecutionRecord {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  started_at: string | null;
  completed_at: string | null;
  result: WorkflowExecution | null;
  error: string | null;
  created_at: string;
}
