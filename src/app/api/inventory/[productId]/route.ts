import { NextResponse } from 'next/server';
import { inventoryStore } from '@/data/mock-inventory';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    const productId = (await params).productId;
    const item = await inventoryStore.getById(productId);

    if (!item) {
        return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
        );
    }

    // Calculate available stock dynamically
    const available = item.totalStock - item.reserved;

    return NextResponse.json({
        ...item,
        available
    });
}
