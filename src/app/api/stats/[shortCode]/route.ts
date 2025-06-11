import { NextResponse } from 'next/server';
import { getLinkStats } from '@/lib/data/shortlinks'; // Path alias is correct

interface StatsParams {
  params: {
    shortCode: string;
  };
}

export async function GET(request: Request, { params }: StatsParams) {
  try {
    const { shortCode } = params;

    if (!shortCode) {
      return NextResponse.json({ error: 'shortCode parameter is required' }, { status: 400 });
    }

    const stats = await getLinkStats(shortCode);

    if (!stats) {
      return NextResponse.json({ error: 'Short link not found' }, { status: 404 });
    }

    // The example response in apis.ts is:
    // '{
  // "shortCode": "my-link",
  // "originalUrl": "https://www.example.com/very/long/path/to/content",
  // "totalClicks": 1250,
  // "uniqueClicks": 892,
  // "clicksByDate": [
  //   {"date": "2024-08-15", "clicks": 45},
  //   {"date": "2024-08-16", "clicks": 67}
  // ],
  // "topReferrers": ["google.com", "twitter.com", "facebook.com"],
  // "countries": [{"code": "US", "name": "United States", "clicks": 678}]
//}'
    // The current getLinkStats only returns basic stats:
    // { shortCode, originalUrl, totalClicks, createdAt, description?, expiresAt? }
    // Matching the defined structure as much as possible with current data.

    const responsePayload = {
        shortCode: stats.shortCode,
        originalUrl: stats.originalUrl,
        totalClicks: stats.totalClicks,
        // --- Fields from example not yet in basic stats ---
        uniqueClicks: stats.totalClicks, // Placeholder: assume totalClicks = uniqueClicks for now
        clicksByDate: [], // Placeholder: not implemented in getLinkStats
        topReferrers: [], // Placeholder
        countries: [], // Placeholder
        // --- Additional available data from getLinkStats ---
        createdAt: stats.createdAt,
        description: stats.description, // Will be undefined if not set
        expiresAt: stats.expiresAt,     // Will be undefined if not set
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error('Error retrieving link stats:', error);
    return NextResponse.json({ error: 'Failed to retrieve link stats' }, { status: 500 });
  }
}
