import { NextResponse } from 'next/server';
import { getShortLinkByCode, incrementClickCount } from '@/lib/data/shortlinks'; // Alias path

interface RedirectParams {
  params: {
    shortCode: string;
  };
}

export async function GET(request: Request, { params }: RedirectParams) {
  try {
    const { shortCode } = params;

    if (!shortCode) {
      // This case should ideally not be hit if routing is set up correctly,
      // but good for robustness.
      return new NextResponse('Short code is required', { status: 400 });
    }

    const link = await getShortLinkByCode(shortCode);

    if (!link) {
      return new NextResponse('Short link not found', { status: 404 });
    }

    // Check for expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      // Optionally, you might want to delete the link here or just mark it as expired
      // For now, just return 404 as if it's not found or no longer valid
      return new NextResponse('Short link has expired', { status: 410 }); // 410 Gone is more specific for expired
    }

    // Increment click count (fire-and-forget is okay for this)
    incrementClickCount(shortCode).catch(err => {
      console.error(`Failed to increment click count for ${shortCode}:`, err);
    });

    // Perform the redirect
    // For URL shorteners, 302 (Found - temporary redirect) or 307 (Temporary Redirect) are common.
    // 301 is permanent and browsers/caches might not re-check.
    // Using 302 as per original comment, but 307 is also a good option.
    return NextResponse.redirect(link.originalUrl, 302);

  } catch (error: any) {
    console.error('Error during redirect:', error);
    // Avoid showing detailed errors to the end-user on a redirect path
    return new NextResponse('Error processing your request', { status: 500 });
  }
}
