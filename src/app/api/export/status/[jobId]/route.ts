import { type NextRequest, NextResponse } from 'next/server';

// Mock export jobs storage - in a real app, this would be shared or in a database
let exportJobs: any[] = [
  {
    id: 'export_123',
    format: 'csv',
    entity: 'users',
    status: 'completed',
    totalRecords: 150,
    createdAt: '2024-08-16T12:00:00Z',
    completedAt: '2024-08-16T12:04:30Z',
    downloadUrl: '/api/export/download/export_123',
    fileSize: 2048000,
    filename: 'users-export-2024-08-16.csv',
    mimeType: 'text/csv'
  },
  {
    id: 'export_456',
    format: 'json',
    entity: 'products',
    status: 'processing',
    totalRecords: 500,
    createdAt: '2024-08-16T12:10:00Z',
    estimatedCompletion: '2024-08-16T12:15:00Z'
  },
  {
    id: 'export_789',
    format: 'xml',
    entity: 'orders',
    status: 'failed',
    totalRecords: 0,
    createdAt: '2024-08-16T12:05:00Z',
    failedAt: '2024-08-16T12:06:00Z',
    error: 'Insufficient permissions to access orders data'
  }
];

interface Params {
  jobId: string;
}

// GET /api/export/status/{jobId} - Check export job status
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { jobId } = params;
  
  try {
    const job = exportJobs.find(j => j.id === jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Export job not found' },
        { status: 404 }
      );
    }

    // Calculate progress for processing jobs
    if (job.status === 'processing') {
      const elapsed = Date.now() - new Date(job.createdAt).getTime();
      const estimated = new Date(job.estimatedCompletion).getTime() - new Date(job.createdAt).getTime();
      const progress = Math.min(Math.round((elapsed / estimated) * 100), 95);
      
      return NextResponse.json({
        ...job,
        progress,
        remainingTime: Math.max(0, estimated - elapsed)
      });
    }

    return NextResponse.json(job);
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
    const jobIndex = exportJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { error: 'Export job not found' },
        { status: 404 }
      );
    }

    const job = exportJobs[jobIndex];
    
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

    // Update job status to cancelled
    exportJobs[jobIndex] = {
      ...job,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    };

    return NextResponse.json({
      message: `Export job ${jobId} cancelled successfully`,
      jobId,
      status: 'cancelled',
      cancelledAt: exportJobs[jobIndex].cancelledAt
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel export job' },
      { status: 500 }
    );
  }
}