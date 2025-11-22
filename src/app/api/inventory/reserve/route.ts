```typescript
import { NextResponse } from 'next/server';
import { inventoryStore } from '@/data/mock-inventory';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, orderId } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const item = await inventoryStore.getById(productId);

    if (!item) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const available = item.totalStock - item.reserved;

    if (available < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock', available },
        { status: 409 }
      );
    }

    // Update reserved stock
    await inventoryStore.update(productId, {
      reserved: item.reserved + quantity
    });

    return NextResponse.json({
      success: true,
      reserved: quantity,
      productId,
      remainingAvailable: available - quantity,
      reservationId: `res_${ nanoid(8) } `
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
```
