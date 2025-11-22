```
import { NextResponse } from 'next/server';
import { jobsStore, type Job } from '@/data/mock-jobs';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
        const { type, parameters, priority, scheduledAt } = body;

        if (!type) {
            return NextResponse.json(
                { error: 'Missing required field: type' },
                { status: 400 }
            );
        }

        const newJob: Job = {
            id: `job_${ nanoid(6) } `,
            type,
            status: 'queued',
            priority: priority || 'normal',
            parameters: parameters || {},
            progress: 0,
            createdAt: new Date().toISOString(),
            scheduledAt
        };

        // Simulate queue position
        const queuePosition = mockJobs.filter(j => j.status === 'queued').length + 1;
        const estimatedStartTime = new Date(Date.now() + queuePosition * 60000).toISOString();

        mockJobs.unshift(newJob);

        return NextResponse.json({
            id: newJob.id,
            type: newJob.type,
            status: newJob.status,
            priority: newJob.priority,
            queuePosition,
            estimatedStartTime
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
