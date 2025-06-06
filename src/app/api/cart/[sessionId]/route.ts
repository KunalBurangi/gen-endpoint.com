import { type NextRequest, NextResponse } from 'next/server';

// Mock cart storage - in a real app, this would be Redis or database
let carts: { [sessionId: string]: any } = {
  'sess_123': {
    sessionId: 'sess_123',
    items: [
      {
        id: 'item_1',
        productId: 'prod_123',
        name: 'Wireless Headphones',
        price: 99.99,
        quantity: 2,
        options: { color: 'black', size: 'standard' },
        imageUrl: 'https://placehold.co/100x100.png',
        subtotal: 199.98,
        addedAt: '2024-08-16T12:00:00Z'
      },
      {
        id: 'item_2',
        productId: 'prod_456',
        name: 'JavaScript Book',
        price: 29.99,
        quantity: 1,
        options: { format: 'paperback' },
        imageUrl: 'https://placehold.co/100x100.png',
        subtotal: 29.99,
        addedAt: '2024-08-16T12:05:00Z'
      }
    ],
    totals: {
      subtotal: 229.97,
      tax: 18.40,
      shipping: 9.99,
      discount: 0,
      total: 258.36
    },
    createdAt: '2024-08-16T12:00:00Z',
    updatedAt: '2024-08-16T12:05:00Z',
    expiresAt: '2024-08-17T12:00:00Z'
  }
};

// Mock product data for cart operations
const products: { [id: string]: any } = {
  'prod_123': { id: 'prod_123', name: 'Wireless Headphones', price: 99.99, inStock: true, imageUrl: 'https://placehold.co/100x100.png' },
  'prod_456': { id: 'prod_456', name: 'JavaScript Book', price: 29.99, inStock: true, imageUrl: 'https://placehold.co/100x100.png' },
  'prod_789': { id: 'prod_789', name: 'Mechanical Keyboard', price: 159.99, inStock: false, imageUrl: 'https://placehold.co/100x100.png' }
};

interface Params {
  sessionId: string;
}

function calculateTotals(items: any[]): any {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    discount: 0,
    total: Math.round(total * 100) / 100
  };
}

function generateItemId(): string {
  return `item_${Math.random().toString(36).substring(2, 9)}`;
}

// GET /api/cart/{sessionId} - Get cart contents
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  const cart = carts[sessionId];
  
  if (!cart) {
    // Return empty cart for new sessions
    const emptyCart = {
      sessionId,
      items: [],
      totals: { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    carts[sessionId] = emptyCart;
    return NextResponse.json(emptyCart);
  }

  // Check if cart has expired
  if (new Date() > new Date(cart.expiresAt)) {
    delete carts[sessionId];
    return NextResponse.json(
      { error: 'Cart has expired' },
      { status: 410 }
    );
  }

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
    
    if (!carts[sessionId]) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Apply coupon code
    if (body.couponCode) {
      const validCoupons: { [code: string]: { discount: number; type: 'percentage' | 'fixed' } } = {
        'SAVE10': { discount: 10, type: 'percentage' },
        'FREESHIP': { discount: 9.99, type: 'fixed' }
      };

      const coupon = validCoupons[body.couponCode.toUpperCase()];
      if (!coupon) {
        return NextResponse.json(
          { error: 'Invalid coupon code' },
          { status: 400 }
        );
      }

      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = carts[sessionId].totals.subtotal * (coupon.discount / 100);
      } else {
        discount = coupon.discount;
      }

      carts[sessionId].totals.discount = Math.round(discount * 100) / 100;
      carts[sessionId].totals.total = Math.round((carts[sessionId].totals.subtotal + carts[sessionId].totals.tax + carts[sessionId].totals.shipping - discount) * 100) / 100;
      carts[sessionId].couponCode = body.couponCode;
      carts[sessionId].updatedAt = new Date().toISOString();
    }

    return NextResponse.json(carts[sessionId]);
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
  
  if (!carts[sessionId]) {
    return NextResponse.json(
      { error: 'Cart not found' },
      { status: 404 }
    );
  }

  delete carts[sessionId];
  
  return NextResponse.json({
    message: 'Cart cleared successfully',
    timestamp: new Date().toISOString()
  });
}