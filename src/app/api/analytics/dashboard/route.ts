import { type NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '../../../../lib/data/analytics';

// GET /api/analytics/dashboard - Get dashboard metrics and KPIs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '7d';

  let metricsArray: string[] | undefined = undefined;
  const metricsParam = searchParams.get('metrics');
  if (metricsParam) {
    metricsArray = metricsParam.split(',');
  }

  try {
    const dashboardData = getDashboardData({ period, metrics: metricsArray });
    return NextResponse.json(dashboardData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate dashboard metrics' },
      { status: 500 }
    );
  }
}