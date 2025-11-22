import { NextResponse } from 'next/server';
import { webhookLogsStore } from '@/data/mock-webhooks';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('webhookId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const allLogs = await webhookLogsStore.getAll();
    let filteredLogs = [...allLogs];

    if (webhookId) {
        filteredLogs = filteredLogs.filter(l => l.webhookId === webhookId);
    }

    if (status) {
        filteredLogs = filteredLogs.filter(l => l.status === status);
    }

    // Sort by timestamp desc
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const logs = filteredLogs.slice(0, limit);

    return NextResponse.json({
        logs
    });
}
