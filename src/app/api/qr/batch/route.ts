
import { type NextRequest, NextResponse } from 'next/server';

let batchCounter = 789;

function generateBatchId(): string {
  return `batch_${batchCounter++}`;
}

// POST /api/qr/batch - Generate multiple QR codes in batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codes, format = "png", size = 256 } = body;

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: "Missing 'codes' array or array is empty" }, { status: 400 });
    }

    const batchId = generateBatchId();
    const createdAt = new Date().toISOString();
    const estimatedCompletion = new Date(Date.now() + codes.length * 500).toISOString(); // 0.5s per code

    // In a real app, you would queue this for batch processing.
    // For this mock, we'll just return a confirmation.

    const response = {
      batchId,
      status: "processing", // or "queued"
      totalCodes: codes.length,
      format,
      size,
      createdAt,
      estimatedCompletion,
      message: "QR code batch generation request accepted. This is a mock response."
    };

    return NextResponse.json(response, { status: 202 }); // 202 Accepted

  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body or batch processing error" },
      { status: 400 }
    );
  }
}
