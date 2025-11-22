import { NextResponse } from 'next/server';
import { inventoryStore } from '@/data/mock-inventory';
import { nanoid } from 'nanoid';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, adjustment, reason, warehouseId } = body;

    if (!productId || typeof adjustment !== 'number') {
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

    const newTotalStock = item.totalStock + adjustment;

    if (newTotalStock < 0) {
      return NextResponse.json(
        { error: 'Adjustment would result in negative stock' },
        { status: 400 }
      );
    }

    const updates: any = {
      totalStock: newTotalStock
    };

    if (warehouseId) {
      if (!item.warehouses[warehouseId] && adjustment < 0) {
        return NextResponse.json(
          { error: 'Warehouse not found or insufficient stock' },
          { status: 400 }
        );
      }
      const currentWarehouseStock = item.warehouses[warehouseId] || 0;
      const newWarehouseStock = currentWarehouseStock + adjustment;
      if (newWarehouseStock < 0) {
        return NextResponse.json(
          { error: 'Adjustment would result in negative warehouse stock' },
          { status: 400 }
        );
      }
      updates.warehouses = {
        ...item.warehouses,
        [warehouseId]: newWarehouseStock
      };
    }

    await inventoryStore.update(productId, updates);

    return NextResponse.json({
      productId,
      newTotalStock,
      newWarehouseStock: warehouseId ? updates.warehouses[warehouseId] : undefined,
      adjustmentId: `adj_${nanoid(8)} `,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
