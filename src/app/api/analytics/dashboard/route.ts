import { type NextRequest, NextResponse } from 'next/server';

// Mock analytics data - in a real app this would come from a database
let analyticsEvents: any[] = [
  { id: 'evt_1', event: 'page_view', userId: 'usr_1', timestamp: '2024-08-16T10:00:00Z', properties: { page: '/home', device: 'desktop' } },
  { id: 'evt_2', event: 'page_view', userId: 'usr_2', timestamp: '2024-08-16T10:05:00Z', properties: { page: '/products', device: 'mobile' } },
  { id: 'evt_3', event: 'click', userId: 'usr_1', timestamp: '2024-08-16T10:10:00Z', properties: { element: 'buy_button', page: '/products' } },
  { id: 'evt_4', event: 'purchase', userId: 'usr_1', timestamp: '2024-08-16T10:15:00Z', properties: { revenue: 99.99, items: 2 } },
  { id: 'evt_5', event: 'signup', userId: 'usr_3', timestamp: '2024-08-16T11:00:00Z', properties: { method: 'email' } },
  { id: 'evt_6', event: 'page_view', userId: 'usr_3', timestamp: '2024-08-16T11:05:00Z', properties: { page: '/dashboard', device: 'desktop' } },
  { id: 'evt_7', event: 'search', userId: 'usr_2', timestamp: '2024-08-16T11:30:00Z', properties: { query: 'javascript books' } },
  { id: 'evt_8', event: 'add_to_cart', userId: 'usr_2', timestamp: '2024-08-16T11:35:00Z', properties: { productId: 'prod_123' } },
  { id: 'evt_9', event: 'page_view', userId: 'usr_4', timestamp: '2024-08-15T14:00:00Z', properties: { page: '/about', device: 'tablet' } },
  { id: 'evt_10', event: 'video_play', userId: 'usr_1', timestamp: '2024-08-15T15:30:00Z', properties: { videoId: 'tutorial_1' } }
];

// Mock user data
const users = [
  { id: 'usr_1', createdAt: '2024-08-10T10:00:00Z', lastActive: '2024-08-16T10:15:00Z' },
  { id: 'usr_2', createdAt: '2024-08-12T14:00:00Z', lastActive: '2024-08-16T11:35:00Z' },
  { id: 'usr_3', createdAt: '2024-08-16T11:00:00Z', lastActive: '2024-08-16T11:05:00Z' },
  { id: 'usr_4', createdAt: '2024-08-14T16:00:00Z', lastActive: '2024-08-15T14:00:00Z' }
];

function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case '1d':
      start.setDate(end.getDate() - 1);
      break;
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    default:
      start.setDate(end.getDate() - 7);
  }

  return { start, end };
}

function filterEventsByDateRange(events: any[], start: Date, end: Date): any[] {
  return events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= start && eventDate <= end;
  });
}

function calculateMetrics(events: any[], previousEvents: any[], users: any[]) {
  // Page views
  const pageViews = events.filter(e => e.event === 'page_view').length;
  const previousPageViews = previousEvents.filter(e => e.event === 'page_view').length;
  const pageViewsChange = previousPageViews > 0 ? ((pageViews - previousPageViews) / previousPageViews * 100) : 0;

  // Unique users
  const uniqueUsers = new Set(events.map(e => e.userId)).size;
  const previousUniqueUsers = new Set(previousEvents.map(e => e.userId)).size;
  const uniqueUsersChange = previousUniqueUsers > 0 ? ((uniqueUsers - previousUniqueUsers) / previousUniqueUsers * 100) : 0;

  // Conversions (purchases)
  const conversions = events.filter(e => e.event === 'purchase').length;
  const previousConversions = previousEvents.filter(e => e.event === 'purchase').length;
  const conversionsChange = previousConversions > 0 ? ((conversions - previousConversions) / previousConversions * 100) : 0;

  // Revenue
  const revenue = events
    .filter(e => e.event === 'purchase')
    .reduce((sum, e) => sum + (e.properties.revenue || 0), 0);
  const previousRevenue = previousEvents
    .filter(e => e.event === 'purchase')
    .reduce((sum, e) => sum + (e.properties.revenue || 0), 0);
  const revenueChange = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue * 100) : 0;

  // Conversion rate
  const conversionRate = uniqueUsers > 0 ? (conversions / uniqueUsers * 100) : 0;
  const previousConversionRate = previousUniqueUsers > 0 ? (previousConversions / previousUniqueUsers * 100) : 0;
  const conversionRateChange = previousConversionRate > 0 ? ((conversionRate - previousConversionRate) / previousConversionRate * 100) : 0;

  // Bounce rate (simplified - users with only 1 page view)
  const userPageViews = events
    .filter(e => e.event === 'page_view')
    .reduce((acc: any, e) => {
      acc[e.userId] = (acc[e.userId] || 0) + 1;
      return acc;
    }, {});
  const bounceUsers = Object.values(userPageViews).filter((count: any) => count === 1).length;
  const bounceRate = uniqueUsers > 0 ? (bounceUsers / uniqueUsers * 100) : 0;

  return {
    pageViews: {
      value: pageViews,
      change: pageViewsChange > 0 ? `+${pageViewsChange.toFixed(1)}%` : `${pageViewsChange.toFixed(1)}%`
    },
    uniqueUsers: {
      value: uniqueUsers,
      change: uniqueUsersChange > 0 ? `+${uniqueUsersChange.toFixed(1)}%` : `${uniqueUsersChange.toFixed(1)}%`
    },
    conversions: {
      value: conversions,
      change: conversionsChange > 0 ? `+${conversionsChange.toFixed(1)}%` : `${conversionsChange.toFixed(1)}%`
    },
    revenue: {
      value: revenue,
      change: revenueChange > 0 ? `+${revenueChange.toFixed(1)}%` : `${revenueChange.toFixed(1)}%`
    },
    conversionRate: {
      value: conversionRate,
      change: conversionRateChange > 0 ? `+${conversionRateChange.toFixed(1)}%` : `${conversionRateChange.toFixed(1)}%`
    },
    bounceRate: {
      value: bounceRate,
      change: '0%' // Simplified for demo
    }
  };
}

function getTopPages(events: any[]): any[] {
  const pageViews = events.filter(e => e.event === 'page_view');
  const pageCounts = pageViews.reduce((acc: any, e) => {
    const page = e.properties.page || 'Unknown';
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(pageCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ page, views: count }));
}

function getDeviceBreakdown(events: any[]): any {
  const pageViews = events.filter(e => e.event === 'page_view');
  const deviceCounts = pageViews.reduce((acc: any, e) => {
    const device = e.properties.device || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const total = Object.values(deviceCounts).reduce((sum: number, count: any) => sum + count, 0);
  
  return Object.entries(deviceCounts).map(([device, count]: any) => ({
    device,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
}

function getRealTimeStats(events: any[]): any {
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentEvents = events.filter(e => new Date(e.timestamp) >= lastHour);
  const activeUsers = new Set(recentEvents.map(e => e.userId)).size;
  const currentPageViews = recentEvents.filter(e => e.event === 'page_view').length;

  return {
    activeUsers,
    pageViewsLastHour: currentPageViews,
    eventsLastHour: recentEvents.length
  };
}

// GET /api/analytics/dashboard - Get dashboard metrics and KPIs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '7d';
  const metrics = searchParams.get('metrics')?.split(',') || ['pageviews', 'users', 'conversions', 'revenue'];

  try {
    const { start, end } = getDateRange(period);
    
    // Calculate previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = start;

    // Filter events by date ranges
    const currentEvents = filterEventsByDateRange(analyticsEvents, start, end);
    const previousEvents = filterEventsByDateRange(analyticsEvents, previousStart, previousEnd);

    // Calculate metrics
    const calculatedMetrics = calculateMetrics(currentEvents, previousEvents, users);

    // Build response based on requested metrics
    const responseMetrics: any = {};
    if (metrics.includes('pageviews')) {
      responseMetrics.pageviews = calculatedMetrics.pageViews;
    }
    if (metrics.includes('users')) {
      responseMetrics.uniqueUsers = calculatedMetrics.uniqueUsers;
    }
    if (metrics.includes('conversions')) {
      responseMetrics.conversions = calculatedMetrics.conversions;
    }
    if (metrics.includes('revenue')) {
      responseMetrics.revenue = calculatedMetrics.revenue;
    }
    if (metrics.includes('conversion_rate')) {
      responseMetrics.conversionRate = calculatedMetrics.conversionRate;
    }
    if (metrics.includes('bounce_rate')) {
      responseMetrics.bounceRate = calculatedMetrics.bounceRate;
    }

    // Additional dashboard data
    const topPages = getTopPages(currentEvents);
    const deviceBreakdown = getDeviceBreakdown(currentEvents);
    const realTimeStats = getRealTimeStats(analyticsEvents);

    // Traffic sources (simplified)
    const trafficSources = [
      { source: 'Direct', sessions: Math.floor(Math.random() * 1000) + 500 },
      { source: 'Google', sessions: Math.floor(Math.random() * 800) + 400 },
      { source: 'Social Media', sessions: Math.floor(Math.random() * 300) + 100 },
      { source: 'Email', sessions: Math.floor(Math.random() * 200) + 50 }
    ];

    const response = {
      period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      metrics: responseMetrics,
      topPages,
      deviceBreakdown,
      trafficSources,
      realTime: realTimeStats,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate dashboard metrics' },
      { status: 500 }
    );
  }
}