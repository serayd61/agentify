import { NextRequest, NextResponse } from 'next/server';
import { createOrchestrator, getMonitor, WorkflowDefinition } from '@/lib/workflows';

// GET /api/workflows - List all workflows and their status
export async function GET() {
  try {
    const monitor = getMonitor();
    const metrics = monitor.getWorkflowMetrics();
    const recentExecutions = monitor.getRecentExecutions(10);
    const healthReport = monitor.getHealthReport();

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        recentExecutions,
        health: healthReport,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/workflows - Execute a workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow, immediate = true } = body as {
      workflow: WorkflowDefinition;
      immediate?: boolean;
    };

    if (!workflow || !workflow.name || !workflow.tasks) {
      return NextResponse.json(
        { success: false, error: 'Invalid workflow definition' },
        { status: 400 }
      );
    }

    if (!immediate) {
      // TODO: Schedule workflow for later execution
      return NextResponse.json({
        success: true,
        message: 'Workflow scheduled',
        workflow_id: workflow.id || workflow.name,
      });
    }

    // Execute workflow immediately
    const orchestrator = createOrchestrator();
    const monitor = getMonitor();

    const execution = await orchestrator.execute(workflow);
    monitor.recordExecution(execution);

    return NextResponse.json({
      success: true,
      execution,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
