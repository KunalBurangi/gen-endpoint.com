import { NextResponse } from 'next/server';

export async function GET() {
    // Simulate higher rate limit headers
    const limit = 100;
    const remaining = Math.floor(Math.random() * 100);
    const reset = new Date(Date.now() + 60000).toISOString();

    return NextResponse.json({
        message: "Premium tier response",
        data: {
            enhanced: true,
            timestamp: new Date().toISOString()
        },
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
