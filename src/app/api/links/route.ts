import { NextResponse } from 'next/server';
import { listUserLinks } from '@/lib/data/shortlinks'; // Alias path

export async function GET(request: Request) {
  try {
    // Optional: Extract userId or other filters from query parameters or headers
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    // const status = searchParams.get('status') || undefined;
    // const page = parseInt(searchParams.get('page') || '1', 10);
    // const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Currently listUserLinks only filters by userId.
    // Pagination/status filters would need to be added to listUserLinks if desired.
    const links = await listUserLinks(userId);

    const responsePayload = {
        links: links.map(link => ({
            id: link.id,
            shortCode: link.shortCode,
            originalUrl: link.originalUrl,
            totalClicks: link.clickCount,
            status: link.expiresAt && new Date(link.expiresAt) < new Date() ? 'expired' : 'active', // Basic status
            createdAt: link.createdAt,
            description: link.description,
            expiresAt: link.expiresAt,
            userId: link.userId
        })),
        // Example pagination structure, assuming links.length is total for current filter
        // pagination: { page:1, limit: links.length, total: links.length }
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error('Error listing links:', error);
    return NextResponse.json({ error: 'Failed to list links' }, { status: 500 });
  }
}
