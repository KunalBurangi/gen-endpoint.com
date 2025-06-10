
import { type NextRequest, NextResponse } from 'next/server';
import { getAllPayments, PaymentTransaction } from '../../../../lib/data/payments';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get('userId'); // Map userId query param to customerId
  const status = searchParams.get('status') as PaymentTransaction['status'] | undefined;
  const orderId = searchParams.get('orderId');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  const filters: any = { limit, page };
  if (customerId) filters.customerId = customerId;
  if (status) filters.status = status;
  if (orderId) filters.orderId = orderId;

  // Get all payments matching filters (pagination is handled inside getAllPayments)
  const paginatedPayments = getAllPayments(filters);

  // For total count, we need to call getAllPayments without pagination filters
  // but with other filters to get the correct total for those filters.
  const allMatchingFiltersNoPagination = { ...filters };
  delete allMatchingFiltersNoPagination.limit;
  delete allMatchingFiltersNoPagination.page;
  const totalFilteredCount = getAllPayments(allMatchingFiltersNoPagination).length;


  return NextResponse.json({
    payments: paginatedPayments,
    pagination: {
      page,
      limit,
      total: totalFilteredCount,
      pages: Math.ceil(totalFilteredCount / limit)
    }
  });
}
