import { JsonFileStore } from '@/lib/store';

export interface Job {
    id: string;
    type: 'data_export' | 'image_processing' | 'report_generation';
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    result?: any;
    error?: string;
    createdAt: string;
    updatedAt: string;
    estimatedCompletion?: string;
}

const defaultJobs: Job[] = [
    {
        id: "job_123",
        type: "data_export",
        status: "completed",
        progress: 100,
        result: { downloadUrl: "https://example.com/export.csv" },
        createdAt: "2024-08-15T09:00:00Z",
        updatedAt: "2024-08-15T09:05:00Z"
    },
    {
        id: "job_456",
        type: "image_processing",
        status: "processing",
        progress: 45,
        createdAt: "2024-08-16T12:10:00Z",
        startedAt: "2024-08-16T12:10:05Z"
    }
];
