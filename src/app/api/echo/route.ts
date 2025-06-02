
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const queryParams: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return NextResponse.json({
    type: "GET",
    queryParams: queryParams,
    message: "Query parameters echoed successfully.",
    headers: Object.fromEntries(request.headers),
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  try {
    const body = await request.json();
    return NextResponse.json({
      type: "POST",
      receivedBody: body,
      message: "JSON body echoed successfully.",
      headers: Object.fromEntries(request.headers),
      timestamp
    });
  } catch (error) {
    // If body is not JSON, try to read as text
    try {
        const textBody = await request.text();
         return NextResponse.json({
            type: "POST",
            receivedBody: textBody,
            message: "Non-JSON body echoed successfully as text.",
            headers: Object.fromEntries(request.headers),
            timestamp
        });
    } catch (textError) {
        return NextResponse.json({ 
            error: "Could not parse body as JSON or Text.",
            details: (error as Error).message 
        }, { status: 400 });
    }
  }
}
