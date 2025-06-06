import { type NextRequest, NextResponse } from 'next/server';

// Mock email templates storage
const emailTemplates = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to {{appName}}!',
    html: '<h1>Welcome {{name}}!</h1><p>Thank you for joining us. <a href="{{verificationUrl}}">Verify your account</a></p>',
    text: 'Welcome {{name}}! Thank you for joining us. Verify your account at: {{verificationUrl}}',
    variables: ['name', 'appName', 'verificationUrl'],
    category: 'user_onboarding',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  },
  password_reset: {
    id: 'password_reset',
    name: 'Password Reset',
    type: 'email',
    subject: 'Reset your password',
    html: '<h1>Hi {{name}}</h1><p>Click <a href="{{resetUrl}}">here</a> to reset your password. This link expires in 24 hours.</p>',
    text: 'Hi {{name}}, click here to reset your password: {{resetUrl}} This link expires in 24 hours.',
    variables: ['name', 'resetUrl'],
    category: 'security',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  },
  order_confirmation: {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    type: 'email',
    subject: 'Order Confirmation #{{orderNumber}}',
    html: '<h1>Order Confirmed</h1><p>Hi {{name}}, your order #{{orderNumber}} for ${{total}} has been confirmed.</p><p>Expected delivery: {{deliveryDate}}</p>',
    text: 'Hi {{name}}, your order #{{orderNumber}} for ${{total}} has been confirmed. Expected delivery: {{deliveryDate}}',
    variables: ['name', 'orderNumber', 'total', 'deliveryDate'],
    category: 'transactional',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  },
  newsletter: {
    id: 'newsletter',
    name: 'Weekly Newsletter',
    type: 'email',
    subject: '{{subject}}',
    html: '<h1>{{title}}</h1><div>{{content}}</div><p>Thanks for reading!</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>',
    text: '{{title}}\n\n{{content}}\n\nThanks for reading!\n\nUnsubscribe: {{unsubscribeUrl}}',
    variables: ['subject', 'title', 'content', 'unsubscribeUrl'],
    category: 'marketing',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  },
  invoice: {
    id: 'invoice',
    name: 'Invoice Email',
    type: 'email',
    subject: 'Invoice #{{invoiceNumber}} - Due {{dueDate}}',
    html: '<h1>Invoice #{{invoiceNumber}}</h1><p>Hi {{customerName}},</p><p>Your invoice for ${{amount}} is due on {{dueDate}}.</p><p><a href="{{paymentUrl}}">Pay Now</a></p>',
    text: 'Invoice #{{invoiceNumber}}\n\nHi {{customerName}},\n\nYour invoice for ${{amount}} is due on {{dueDate}}.\n\nPay now: {{paymentUrl}}',
    variables: ['invoiceNumber', 'customerName', 'amount', 'dueDate', 'paymentUrl'],
    category: 'billing',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  },
  support_ticket: {
    id: 'support_ticket',
    name: 'Support Ticket Response',
    type: 'email',
    subject: 'Re: Support Ticket #{{ticketNumber}}',
    html: '<h1>Support Update</h1><p>Hi {{customerName}},</p><p>We have an update on your support ticket #{{ticketNumber}}:</p><blockquote>{{response}}</blockquote><p>Status: {{status}}</p>',
    text: 'Support Update\n\nHi {{customerName}},\n\nWe have an update on your support ticket #{{ticketNumber}}:\n\n{{response}}\n\nStatus: {{status}}',
    variables: ['customerName', 'ticketNumber', 'response', 'status'],
    category: 'support',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  }
};

const pushTemplates = {
  new_message: {
    id: 'new_message',
    name: 'New Message Notification',
    type: 'push',
    title: 'New message from {{senderName}}',
    body: '{{messagePreview}}',
    variables: ['senderName', 'messagePreview'],
    category: 'communication',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  },
  order_shipped: {
    id: 'order_shipped',
    name: 'Order Shipped',
    type: 'push',
    title: 'Your order #{{orderNumber}} has shipped!',
    body: 'Track your package with tracking number {{trackingNumber}}',
    variables: ['orderNumber', 'trackingNumber'],
    category: 'transactional',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
    isActive: true
  }
};

const allTemplates = { ...emailTemplates, ...pushTemplates };

// GET /api/notifications/templates - List all notification templates
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'email' or 'push'
  const category = searchParams.get('category');
  const active = searchParams.get('active');

  let templates = Object.values(allTemplates);

  // Filter by type
  if (type) {
    templates = templates.filter(template => template.type === type);
  }

  // Filter by category
  if (category) {
    templates = templates.filter(template => template.category === category);
  }

  // Filter by active status
  if (active !== null) {
    const isActive = active === 'true';
    templates = templates.filter(template => template.isActive === isActive);
  }

  // Sort by name
  templates.sort((a, b) => a.name.localeCompare(b.name));

  const categories = [...new Set(Object.values(allTemplates).map(t => t.category))];

  return NextResponse.json({
    templates: templates.map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      category: template.category,
      variables: template.variables,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    })),
    categories,
    total: templates.length
  });
}

// POST /api/notifications/templates - Create new template (mock)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, subject, html, text, title, bodyText, variables, category } = body;

    if (!name || !type || !variables) {
      return NextResponse.json(
        { error: 'Name, type, and variables are required' },
        { status: 400 }
      );
    }

    if (type === 'email' && (!subject || !html)) {
      return NextResponse.json(
        { error: 'Email templates require subject and html' },
        { status: 400 }
      );
    }

    if (type === 'push' && (!title || !bodyText)) {
      return NextResponse.json(
        { error: 'Push templates require title and body' },
        { status: 400 }
      );
    }

    const templateId = name.toLowerCase().replace(/\s+/g, '_');
    
    if (allTemplates[templateId as keyof typeof allTemplates]) {
      return NextResponse.json(
        { error: 'Template with this ID already exists' },
        { status: 409 }
      );
    }

    const newTemplate = {
      id: templateId,
      name,
      type,
      ...(type === 'email' ? { subject, html, text } : { title, body: bodyText }),
      variables,
      category: category || 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // In a real implementation, you would save to database
    // For this mock, we'll just return the created template
    
    return NextResponse.json({
      message: 'Template created successfully',
      template: newTemplate
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}