import { type NextRequest, NextResponse } from 'next/server';
import { getCart, applyCouponToCart, deleteCart as removeCartFromStore, clearCart as emptyCartItems } from '../../../lib/data/carts';

interface Params {
  sessionId: string;
}

// GET /api/cart/{sessionId} - Get cart contents
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  // getCart function in carts.ts handles creation if not exists and expiration
  const cart = getCart(sessionId);
  
  // If getCart recreated an expired cart, it will be new.
  // If it didn't find one and created a new one, that's also fine.
  // If it found an active one, it returns it.
  // The old logic for returning 410 on expired cart is now handled inside getCart by re-creating.
  // If a truly "not found" scenario that shouldn't result in creation is needed, getCart logic would need adjustment.
  // For now, getCart always returns a cart (either existing, new, or re-created).
  return NextResponse.json(cart);
}

// POST /api/cart/{sessionId}/items - Add item to cart (handled in separate endpoint)
export async function POST(request: NextRequest, { params }: { params: Params }) {
  return NextResponse.json(
    { error: 'Use /api/cart/{sessionId}/items to add items' },
    { status: 405 }
  );
}

// PUT /api/cart/{sessionId} - Update cart metadata (e.g., apply coupon)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  try {
    const body = await request.json();
    
    if (!body.couponCode) {
      return NextResponse.json(
        { error: 'Coupon code is required in the request body' },
        { status: 400 }
      );
    }

    const updatedCart = applyCouponToCart(sessionId, body.couponCode);

    if (!updatedCart) {
      // This might happen if the cart itself didn't exist, though getCart in applyCouponToCart should handle it.
      // Or if applyCouponToCart returns undefined for an invalid coupon (current logic sets couponCode to undefined).
      // Let's check if the coupon was applied or rejected.
      const cart = getCart(sessionId); // Re-fetch to see the state
      if (cart.couponCode?.toUpperCase() !== body.couponCode.toUpperCase()) {
         return NextResponse.json({ error: 'Invalid or expired coupon code' , cart }, { status: 400 });
      }
       return NextResponse.json(cart); // Return cart even if coupon was invalid but cart exists
    }

    return NextResponse.json(updatedCart);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE /api/cart/{sessionId} - Clear entire cart
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  // The task asks to "clear cart/delete cart".
  // `clearCart` in carts.ts empties items but keeps the cart session.
  // `deleteCart` in carts.ts removes the cart session entirely.
  // The original API definition for DELETE /api/cart/{sessionId} was "Clear all items from the cart".
  // So, using emptyCartItems (aliased as clearCart in carts.ts) seems more appropriate.

  const cart = emptyCartItems(sessionId);
  // emptyCartItems (clearCart in carts.ts) will get/create the cart and then empty its items.
  // It always returns a cart.

  if (!cart) {
    // This case should ideally not be reached if clearCart always returns a cart.
    // However, if we were using a function that could fail to find the cart:
    return NextResponse.json({ error: 'Cart not found or could not be cleared' }, { status: 404 });
  }
  
  return NextResponse.json({
    message: `Cart ${sessionId} cleared successfully.`,
    timestamp: new Date().toISOString()
  });
}