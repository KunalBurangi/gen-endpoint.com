import { type NextRequest, NextResponse } from 'next/server';
import { getJobById, updateJob, ExportJob } from '../../../../../lib/data/exportJobs';

interface Params {
  jobId: string;
}

// GET /api/export/status/{jobId} - Check export job status
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { jobId } = params;
  
  try {
    const job = getJobById(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Export job not found' },
        { status: 404 }
      );
    }

    // Calculate progress for processing jobs
    if (job.status === 'processing' && job.estimatedCompletion && job.createdAt) {
      const elapsed = Date.now() - new Date(job.createdAt).getTime();
      const estimatedDuration = new Date(job.estimatedCompletion).getTime() - new Date(job.createdAt).getTime();

      let progress = 0;
      if (estimatedDuration > 0) {
        progress = Math.min(Math.round((elapsed / estimatedDuration) * 100), 99); // Cap at 99 until completed
      } else if (elapsed > 0) { // If no estimated duration but time has passed
        progress = 50; // Default to 50% if processing and estimate is off
      }
      
      return NextResponse.json({
        ...job,
        progress,
        remainingTime: Math.max(0, estimatedDuration - elapsed)
      });
    } else if (job.status === 'completed') {
      return NextResponse.json({ ...job, progress: 100 });
    }

    return NextResponse.json(job); // For other statuses like pending, failed, cancelled
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve export job status' },
      { status: 500 }
    );
  }
}

// DELETE /api/export/status/{jobId} - Cancel export job
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { jobId } = params;
  
  try {
    const job = getJobById(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Export job not found' },
        { status: 404 }
      );
    }
    
    if (job.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed export job' },
        { status: 400 }
      );
    }

    if (job.status === 'failed') {
      return NextResponse.json(
        { error: 'Cannot cancel failed export job' },
        { status: 400 }
      );
    }

    if (job.status === 'cancelled') {
      return NextResponse.json(
        { message: 'Job already cancelled', jobId, status: 'cancelled' },
        { status: 200 }
      );
    }

    const updatedJob = updateJob(jobId, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      progress: undefined, // Clear progress for cancelled job
    });

    if (!updatedJob) {
      // Should not happen if job was found above, but as a safeguard
      return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Export job ${jobId} cancelled successfully`,
      jobId,
      status: updatedJob.status,
      cancelledAt: updatedJob.cancelledAt
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel export job' },
      { status: 500 }
    );
  }
}