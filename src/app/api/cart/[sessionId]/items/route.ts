import { type NextRequest, NextResponse } from 'next/server';
import {
  getCart,
  addItemToCart as addItem,
  updateItemInCart as updateItem,
  removeItemFromCart as removeItem,
  Cart
} from '../../../../lib/data/carts';

interface Params {
  sessionId: string;
}

// POST /api/cart/{sessionId}/items - Add item to cart
export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  try {
    const body = await request.json();
    const { productId, quantity = 1, options = {} } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (quantity <= 0 || quantity > 10) { // Basic quantity validation
        return NextResponse.json({ error: 'Quantity must be between 1 and 10' }, { status: 400 });
    }

    const updatedCart = addItem(sessionId, productId, quantity, options);

    if (!updatedCart) {
      // This could happen if product is not found by addItem
      return NextResponse.json({ error: 'Product not found or could not be added' }, { status: 404 });
    }
    
    // Find the item that was just added/updated to return it
    // This assumes options are simple enough for JSON.stringify comparison or that addItemToCart ensures uniqueness correctly
    const addedOrUpdatedItem = updatedCart.items.find(
        item => item.productId === productId && JSON.stringify(item.options) === JSON.stringify(options)
    ) || updatedCart.items[updatedCart.items.length -1]; // Fallback to last if specific not found

    return NextResponse.json({
      success: true,
      item: addedOrUpdatedItem, // Return the specific item added or updated
      cart: updatedCart // Return the whole updated cart
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body or error adding item' }, { status: 400 });
  }
}

// GET /api/cart/{sessionId}/items - List cart items
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  const cart = getCart(sessionId); // getCart ensures a cart always exists (new or existing)
  
  return NextResponse.json({
    items: cart.items,
    itemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    totals: { // Reconstruct totals object as per original response structure
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total
    }
  });
}

// PUT /api/cart/{sessionId}/items - Update item quantity in cart
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
    }

    if (quantity < 0 || quantity > 10) { // Allow 0 to remove, or up to 10
        return NextResponse.json({ error: 'Quantity must be between 0 and 10 (0 to remove)' }, { status: 400 });
    }

    const updatedCart = updateItem(sessionId, itemId, quantity);

    if (!updatedCart) {
      return NextResponse.json({ error: 'Item not found in cart or update failed' }, { status: 404 });
    }
    return NextResponse.json(updatedCart);
  } catch (error) {
     if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request body or error updating item' }, { status: 400 });
  }
}

// DELETE /api/cart/{sessionId}/items - Remove item from cart
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  try {
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const updatedCart = removeItem(sessionId, itemId);

    if (!updatedCart) {
      return NextResponse.json({ error: 'Item not found in cart or remove failed' }, { status: 404 });
    }
    return NextResponse.json(updatedCart);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body or error removing item' }, { status: 400 });
  }
}