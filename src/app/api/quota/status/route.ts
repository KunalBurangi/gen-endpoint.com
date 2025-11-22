import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        userId: "usr_123",
        plan: "premium",
        quotas: {
            api_calls: {
                used: 1250,
                limit: 10000,
                resetDate: "2024-09-01"
            },
            file_uploads: {
                used: 45,
                limit: 100,
                resetDate: "2024-09-01"
            }
        }
    });
}
