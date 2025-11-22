import { NextResponse } from 'next/server';
import { jobsStore } from '@/data/mock-jobs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const jobId = (await params).jobId;
    const job = await jobsStore.getById(jobId);

    if (!job) {
        return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(job);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const jobId = (await params).jobId;
    const job = await jobsStore.getById(jobId);

    if (!job) {
        return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
        );
    }

    if (['completed', 'failed'].includes(job.status)) {
        return NextResponse.json(
            { error: 'Cannot cancel a completed or failed job' },
            { status: 400 }
        );
    }

    await jobsStore.update(jobId, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
        success: true,
        message: 'Job cancelled successfully'
    });
}
