import { NextResponse } from 'next/server';
import { deleteLink, getShortLinkById } from '@/lib/data/shortlinks'; // Alias path

interface RouteParams {
  params: {
    linkId: string;
  };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { linkId } = params;

    if (!linkId) {
      return NextResponse.json({ error: 'linkId parameter is required' }, { status: 400 });
    }

    // Optional: Extract userId from auth headers/session to ensure ownership
    // const userId = request.headers.get('x-user-id') || undefined;

    // Check if link exists before attempting delete for better error messaging
    const linkExists = await getShortLinkById(linkId);
    if (!linkExists) {
        return NextResponse.json({ error: 'Short link not found' }, { status: 404 });
    }

    // If implementing ownership:
    // const userIdFromAuth = "some_user_id_from_auth"; // Placeholder
    // if (linkExists.userId && linkExists.userId !== userIdFromAuth) {
    //   return NextResponse.json({ error: 'Forbidden: You do not own this link' }, { status: 403 });
    // }

    const success = await deleteLink(linkId /*, userIdFromAuth */); // Pass userId if checking ownership in deleteLink

    if (success) {
      return NextResponse.json({
        message: `Link ${linkId} deleted successfully`,
        deletedAt: new Date().toISOString()
      }, { status: 200 });
    } else {
      // This case might be hit if deleteLink had an internal issue after the exists check,
      // or if ownership check within deleteLink failed.
      return NextResponse.json({ error: 'Failed to delete link or link not found' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { linkId } = params;
    if (!linkId) {
      return NextResponse.json({ error: 'linkId parameter is required' }, { status: 400 });
    }
    const link = await getShortLinkById(linkId);
    if (!link) {
      return NextResponse.json({ error: 'Short link not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        totalClicks: link.clickCount,
        status: link.expiresAt && new Date(link.expiresAt) < new Date() ? 'expired' : 'active',
        createdAt: link.createdAt,
        description: link.description,
        expiresAt: link.expiresAt,
        userId: link.userId
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching link by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 });
  }
}
