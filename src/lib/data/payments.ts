export interface PaymentMethodDetails {
  type: 'card' | 'paypal' | 'bank_transfer' | string; // string for other types
  token?: string; // e.g., card token, payment method token
  last4?: string; // Last 4 digits of a card
  brand?: string; // Card brand e.g. Visa
}

export interface RefundSubTransaction {
  refundId: string;
  amount: number;
  currency: string;
  reason?: string;
  processedAt: string;
  gatewayRefundId?: string;
}

export interface PaymentTransaction {
  id: string; // Unique transaction ID
  orderId: string;
  customerId?: string; // Optional, if payments are linked to customers
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodDetails;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  createdAt: string;
  updatedAt?: string;
  paymentGatewayDetails?: Record<string, any>; // e.g., { transactionIdFromGateway: '...', authCode: '...' }
  refunds?: RefundSubTransaction[];
}

// In-memory store for payment transactions
let paymentTransactions: PaymentTransaction[] = [];
let transactionCounter = 1;

function generateTransactionId(): string {
  return `pay_${transactionCounter++}_${Date.now().toString(36)}`;
}

function generateRefundId(): string {
  return `ref_${Math.random().toString(36).substring(2, 9)}`;
}

// --- Core Payment Functions ---

export function createPayment(
  paymentDetails: Omit<PaymentTransaction, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'paymentGatewayDetails' | 'refunds'>
): PaymentTransaction {
  const now = new Date().toISOString();
  const newPayment: PaymentTransaction = {
    ...paymentDetails,
    id: generateTransactionId(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    refunds: [],
  };

  // Simulate gateway processing
  setTimeout(() => {
    const paymentIndex = paymentTransactions.findIndex(p => p.id === newPayment.id);
    if (paymentIndex !== -1) {
      const success = Math.random() > 0.1; // 90% success rate
      paymentTransactions[paymentIndex].status = success ? 'succeeded' : 'failed';
      paymentTransactions[paymentIndex].updatedAt = new Date().toISOString();
      paymentTransactions[paymentIndex].paymentGatewayDetails = {
        gatewayTransactionId: `gw_${newPayment.id}`,
        responseCode: success ? '00' : '51',
        message: success ? 'Payment successful' : 'Payment declined by gateway',
      };
    }
  }, 1000); // Simulate 1 second delay

  paymentTransactions.push(newPayment);
  // Return the initial pending state; status will update asynchronously
  return { ...newPayment };
}

export function getPaymentById(id: string): PaymentTransaction | undefined {
  return paymentTransactions.find(p => p.id === id);
}

export function getPaymentsByOrderId(orderId: string): PaymentTransaction[] {
  return paymentTransactions.filter(p => p.orderId === orderId);
}

export function getAllPayments(filters?: {
  customerId?: string;
  status?: PaymentTransaction['status'];
  orderId?: string;
  limit?: number;
  page?: number;
}): PaymentTransaction[] {
  let results = [...paymentTransactions];
  if (filters?.customerId) {
    results = results.filter(p => p.customerId === filters.customerId);
  }
  if (filters?.status) {
    results = results.filter(p => p.status === filters.status);
  }
  if (filters?.orderId) {
    results = results.filter(p => p.orderId === filters.orderId);
  }

  results.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filters?.limit && filters?.page) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    return results.slice(start, end);
  }
  if (filters?.limit) {
    return results.slice(0, filters.limit);
  }

  return results;
}

export function updatePayment(
  id: string,
  updates: Partial<Omit<PaymentTransaction, 'id' | 'createdAt' | 'orderId' | 'amount' | 'currency' | 'paymentMethod'>>
): PaymentTransaction | undefined {
  const paymentIndex = paymentTransactions.findIndex(p => p.id === id);
  if (paymentIndex === -1) {
    return undefined;
  }
  paymentTransactions[paymentIndex] = {
    ...paymentTransactions[paymentIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return paymentTransactions[paymentIndex];
}

export function addRefundToPayment(
  transactionId: string,
  refundRequest: Omit<RefundSubTransaction, 'refundId' | 'processedAt' | 'gatewayRefundId'> & { amount: number; currency: string; reason?: string }
): { payment?: PaymentTransaction, refund?: RefundSubTransaction, error?: string } {
  const payment = getPaymentById(transactionId);
  if (!payment) {
    return { error: "Original payment not found" };
  }

  if (payment.status !== 'succeeded' && payment.status !== 'partially_refunded') {
    return { error: "Payment is not in a refundable state" };
  }

  const totalRefunded = payment.refunds?.reduce((sum, ref) => sum + ref.amount, 0) || 0;
  if (totalRefunded + refundRequest.amount > payment.amount) {
    return { error: "Refund amount exceeds refundable amount" };
  }

  const newRefund: RefundSubTransaction = {
    ...refundRequest,
    refundId: generateRefundId(),
    processedAt: new Date().toISOString(),
    gatewayRefundId: `gw_ref_${generateRefundId()}`
  };

  if (!payment.refunds) {
    payment.refunds = [];
  }
  payment.refunds.push(newRefund);

  const newTotalRefunded = totalRefunded + newRefund.amount;
  let newStatus = payment.status;
  if (newTotalRefunded >= payment.amount) {
    newStatus = 'refunded';
  } else if (newTotalRefunded > 0) {
    newStatus = 'partially_refunded';
  }

  const updatedPayment = updatePayment(transactionId, { status: newStatus, refunds: payment.refunds });

  return { payment: updatedPayment, refund: newRefund };
}


// Utility for testing
export function _resetPaymentsForTesting(): void {
  paymentTransactions = [];
  transactionCounter = 1;
}
