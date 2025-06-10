import { getProductById, Product } from './products'; // To fetch product details

export interface CartItem {
  id: string; // Unique ID for the cart item itself
  productId: string;
  name: string; // Denormalized from product
  priceAtTimeOfAddition: number;
  quantity: number;
  imageUrl?: string; // Denormalized from product
  options?: Record<string, any>; // e.g., { color: 'Red', size: 'M' }
  subtotal: number;
}

export interface Cart {
  id: string; // Session ID
  userId?: string; // Optional: if the cart is associated with a logged-in user
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

const carts: Map<string, Cart> = new Map();

const MOCK_PRODUCTS_STORE: Record<string, Product> = {}; // For items not in main products.ts

// Helper to generate unique cart item IDs
function generateCartItemId(): string {
  return `item_${Math.random().toString(36).substring(2, 11)}`;
}

// Private helper to calculate totals
function _calculateCartTotals(cart: Cart): void {
  cart.subtotal = 0;
  for (const item of cart.items) {
    item.subtotal = item.priceAtTimeOfAddition * item.quantity;
    cart.subtotal += item.subtotal;
  }

  // Example tax and shipping logic (can be more complex)
  cart.tax = cart.subtotal * 0.08; // 8% tax
  cart.shipping = cart.subtotal > 50 ? 0 : 9.99; // Free shipping over $50

  let totalBeforeDiscount = cart.subtotal + cart.tax + cart.shipping;

  // Apply discount if a coupon is active
  if (cart.couponCode) {
      // This logic would ideally be more robust, potentially checking coupon validity
      if (cart.couponCode === 'SAVE10') {
          cart.discount = totalBeforeDiscount * 0.10;
      } else if (cart.couponCode === 'FREESHIP') {
          cart.discount = cart.shipping; // Discount equals shipping cost
      } else {
          cart.discount = 0; // Invalid or no recognized coupon
      }
  } else {
      cart.discount = 0;
  }

  cart.total = totalBeforeDiscount - cart.discount;

  // Round all currency values to 2 decimal places
  cart.subtotal = parseFloat(cart.subtotal.toFixed(2));
  cart.tax = parseFloat(cart.tax.toFixed(2));
  cart.shipping = parseFloat(cart.shipping.toFixed(2));
  cart.discount = parseFloat(cart.discount.toFixed(2));
  cart.total = parseFloat(cart.total.toFixed(2));
  cart.updatedAt = new Date().toISOString();
}

export function createCart(sessionId: string, userId?: string): Cart {
  const now = new Date();
  const newCart: Cart = {
    id: sessionId,
    userId,
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24-hour expiry
  };
  carts.set(sessionId, newCart);
  return newCart;
}

export function getCart(sessionId: string): Cart {
  let cart = carts.get(sessionId);
  if (cart) {
    if (new Date() > new Date(cart.expiresAt)) {
      carts.delete(sessionId);
      cart = createCart(sessionId, cart.userId); // Recreate expired cart
    }
  } else {
    cart = createCart(sessionId);
  }
  return cart;
}

export function addItemToCart(
  sessionId: string,
  productId: string,
  quantity: number,
  options?: Record<string, any>
): Cart | undefined {
  const cart = getCart(sessionId); // Ensures cart exists or creates a new one
  const product = getProductById(productId);

  if (!product) {
    // Fallback for products not in the main store, e.g. dynamically added ones
    // This part is tricky without a full product management system for such items.
    // For now, we'll assume if it's not in products.ts, it's an error unless handled differently.
    return undefined; // Product not found
  }

  if (!product.stock || product.stock < quantity) {
    throw new Error("Not enough stock");
  }

  const existingItemIndex = cart.items.findIndex(
    item => item.productId === productId && JSON.stringify(item.options) === JSON.stringify(options || {})
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
    if (cart.items[existingItemIndex].quantity <= 0) {
        cart.items.splice(existingItemIndex, 1); // Remove if quantity is 0 or less
    } else {
       cart.items[existingItemIndex].priceAtTimeOfAddition = product.price; // Update price in case it changed
    }
  } else {
    if (quantity <= 0) throw new Error("Quantity must be positive for new items.");
    const newItem: CartItem = {
      id: generateCartItemId(),
      productId,
      name: product.name,
      priceAtTimeOfAddition: product.price,
      quantity,
      imageUrl: product.imageUrl,
      options: options || {},
      subtotal: 0, // Will be calculated
    };
    cart.items.push(newItem);
  }

  _calculateCartTotals(cart);
  carts.set(sessionId, cart);
  return cart;
}

// Updates based on CartItem ID
export function updateItemInCart(sessionId: string, itemId: string, newQuantity: number): Cart | undefined {
  const cart = getCart(sessionId);
  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return undefined; // Item not found
  }

  if (newQuantity <= 0) {
    cart.items.splice(itemIndex, 1); // Remove item if quantity is 0 or less
  } else {
    const product = getProductById(cart.items[itemIndex].productId);
    if (!product || !product.stock || product.stock < newQuantity) {
      throw new Error("Not enough stock or product changed");
    }
    cart.items[itemIndex].quantity = newQuantity;
    cart.items[itemIndex].priceAtTimeOfAddition = product.price; // Re-fetch price in case it changed
  }

  _calculateCartTotals(cart);
  carts.set(sessionId, cart);
  return cart;
}

// Removes based on CartItem ID
export function removeItemFromCart(sessionId: string, itemId: string): Cart | undefined {
  const cart = getCart(sessionId);
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(item => item.id !== itemId);

  if (cart.items.length === initialLength) {
    return undefined; // Item not found
  }

  _calculateCartTotals(cart);
  carts.set(sessionId, cart);
  return cart;
}

export function clearCart(sessionId: string): Cart | undefined {
  const cart = getCart(sessionId);
  cart.items = [];
  cart.couponCode = undefined; // Clear coupon on cart clear
  cart.discount = 0;
  _calculateCartTotals(cart); // Recalculates totals which will be zero for items
  carts.set(sessionId, cart);
  return cart;
}

export function deleteCart(sessionId: string): boolean {
  return carts.delete(sessionId);
}

export function applyCouponToCart(sessionId: string, couponCode: string): Cart | undefined {
    const cart = getCart(sessionId);
    // Simplified coupon validation
    const validCoupons: Record<string, { discount: number; type: 'percentage' | 'fixedValue' | 'freeShipping' }> = {
        'SAVE10': { discount: 10, type: 'percentage' },
        'TAKE5': { discount: 5, type: 'fixedValue' },
        'FREESHIP': { discount: cart.shipping, type: 'freeShipping' } // Dynamic discount based on current shipping
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon) {
        cart.couponCode = couponCode.toUpperCase();
        // Discount calculation will happen in _calculateCartTotals
    } else {
        cart.couponCode = undefined; // Invalid coupon
        cart.discount = 0;
    }

    _calculateCartTotals(cart); // Recalculate with new coupon status
    carts.set(sessionId, cart);
    return cart;
}

// For testing or admin purposes
export function getAllCarts(): Cart[] {
  return Array.from(carts.values());
}

export function _resetCartsForTesting(): void {
  carts.clear();
}
