import { JsonFileStore } from '@/lib/store';

export interface Webhook {
    id: string;
    url: string;
    events: string[];
    secret: string;
    description?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface WebhookLog {
    id: string;
    webhookId: string;
    event: string;
    status: 'success' | 'failed';
    responseCode: number;
    attempts: number;
    nextRetry?: string;
    timestamp: string;
}

const defaultWebhooks: Webhook[] = [
    {
        id: "wh_789",
        url: "https://api.example.com/webhooks/orders",
        events: ["order.created", "order.updated", "payment.completed"],
        secret: "whsec_1234567890",
        description: "Order processing webhook",
        status: "active",
        createdAt: "2024-08-16T12:00:00Z"
    }
];

const defaultWebhookLogs: WebhookLog[] = [
    {
        id: "log_123",
        webhookId: "wh_789",
        event: "order.created",
        status: "failed",
        responseCode: 500,
        attempts: 3,
        nextRetry: "2024-08-16T12:15:00Z",
        timestamp: "2024-08-16T12:10:00Z"
    }
];

export const webhooksStore = new JsonFileStore<Webhook>('webhooks.json', defaultWebhooks);
export const webhookLogsStore = new JsonFileStore<WebhookLog>('webhook-logs.json', defaultWebhookLogs);
