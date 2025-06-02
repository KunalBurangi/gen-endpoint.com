
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');
  const timestamp = new Date().toISOString();

  if (name) {
    return NextResponse.json({ 
      message: `Hello, ${name}, from our API!`, 
      personalized: true,
      timestamp 
    });
  }
  return NextResponse.json({ 
    message: "Hello from our API!", 
    version: "1.0.0",
    timestamp
  });
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  try {
    const body = await request.json();
    const name = body.name || 'Guest';
    // You could add more complex logic based on body.preferences here if needed
    return NextResponse.json({ 
      message: `Greetings, ${name}! Your POST request was received.`,
      confirmationId: `post-${Math.random().toString(36).substring(2, 9)}`,
      receivedData: body,
      timestamp
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
