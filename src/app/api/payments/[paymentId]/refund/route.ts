
import { type NextRequest, NextResponse } from 'next/server';

interface Params {
  paymentId: string;
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { paymentId } = params;
  try {
    const body = await request.json();
    // Basic validation
    if (!body.amount) {
      return NextResponse.json({ error: "Missing required refund field: amount" }, { status: 400 });
    }
    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is missing in path" }, { status: 400 });
    }

    const refundId = `ref_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      refundId,
      originalPaymentId: paymentId,
      status: "succeeded", // Simplified for testing
      amount: body.amount,
      currency: body.currency || "USD",
      reason: body.reason || "customer_request",
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    let errorMessage = "Invalid request body or refund processing error.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
