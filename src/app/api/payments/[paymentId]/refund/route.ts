
import { type NextRequest, NextResponse } from 'next/server';
import { getPaymentById, addRefundToPayment, PaymentTransaction } from '../../../../../lib/data/payments';

interface Params {
  paymentId: string; // This corresponds to transactionId in payments.ts
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { paymentId: transactionId } = params; // Rename for clarity with the library
  try {
    const body = await request.json();
    const { amount, reason, currency = 'USD' } = body;

    if (!amount) {
      return NextResponse.json({ error: "Missing required refund field: amount" }, { status: 400 });
    }
    if (!transactionId) {
      return NextResponse.json({ error: "Payment ID (transactionId) is missing in path" }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: "Refund amount must be a positive number" }, { status: 400 });
    }


    const refundResult = addRefundToPayment(transactionId, {
      amount,
      currency, // Ensure currency is passed
      reason: reason || "customer_request",
    });

    if (refundResult.error) {
        return NextResponse.json({ error: refundResult.error }, { status: 400 }); // Or 404 if original payment not found
    }

    if (!refundResult.payment || !refundResult.refund) {
        // Should not happen if error is not set, but as a safeguard
        return NextResponse.json({ error: "Failed to process refund for an unknown reason." }, { status: 500 });
    }

    return NextResponse.json({
      refundId: refundResult.refund.refundId,
      originalPaymentId: transactionId,
      paymentStatus: refundResult.payment.status,
      refundedAmount: refundResult.refund.amount,
      currency: refundResult.refund.currency,
      reason: refundResult.refund.reason,
      processedAt: refundResult.refund.processedAt,
      payment: refundResult.payment // Optionally return the updated payment object
    });

  } catch (error) {
    let errorMessage = "Invalid request body or refund processing error.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
