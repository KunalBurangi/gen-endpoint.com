import { type NextRequest, NextResponse } from 'next/server';

// Mock notification storage
let notifications: any[] = [];
let notificationCounter = 1;

// Mock email templates
const emailTemplates = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{appName}}!',
    html: '<h1>Welcome {{name}}!</h1><p>Thank you for joining us. <a href="{{verificationUrl}}">Verify your account</a></p>',
    variables: ['name', 'appName', 'verificationUrl']
  },
  password_reset: {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset your password',
    html: '<h1>Hi {{name}}</h1><p>Click <a href="{{resetUrl}}">here</a> to reset your password.</p>',
    variables: ['name', 'resetUrl']
  },
  order_confirmation: {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    subject: 'Order Confirmation #{{orderNumber}}',
    html: '<h1>Order Confirmed</h1><p>Hi {{name}}, your order #{{orderNumber}} for ${{total}} has been confirmed.</p>',
    variables: ['name', 'orderNumber', 'total']
  }
};

function generateNotificationId(): string {
  return `notif_${notificationCounter++}`;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function processTemplate(template: any, variables: any): { subject: string; html: string } {
  let subject = template.subject;
  let html = template.html;

  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    html = html.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return { subject, html };
}

function simulateEmailDelivery(): { deliveryTime: number; success: boolean } {
  // Simulate delivery time between 500ms and 3000ms
  const deliveryTime = Math.random() * 2500 + 500;
  // 95% success rate
  const success = Math.random() > 0.05;
  return { deliveryTime, success };
}

// POST /api/notifications/email - Send email notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template: templateId, variables = {}, subject: customSubject, html: customHtml, priority = 'normal' } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email address is required' },
        { status: 400 }
      );
    }

    if (Array.isArray(to)) {
      for (const email of to) {
        if (!validateEmail(email)) {
          return NextResponse.json(
            { error: `Invalid email address: ${email}` },
            { status: 400 }
          );
        }
      }
    } else {
      if (!validateEmail(to)) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        );
      }
    }

    let emailContent: { subject: string; html: string };

    if (templateId) {
      // Use template
      const template = emailTemplates[templateId as keyof typeof emailTemplates];
      if (!template) {
        return NextResponse.json(
          { error: `Template '${templateId}' not found` },
          { status: 404 }
        );
      }

      // Check if all required variables are provided
      const missingVars = template.variables.filter(variable => !(variable in variables));
      if (missingVars.length > 0) {
        return NextResponse.json(
          { 
            error: `Missing template variables: ${missingVars.join(', ')}`,
            template: templateId,
            requiredVariables: template.variables,
            providedVariables: Object.keys(variables),
            missingVariables: missingVars
          },
          { status: 400 }
        );
      }

      emailContent = processTemplate(template, variables);
    } else if (customSubject && customHtml) {
      // Use custom content
      emailContent = { subject: customSubject, html: customHtml };
    } else {
      return NextResponse.json(
        { error: 'Either template ID or custom subject and HTML must be provided' },
        { status: 400 }
      );
    }

    const notificationId = generateNotificationId();
    const now = new Date().toISOString();
    const { deliveryTime, success } = simulateEmailDelivery();

    const notification = {
      id: notificationId,
      type: 'email',
      status: 'queued',
      recipients: Array.isArray(to) ? to : [to],
      subject: emailContent.subject,
      templateId: templateId || null,
      variables: templateId ? variables : null,
      priority,
      createdAt: now,
      scheduledAt: now,
      estimatedDelivery: new Date(Date.now() + deliveryTime).toISOString(),
      attempts: 0,
      maxAttempts: 3
    };

    // Simulate async processing
    setTimeout(() => {
      const notifIndex = notifications.findIndex(n => n.id === notificationId);
      if (notifIndex >= 0) {
        notifications[notifIndex].status = success ? 'delivered' : 'failed';
        notifications[notifIndex].sentAt = new Date().toISOString();
        notifications[notifIndex].deliveredAt = success ? new Date().toISOString() : null;
        notifications[notifIndex].attempts = 1;
        
        if (!success) {
          notifications[notifIndex].errorMessage = 'SMTP server temporarily unavailable';
        }
      }
    }, deliveryTime);

    notifications.push(notification);

    return NextResponse.json({
      id: notificationId,
      type: 'email',
      status: 'queued',
      recipients: notification.recipients,
      scheduledAt: now,
      estimatedDelivery: notification.estimatedDelivery
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body or email processing error' },
      { status: 400 }
    );
  }
}

// GET /api/notifications/email - Get email notification history
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  let filteredNotifications = notifications.filter(n => n.type === 'email');

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

  return NextResponse.json({
    notifications: paginatedNotifications.map(n => ({
      id: n.id,
      status: n.status,
      recipients: n.recipients,
      subject: n.subject,
      createdAt: n.createdAt,
      sentAt: n.sentAt || null,
      deliveredAt: n.deliveredAt || null
    })),
    pagination: {
      page,
      limit,
      total: filteredNotifications.length,
      pages: Math.ceil(filteredNotifications.length / limit)
    }
  });
}