import { type NextRequest, NextResponse } from 'next/server';

// Mock push notification storage
let notifications: any[] = [];
let notificationCounter = 1;

// Mock device tokens and their status
const deviceTokens = new Map([
  ['token1', { platform: 'ios', status: 'active', lastSeen: '2024-08-16T12:00:00Z' }],
  ['token2', { platform: 'android', status: 'active', lastSeen: '2024-08-16T11:30:00Z' }],
  ['token3', { platform: 'ios', status: 'inactive', lastSeen: '2024-08-15T10:00:00Z' }],
  ['token4', { platform: 'android', status: 'active', lastSeen: '2024-08-16T09:00:00Z' }]
]);

function generateNotificationId(): string {
  return `notif_${notificationCounter++}`;
}

function validatePushNotification(data: any): { valid: boolean; error?: string } {
  if (!data.deviceTokens || !Array.isArray(data.deviceTokens) || data.deviceTokens.length === 0) {
    return { valid: false, error: 'Device tokens array is required and must not be empty' };
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }

  if (!data.body || typeof data.body !== 'string' || data.body.trim().length === 0) {
    return { valid: false, error: 'Body is required and must be a non-empty string' };
  }

  if (data.title.length > 100) {
    return { valid: false, error: 'Title must be 100 characters or less' };
  }

  if (data.body.length > 500) {
    return { valid: false, error: 'Body must be 500 characters or less' };
  }

  return { valid: true };
}

function simulateDelivery(tokens: string[]): { delivered: number; failed: number; results: any[] } {
  const results = [];
  let delivered = 0;
  let failed = 0;

  for (const token of tokens) {
    const device = deviceTokens.get(token);
    
    if (!device) {
      results.push({ token, status: 'failed', error: 'Invalid device token' });
      failed++;
    } else if (device.status === 'inactive') {
      results.push({ token, status: 'failed', error: 'Device token inactive' });
      failed++;
    } else {
      // 95% success rate simulation
      const success = Math.random() > 0.05;
      if (success) {
        results.push({ token, status: 'delivered', platform: device.platform });
        delivered++;
      } else {
        results.push({ token, status: 'failed', error: 'Delivery failed' });
        failed++;
      }
    }
  }

  return { delivered, failed, results };
}

// POST /api/notifications/push - Send push notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceTokens, title, body: messageBody, data = {}, badge, sound = 'default', priority = 'normal' } = body;

    // Validate request
    const validation = validatePushNotification({ deviceTokens, title, body: messageBody });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    const notificationId = generateNotificationId();
    const now = new Date().toISOString();

    // Simulate delivery
    const deliveryResults = simulateDelivery(deviceTokens);

    const notification = {
      id: notificationId,
      type: 'push',
      title,
      body: messageBody,
      data,
      badge,
      sound,
      priority,
      deviceTokens,
      status: 'sent',
      deliveredTo: deliveryResults.delivered,
      failedDeliveries: deliveryResults.failed,
      deliveryResults: deliveryResults.results,
      createdAt: now,
      sentAt: now
    };

    notifications.push(notification);

    return NextResponse.json({
      id: notificationId,
      type: 'push',
      status: 'sent',
      deliveredTo: deliveryResults.delivered,
      failedDeliveries: deliveryResults.failed,
      totalTokens: deviceTokens.length,
      sentAt: now
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body or push notification processing error' },
      { status: 400 }
    );
  }
}

// GET /api/notifications/push - Get push notification history and stats
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status');

  let filteredNotifications = notifications.filter(n => n.type === 'push');

  if (status) {
    filteredNotifications = filteredNotifications.filter(n => n.status === status);
  }

  // Sort by creation date (newest first)
  filteredNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  // Calculate stats
  const totalDelivered = notifications
    .filter(n => n.type === 'push')
    .reduce((sum, n) => sum + (n.deliveredTo || 0), 0);
  
  const totalFailed = notifications
    .filter(n => n.type === 'push')
    .reduce((sum, n) => sum + (n.failedDeliveries || 0), 0);

  const activeDevices = Array.from(deviceTokens.values())
    .filter(device => device.status === 'active').length;

  return NextResponse.json({
    notifications: paginatedNotifications.map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      status: n.status,
      deliveredTo: n.deliveredTo,
      failedDeliveries: n.failedDeliveries,
      createdAt: n.createdAt,
      sentAt: n.sentAt
    })),
    pagination: {
      page,
      limit,
      total: filteredNotifications.length,
      pages: Math.ceil(filteredNotifications.length / limit)
    },
    stats: {
      totalNotificationsSent: notifications.filter(n => n.type === 'push').length,
      totalDelivered,
      totalFailed,
      activeDevices,
      successRate: totalDelivered + totalFailed > 0 ? 
        Math.round((totalDelivered / (totalDelivered + totalFailed)) * 100) : 0
    }
  });
}