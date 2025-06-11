import { NextResponse } from 'next/server';
import { createShortLink } from '@/lib/data/shortlinks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalUrl, customAlias, description, expiresAt, userId } = body;

    if (!originalUrl) {
      return NextResponse.json({ error: 'originalUrl is required' }, { status: 400 });
    }

    const linkData = {
      originalUrl,
      shortCode: customAlias, // createShortLink handles undefined shortCode
      description,
      expiresAt,
      userId,
    };

    const newLink = await createShortLink(linkData);

    // Construct the full short URL to return
    // Assuming the redirector route will be at /s/[shortCode]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const fullShortUrl = `${appUrl}/s/${newLink.shortCode}`;

    const responsePayload = {
      id: newLink.id,
      shortUrl: fullShortUrl,
      originalUrl: newLink.originalUrl,
      shortCode: newLink.shortCode,
      createdAt: newLink.createdAt,
      expiresAt: newLink.expiresAt,
      description: newLink.description,
      clickCount: newLink.clickCount, // Include initial clickCount
    };

    return NextResponse.json(responsePayload, { status: 201 });

  } catch (error: any) {
    console.error('Error creating short link:', error);
    if (error.message === 'Invalid original URL' || error.message === 'Custom alias (shortCode) already exists.') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create short link' }, { status: 500 });
  }
}
