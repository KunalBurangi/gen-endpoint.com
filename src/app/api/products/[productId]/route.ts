
import { type NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct, Product } from '../../../../lib/data/products';

interface Params {
  productId: string;
}

// GET /api/products/{productId} - Retrieve a specific product
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { productId } = params;
  const product = getProductById(productId);
  if (product) {
    return NextResponse.json(product);
  }
  return NextResponse.json({ error: "Product not found" }, { status: 404 });
}

// PUT /api/products/{productId} - Update an existing product
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { productId } = params;
  try {
    const body = await request.json() as Partial<Omit<Product, 'id' | 'createdAt'>>;
    const { id, createdAt, ...updateData } = body as any; // Exclude id and createdAt

    const updatedProduct = updateProduct(productId, updateData);

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error updating product." }, { status: 400 });
  }
}

// DELETE /api/products/{productId} - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { productId } = params;
  const success = deleteProduct(productId);

  if (!success) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ message: `Product ${productId} deleted successfully.`, timestamp: new Date().toISOString() });
}

