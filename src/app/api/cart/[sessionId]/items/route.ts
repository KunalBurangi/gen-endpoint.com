import { type NextRequest, NextResponse } from 'next/server';

// Mock cart storage - shared with parent cart endpoint
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
      }
    ],
    totals: { subtotal: 199.98, tax: 16.00, shipping: 0, discount: 0, total: 215.98 },
    createdAt: '2024-08-16T12:00:00Z',
    updatedAt: '2024-08-16T12:00:00Z',
    expiresAt: '2024-08-17T12:00:00Z'
  }
};

// Mock product data
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
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 9.99;
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

function initializeCart(sessionId: string): any {
  const newCart = {
    sessionId,
    items: [],
    totals: { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  carts[sessionId] = newCart;
  return newCart;
}

// POST /api/cart/{sessionId}/items - Add item to cart
export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  try {
    const body = await request.json();
    const { productId, quantity = 1, options = {} } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = products[productId];
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.inStock) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || quantity > 10) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Initialize cart if it doesn't exist
    if (!carts[sessionId]) {
      initializeCart(sessionId);
    }

    const cart = carts[sessionId];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item: any) => 
      item.productId === productId && 
      JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > 10) {
        return NextResponse.json(
          { error: 'Cannot add more than 10 of the same item' },
          { status: 400 }
        );
      }

      existingItem.quantity = newQuantity;
      existingItem.subtotal = Math.round(existingItem.price * newQuantity * 100) / 100;
    } else {
      // Add new item to cart
      const newItem = {
        id: generateItemId(),
        productId,
        name: product.name,
        price: product.price,
        quantity,
        options,
        imageUrl: product.imageUrl,
        subtotal: Math.round(product.price * quantity * 100) / 100,
        addedAt: new Date().toISOString()
      };
      cart.items.push(newItem);
    }

    // Recalculate totals
    cart.totals = calculateTotals(cart.items);
    cart.updatedAt = new Date().toISOString();

    const addedItem = existingItemIndex >= 0 ? cart.items[existingItemIndex] : cart.items[cart.items.length - 1];

    return NextResponse.json({
      success: true,
      item: addedItem,
      cartTotal: cart.totals.total,
      itemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// GET /api/cart/{sessionId}/items - List cart items
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  
  const cart = carts[sessionId];
  
  if (!cart) {
    return NextResponse.json({
      items: [],
      itemCount: 0,
      total: 0
    });
  }

  return NextResponse.json({
    items: cart.items,
    itemCount: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    totals: cart.totals
  });
}