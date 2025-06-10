import { type NextRequest, NextResponse } from 'next/server';
import { trackEvent, getAllEvents, AnalyticsEventProperties } from '../../../../lib/data/analytics';

// Helper function to extract device information from User-Agent
// This can remain in the route as it's specific to request processing here
function extractDeviceInfo(userAgent: string | null): Partial<AnalyticsEventProperties> {
  if (!userAgent) return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };

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
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : ('desktop' as 'mobile' | 'tablet' | 'desktop'),
    browser,
    os,
    // No longer need isMobile, isTablet, isDesktop as separate fields in properties if deviceType serves
  };
}

// Simple session ID generator (can be more robust)
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}


// Event validation can remain here or be moved to the library
function validateEventName(eventName: string): { valid: boolean; error?: string } {
  if (!eventName) {
    return { valid: false, error: 'Event name is required' };
  }
  const validEvents = [
    'page_view', 'click', 'form_submit', 'purchase', 'signup', 'login', 'logout',
    'search', 'download', 'video_play', 'video_pause', 'add_to_cart', 'remove_from_cart',
    'checkout_start', 'checkout_complete', 'share', 'like', 'comment', 'scroll',
    'file_upload', 'api_call', 'error', 'custom'
  ];
  if (!validEvents.includes(eventName)) {
    return { valid: false, error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` };
  }
  return { valid: true };
}


// POST /api/analytics/track - Track user events and custom metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event: eventName, userId, sessionId: providedSessionId, properties = {}, timestamp } = body;

    const validation = validateEventName(eventName);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent');
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const referer = request.headers.get('referer');
    const deviceInfo = extractDeviceInfo(userAgent);

    // Session ID: use provided, or generate a new one (simplified session handling)
    const sessionId = providedSessionId || generateSessionId();

    const eventTimestamp = timestamp || new Date().toISOString();

    const eventDataToTrack = {
      event: eventName,
      userId: userId || null,
      sessionId: sessionId, // Include sessionId
      timestamp: eventTimestamp,
      properties: {
        ...properties,
        url: properties.url || referer || undefined,
        userAgent: userAgent || undefined,
        ip,
        ...deviceInfo,
      } as AnalyticsEventProperties,
      // 'processed' and 'createdAt' will be set by trackEvent
    };

    const newEvent = trackEvent(eventDataToTrack);

    // Optional: Log specific event types like errors or purchases server-side if needed
    if (newEvent.event === 'error') {
      console.error('User error tracked:', newEvent.properties);
    }
    if (newEvent.event === 'purchase' && newEvent.properties.revenue) {
      console.log('Purchase tracked:', newEvent.id, 'Revenue:', newEvent.properties.revenue);
    }

    return NextResponse.json({
      success: true,
      eventId: newEvent.id,
      processed: newEvent.processed,
      timestamp: newEvent.timestamp
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
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const filters: any = { limit };
  if (userId) filters.userId = userId;
  if (event) filters.event = event;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const retrievedEvents = getAllEvents(filters);
  const totalEventsInStore = getAllEvents().length; // Get total count without filters for context

  return NextResponse.json({
    events: retrievedEvents.map(e => ({ // Return a subset of fields or all, as needed
      id: e.id,
      event: e.event,
      userId: e.userId,
      sessionId: e.sessionId,
      timestamp: e.timestamp,
      properties: e.properties
    })),
    totalInFilter: retrievedEvents.length,
    totalInStore: totalEventsInStore,
  });
}