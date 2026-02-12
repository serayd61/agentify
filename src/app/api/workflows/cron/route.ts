import { NextRequest, NextResponse } from 'next/server';
import { getScheduler, getMonitor } from '@/lib/workflows';

// Vercel Cron endpoint
// This endpoint is called by Vercel's cron scheduler
// Configure in vercel.json

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (in production)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get job ID from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job');

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID required' },
        { status: 400 }
      );
    }

    const scheduler = getScheduler();
    const monitor = getMonitor();

    // Execute the job
    const result = await scheduler.handleCronRequest(jobId);

    // Log execution
    console.log(`[Cron] Job ${jobId}: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: jobId,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Cron] Error: ${message}`);
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID required' },
        { status: 400 }
      );
    }

    const scheduler = getScheduler();
    const result = await scheduler.handleCronRequest(jobId);

    return NextResponse.json({
      success: result.success,
      job: jobId,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
