import { NextResponse } from 'next/server';
import { webhooksStore, type Webhook } from '@/data/mock-webhooks';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, events, secret, description } = body;

        if (!url || !events || !Array.isArray(events) || events.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: url, events (array)' },
                { status: 400 }
            );
        }

        const newWebhook: Webhook = {
            id: `wh_${nanoid(6)}`,
            url,
            events,
            secret: secret || `whsec_${nanoid(10)}`,
            description,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        const addedWebhook = await webhooksStore.add(newWebhook);

        return NextResponse.json(addedWebhook, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}
