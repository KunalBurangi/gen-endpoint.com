import { type NextRequest, NextResponse } from 'next/server';

// Mock analytics data storage
let analyticsEvents: any[] = [];
let eventCounter = 1;

// Mock user sessions
let userSessions: { [userId: string]: any } = {};

function generateEventId(): string {
  return `evt_${eventCounter++}`;
}

function generateSessionId(): string {
  return `sess_${Math.random().toString(36).substring(2, 9)}`;
}

function getOrCreateSession(userId: string, userAgent?: string, ip?: string): any {
  if (!userSessions[userId]) {
    userSessions[userId] = {
      sessionId: generateSessionId(),
      userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      userAgent,
      ip,
      pageViews: 0,
      events: []
    };
  } else {
    userSessions[userId].lastActivity = new Date().toISOString();
  }
  return userSessions[userId];
}

function validateEvent(event: any): { valid: boolean; error?: string } {
  if (!event.event) {
    return { valid: false, error: 'Event name is required' };
  }

  const validEvents = [
    'page_view', 'click', 'form_submit', 'purchase', 'signup', 'login', 'logout',
    'search', 'download', 'video_play', 'video_pause', 'add_to_cart', 'remove_from_cart',
    'checkout_start', 'checkout_complete', 'share', 'like', 'comment', 'scroll',
    'file_upload', 'api_call', 'error', 'custom'
  ];

  if (!validEvents.includes(event.event)) {
    return { valid: false, error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` };
  }

  return { valid: true };
}

function extractDeviceInfo(userAgent: string): any {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return {
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    browser,
    os,
    isMobile,
    isTablet,
    isDesktop
  };
}

// POST /api/analytics/track - Track user events and custom metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, userId, properties = {}, timestamp } = body;

    // Validate required fields
    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Validate event type
    const validation = validateEvent(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Extract request metadata
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const referer = request.headers.get('referer');

    // Get or create user session
    const session = userId ? getOrCreateSession(userId, userAgent, ip) : null;

    // Extract device and browser info
    const deviceInfo = extractDeviceInfo(userAgent);

    // Create analytics event
    const eventId = generateEventId();
    const eventTimestamp = timestamp || new Date().toISOString();

    const analyticsEvent: any = {
      id: eventId,
      event,
      userId: userId || null,
      sessionId: session?.sessionId || null,
      timestamp: eventTimestamp,
      properties: {
        ...properties,
        // Add automatic properties
        url: properties.url || referer,
        userAgent,
        ip,
        ...deviceInfo
      },
      processed: true,
      createdAt: new Date().toISOString()
    };

    // Store event
    analyticsEvents.push(analyticsEvent);

    // Update session if exists
    if (session) {
      session.events.push(eventId);
      if (event === 'page_view') {
        session.pageViews++;
      }
    }

    // Process specific event types
    if (event === 'purchase' && properties.revenue) {
      // Track revenue metrics
      analyticsEvent.revenue = parseFloat(properties.revenue);
    }

    if (event === 'error') {
      // Log error for monitoring
      console.log('User error tracked:', properties);
    }

    return NextResponse.json({
      success: true,
      eventId,
      processed: true,
      timestamp: eventTimestamp
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body or tracking error' },
      { status: 400 }
    );
  }
}

// GET /api/analytics/track - Get recent events for debugging
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const event = searchParams.get('event');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let events = [...analyticsEvents];

  // Filter by user ID
  if (userId) {
    events = events.filter(e => e.userId === userId);
  }

  // Filter by event type
  if (event) {
    events = events.filter(e => e.event === event);
  }

  // Sort by timestamp (newest first)
  events.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Limit results
  events = events.slice(0, limit);

  return NextResponse.json({
    events: events.map(e => ({
      id: e.id,
      event: e.event,
      userId: e.userId,
      timestamp: e.timestamp,
      properties: e.properties
    })),
    total: analyticsEvents.length,
    filtered: events.length
  });
}