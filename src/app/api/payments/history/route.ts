
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Mock data
  const mockPayments = [
    { id: "pay_abc123", amount: 99.99, currency: "USD", status: "succeeded", createdAt: "2024-08-15T10:00:00Z", userId: "usr_1" },
    { id: "pay_def456", amount: 49.50, currency: "USD", status: "succeeded", createdAt: "2024-08-14T14:30:00Z", userId: "usr_2" },
    { id: "pay_ghi789", amount: 19.99, currency: "USD", status: "failed", createdAt: "2024-08-13T09:15:00Z", userId: "usr_1" },
  ];

  let filteredPayments = mockPayments;
  if (userId) {
    filteredPayments = filteredPayments.filter(p => p.userId === userId);
  }
  if (status) {
    filteredPayments = filteredPayments.filter(p => p.status === status);
  }

  const total = filteredPayments.length;
  const paginatedPayments = filteredPayments.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    payments: paginatedPayments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}
