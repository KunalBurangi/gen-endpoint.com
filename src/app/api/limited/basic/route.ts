import { NextResponse } from 'next/server';

export async function GET() {
    // Simulate rate limit headers
    const limit = 10;
    const remaining = Math.floor(Math.random() * 10);
    const reset = new Date(Date.now() + 60000).toISOString();

    return NextResponse.json({
        message: "Basic tier response",
        data: { timestamp: new Date().toISOString() },
        rateLimit: {
            limit,
            remaining,
            resetAt: reset
        }
    }, {
        headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset
        }
    });
}
