import { NextRequest, NextResponse } from 'next/server';
import { getMonitor, getScheduler } from '@/lib/workflows';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/workflows/[id] - Get workflow details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const monitor = getMonitor();
    const scheduler = getScheduler();

    // Get job info if it's a scheduled job
    const job = scheduler.getJob(id);

    // Get recent executions for this workflow
    const executions = monitor.getRecentExecutions()
      .filter(e => e.workflow_id === id || e.id === id);

    // Get task metrics
    const taskMetrics = monitor.getTaskMetrics();

    return NextResponse.json({
      success: true,
      data: {
        id,
        job,
        executions,
        taskMetrics: Array.isArray(taskMetrics) ? taskMetrics : [taskMetrics],
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

// POST /api/workflows/[id] - Trigger workflow execution
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const scheduler = getScheduler();
    const monitor = getMonitor();

    const execution = await scheduler.runJob(id);

    if (execution) {
      monitor.recordExecution(execution);
    }

    return NextResponse.json({
      success: true,
      message: `Job ${id} executed`,
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

// DELETE /api/workflows/[id] - Disable/remove workflow
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const scheduler = getScheduler();

    const disabled = scheduler.disableJob(id);

    if (!disabled) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Job ${id} disabled`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
