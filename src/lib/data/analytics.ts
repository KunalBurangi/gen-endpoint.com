export interface AnalyticsEventProperties {
  url?: string;
  userAgent?: string;
  ip?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  page?: string; // For page_view events
  element?: string; // For click events
  revenue?: number; // For purchase events
  items?: number; // For purchase events
  method?: string; // For signup events
  query?: string; // For search events
  productId?: string; // For add_to_cart events
  videoId?: string; // For video_play events
  [key: string]: any; // Allow other custom properties
}

export interface AnalyticsEvent {
  id: string; // Unique event ID
  event: string; // Event name, e.g., 'page_view', 'click', 'purchase'
  userId: string | null;
  sessionId: string | null;
  timestamp: string; // ISO string format
  properties: AnalyticsEventProperties;
  processed: boolean;
  createdAt: string; // ISO string format when the event was recorded by the system
}

// In-memory store for analytics events
let analyticsEvents: AnalyticsEvent[] = [];
let eventCounter = 1;

function generateEventId(): string {
  return `evt_${eventCounter++}`;
}

// --- Event Tracking Functions ---

export function trackEvent(
  eventData: Omit<AnalyticsEvent, 'id' | 'createdAt' | 'processed'>
): AnalyticsEvent {
  const newEvent: AnalyticsEvent = {
    ...eventData,
    id: generateEventId(),
    createdAt: new Date().toISOString(),
    processed: true, // Mark as processed immediately for this mock
  };
  analyticsEvents.push(newEvent);
  return newEvent;
}

export function getAllEvents(filters?: {
  userId?: string;
  event?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): AnalyticsEvent[] {
  let events = [...analyticsEvents];

  if (filters?.userId) {
    events = events.filter(e => e.userId === filters.userId);
  }
  if (filters?.event) {
    events = events.filter(e => e.event === filters.event);
  }
  if (filters?.startDate) {
    events = events.filter(e => new Date(e.timestamp) >= new Date(filters.startDate!));
  }
  if (filters?.endDate) {
    events = events.filter(e => new Date(e.timestamp) <= new Date(filters.endDate!));
  }

  // Sort by timestamp (newest first) by default before limiting
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.limit) {
    events = events.slice(0, filters.limit);
  }
  return events;
}


// --- Dashboard Data Functions ---

interface DateRange {
  start: Date;
  end: Date;
}

function getDateRange(period: string = '7d'): DateRange {
  const end = new Date();
  const start = new Date();
  const periods: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
  start.setDate(end.getDate() - (periods[period] || 7));
  return { start, end };
}

function filterEventsByDateRange(events: AnalyticsEvent[], startDate: Date, endDate: Date): AnalyticsEvent[] {
  return events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

function calculateMetric(currentVal: number, previousVal: number): { value: number; change: string } {
    const changeNum = previousVal > 0 ? ((currentVal - previousVal) / previousVal) * 100 : (currentVal > 0 ? 100 : 0);
    return {
        value: currentVal,
        change: (currentVal >= previousVal && changeNum !== 0 ? '+' : '') + `${changeNum.toFixed(1)}%`
    };
}

export function getDashboardData(params: { period?: string; metrics?: string[] }): any {
  const { period = '7d', metrics = ['pageviews', 'users', 'conversions', 'revenue'] } = params;

  const currentRange = getDateRange(period);
  const periodLengthMs = currentRange.end.getTime() - currentRange.start.getTime();
  const previousRange: DateRange = {
    start: new Date(currentRange.start.getTime() - periodLengthMs),
    end: new Date(currentRange.start.getTime() - 1), // Ensure it ends right before current period starts
  };

  const allEvts = getAllEvents(); // Get all events, then filter
  const currentEvents = filterEventsByDateRange(allEvts, currentRange.start, currentRange.end);
  const previousEvents = filterEventsByDateRange(allEvts, previousRange.start, previousRange.end);

  // Metric Calculations
  const currentMetricsData = {
    pageViews: currentEvents.filter(e => e.event === 'page_view').length,
    uniqueUsers: new Set(currentEvents.map(e => e.userId).filter(Boolean)).size,
    conversions: currentEvents.filter(e => e.event === 'purchase').length,
    revenue: currentEvents.filter(e => e.event === 'purchase').reduce((sum, e) => sum + (e.properties.revenue || 0), 0),
  };
   currentMetricsData.conversionRate = currentMetricsData.uniqueUsers > 0 ? (currentMetricsData.conversions / currentMetricsData.uniqueUsers * 100) : 0;


  const previousMetricsData = {
    pageViews: previousEvents.filter(e => e.event === 'page_view').length,
    uniqueUsers: new Set(previousEvents.map(e => e.userId).filter(Boolean)).size,
    conversions: previousEvents.filter(e => e.event === 'purchase').length,
    revenue: previousEvents.filter(e => e.event === 'purchase').reduce((sum, e) => sum + (e.properties.revenue || 0), 0),
  };
  previousMetricsData.conversionRate = previousMetricsData.uniqueUsers > 0 ? (previousMetricsData.conversions / previousMetricsData.uniqueUsers * 100) : 0;


  const responseMetrics: any = {};
  if (metrics.includes('pageviews')) {
    responseMetrics.pageviews = calculateMetric(currentMetricsData.pageViews, previousMetricsData.pageViews);
  }
  if (metrics.includes('users')) {
    responseMetrics.uniqueUsers = calculateMetric(currentMetricsData.uniqueUsers, previousMetricsData.uniqueUsers);
  }
  if (metrics.includes('conversions')) {
    responseMetrics.conversions = calculateMetric(currentMetricsData.conversions, previousMetricsData.conversions);
  }
  if (metrics.includes('revenue')) {
    responseMetrics.revenue = calculateMetric(currentMetricsData.revenue, previousMetricsData.revenue);
     responseMetrics.revenue.value = parseFloat(responseMetrics.revenue.value.toFixed(2)); // Ensure revenue is formatted
  }
   if (metrics.includes('conversion_rate')) {
    responseMetrics.conversionRate = calculateMetric(currentMetricsData.conversionRate, previousMetricsData.conversionRate);
  }


  // Top Pages
  const pageCounts = currentEvents
    .filter(e => e.event === 'page_view' && e.properties.page)
    .reduce((acc: Record<string, number>, e) => {
      acc[e.properties.page!] = (acc[e.properties.page!] || 0) + 1;
      return acc;
    }, {});
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5 pages
    .map(([page, views]) => ({ page, views }));

  // Device Breakdown
  const deviceCounts = currentEvents
    .filter(e => e.properties.deviceType)
    .reduce((acc: Record<string, number>, e) => {
      acc[e.properties.deviceType!] = (acc[e.properties.deviceType!] || 0) + 1;
      return acc;
    }, {});
  const totalDevices = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0);
  const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count,
    percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0,
  }));

  // Real-time (simplified - last hour from all data for demo)
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);
  const recentEvents = filterEventsByDateRange(allEvts, lastHour, new Date());

  return {
    period,
    dateRange: { start: currentRange.start.toISOString(), end: currentRange.end.toISOString() },
    metrics: responseMetrics,
    topPages,
    deviceBreakdown,
    realTime: {
        activeUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
        pageViewsLastHour: recentEvents.filter(e => e.event === 'page_view').length,
        eventsLastHour: recentEvents.length,
    },
    generatedAt: new Date().toISOString(),
  };
}

// Utility to reset events if needed for testing environments
export function _resetAnalyticsEventsForTesting(): void {
  analyticsEvents = [];
  eventCounter = 1;
}
