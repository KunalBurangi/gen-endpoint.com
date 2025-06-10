
import { type NextRequest, NextResponse } from 'next/server';
import { createPayment, PaymentMethodDetails } from '../../../../lib/data/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.amount || !body.currency || !body.paymentMethod || !body.orderId) {
      return NextResponse.json({
        error: "Missing required payment fields: orderId, amount, currency, paymentMethod"
      }, { status: 400 });
    }

    const { amount, currency, paymentMethod, orderId, customerId } = body;

    // Type assertion for paymentMethod if needed, or ensure it matches PaymentMethodDetails
    const paymentDetails = {
      orderId,
      customerId, // optional
      amount,
      currency,
      paymentMethod: paymentMethod as PaymentMethodDetails,
      // Other fields like 'description' could be added if part of your model
    };

    const newPayment = createPayment(paymentDetails);

    // The payment is initially pending; its status will be updated asynchronously by createPayment's setTimeout.
    // We return the initial state of the payment.
    return NextResponse.json({
      paymentId: newPayment.id, // Use the ID from the created payment
      status: newPayment.status, // Will be 'pending' initially
      amount: newPayment.amount,
      currency: newPayment.currency,
      orderId: newPayment.orderId,
      createdAt: newPayment.createdAt,
      message: "Payment processing initiated."
    }, { status: 202 }); // 202 Accepted for async processing

  } catch (error) {
    let errorMessage = "Invalid request body or processing error.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
