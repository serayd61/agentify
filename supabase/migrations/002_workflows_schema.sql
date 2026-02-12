-- Workflow Orchestrator Database Schema
-- Migration: 002_workflows_schema.sql
-- Note: Run 001_initial_schema.sql first to create the customers table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workflows table - stores workflow definitions
-- customer_id is optional - system workflows don't need a customer
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    customer_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint only if customers table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        ALTER TABLE workflows 
        ADD CONSTRAINT fk_workflows_customer 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Workflow executions table - stores execution history
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    result JSONB,
    error TEXT,
    triggered_by TEXT DEFAULT 'manual',
    environment JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task executions table - stores individual task results
CREATE TABLE IF NOT EXISTS task_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    task_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    result JSONB,
    error TEXT,
    retries INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled jobs table - stores cron job configurations
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    schedule TEXT NOT NULL,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow metrics table - stores aggregated metrics
CREATE TABLE IF NOT EXISTS workflow_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    total_duration_ms BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_executions_execution_id ON task_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_enabled ON scheduled_jobs(enabled);
CREATE INDEX IF NOT EXISTS idx_workflow_metrics_date ON workflow_metrics(date DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workflows_updated_at ON workflows;
CREATE TRIGGER trigger_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_updated_at();

DROP TRIGGER IF EXISTS trigger_scheduled_jobs_updated_at ON scheduled_jobs;
CREATE TRIGGER trigger_scheduled_jobs_updated_at
    BEFORE UPDATE ON scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_updated_at();

-- Function to record workflow execution metrics
CREATE OR REPLACE FUNCTION record_workflow_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed') AND NEW.workflow_id IS NOT NULL THEN
        INSERT INTO workflow_metrics (workflow_id, date, total_runs, successful_runs, failed_runs, total_duration_ms)
        VALUES (
            NEW.workflow_id,
            DATE(NEW.completed_at),
            1,
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
            COALESCE(NEW.duration_ms, 0)
        )
        ON CONFLICT (workflow_id, date) DO UPDATE SET
            total_runs = workflow_metrics.total_runs + 1,
            successful_runs = workflow_metrics.successful_runs + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
            failed_runs = workflow_metrics.failed_runs + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
            total_duration_ms = workflow_metrics.total_duration_ms + COALESCE(NEW.duration_ms, 0);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_record_workflow_metrics ON workflow_executions;
CREATE TRIGGER trigger_record_workflow_metrics
    AFTER UPDATE ON workflow_executions
    FOR EACH ROW
    WHEN (OLD.status != NEW.status AND NEW.status IN ('completed', 'failed'))
    EXECUTE FUNCTION record_workflow_metrics();

-- Insert default scheduled jobs
INSERT INTO scheduled_jobs (job_id, name, schedule, enabled) VALUES
    ('cleanup-expired-sessions', 'Cleanup Expired Sessions', '0 2 * * *', true),
    ('aggregate-analytics', 'Aggregate Weekly Analytics', '0 0 * * 1', true),
    ('subscription-renewal-check', 'Check Subscription Renewals', '0 8 * * *', true),
    ('agent-health-check', 'Agent Health Check', '0 * * * *', true)
ON CONFLICT (job_id) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;

-- Policies for workflows (only if customers table exists)
DO $$
BEGIN
    -- Drop existing policies first
    DROP POLICY IF EXISTS "Users can view their own workflows" ON workflows;
    DROP POLICY IF EXISTS "Users can create their own workflows" ON workflows;
    DROP POLICY IF EXISTS "Users can update their own workflows" ON workflows;
    DROP POLICY IF EXISTS "Users can delete their own workflows" ON workflows;
    DROP POLICY IF EXISTS "Users can view their workflow executions" ON workflow_executions;
    DROP POLICY IF EXISTS "Allow all workflows access" ON workflows;
    DROP POLICY IF EXISTS "Allow all workflow_executions access" ON workflow_executions;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        -- Users can view their own workflows or system workflows (no customer_id)
        CREATE POLICY "Users can view their own workflows"
            ON workflows FOR SELECT
            USING (customer_id IS NULL OR customer_id IN (
                SELECT id FROM customers WHERE auth_user_id = auth.uid()
            ));

        CREATE POLICY "Users can create their own workflows"
            ON workflows FOR INSERT
            WITH CHECK (customer_id IS NULL OR customer_id IN (
                SELECT id FROM customers WHERE auth_user_id = auth.uid()
            ));

        CREATE POLICY "Users can update their own workflows"
            ON workflows FOR UPDATE
            USING (customer_id IS NULL OR customer_id IN (
                SELECT id FROM customers WHERE auth_user_id = auth.uid()
            ));

        CREATE POLICY "Users can delete their own workflows"
            ON workflows FOR DELETE
            USING (customer_id IS NULL OR customer_id IN (
                SELECT id FROM customers WHERE auth_user_id = auth.uid()
            ));

        -- Policies for workflow_executions
        CREATE POLICY "Users can view their workflow executions"
            ON workflow_executions FOR SELECT
            USING (workflow_id IS NULL OR workflow_id IN (
                SELECT id FROM workflows WHERE customer_id IS NULL OR customer_id IN (
                    SELECT id FROM customers WHERE auth_user_id = auth.uid()
                )
            ));
    ELSE
        -- If no customers table, allow all access (development mode)
        CREATE POLICY "Allow all workflows access"
            ON workflows FOR ALL
            USING (true);
            
        CREATE POLICY "Allow all workflow_executions access"
            ON workflow_executions FOR ALL
            USING (true);
    END IF;
END $$;

-- Grant service role access for cron jobs
DROP POLICY IF EXISTS "Service role has full access to workflows" ON workflows;
CREATE POLICY "Service role has full access to workflows"
    ON workflows FOR ALL
    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role has full access to executions" ON workflow_executions;
CREATE POLICY "Service role has full access to executions"
    ON workflow_executions FOR ALL
    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role has full access to task executions" ON task_executions;
CREATE POLICY "Service role has full access to task executions"
    ON task_executions FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE workflows IS 'Stores workflow definitions for the orchestrator';
COMMENT ON TABLE workflow_executions IS 'Stores workflow execution history and results';
COMMENT ON TABLE task_executions IS 'Stores individual task execution details';
COMMENT ON TABLE scheduled_jobs IS 'Stores cron job configurations';
COMMENT ON TABLE workflow_metrics IS 'Stores aggregated workflow metrics by day';
