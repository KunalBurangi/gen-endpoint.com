import { NextResponse } from 'next/server';
import { webhooksStore, webhookLogsStore, type WebhookLog } from '@/data/mock-webhooks';
import { nanoid } from 'nanoid';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ webhookId: string }> }
) {
    try {
        const webhookId = (await params).webhookId;
        const body = await request.json();
        const { event, testPayload } = body;

        const webhook = await webhooksStore.getById(webhookId);

        if (!webhook) {
            return NextResponse.json(
                { error: 'Webhook not found' },
                { status: 404 }
            );
        }

        // Simulate delivery
        const success = Math.random() > 0.2; // 80% success rate
        const responseCode = success ? 200 : 500;
        const responseTime = Math.floor(Math.random() * 500) + 50; // 50-550ms

        const log: WebhookLog = {
            id: `test_${nanoid(6)}`,
            webhookId,
            event: event || 'test.event',
            status: success ? 'success' : 'failed',
            responseCode,
            attempts: 1,
            timestamp: new Date().toISOString(),
            nextRetry: success ? undefined : new Date(Date.now() + 15 * 60000).toISOString()
        };

        await webhookLogsStore.add(log);

        return NextResponse.json({
            testId: log.id,
            status: log.status,
            responseCode,
            responseTime,
            deliveredAt: log.timestamp
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
