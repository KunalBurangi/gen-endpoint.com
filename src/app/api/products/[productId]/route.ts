
import { type NextRequest, NextResponse } from 'next/server';

// Mock data store - ideally share this with /api/products/route.ts or use a DB
// For simplicity in this mock, we are re-referencing 'products' which is not ideal.
// In a real app, this data would come from a shared service or database.
// Let's assume 'products' is accessible here for the mock.
// This is a simplified version. In a real app, you'd import products or a service.
let products = [
  {
    id: "prod_123",
    name: "The Pragmatic Programmer",
    category: "Books",
    price: 29.99,
    stock: 150,
    imageUrl: "https://placehold.co/300x200.png",
    description: "From journeyman to master.",
    details: {"pages": 352, "author": "David Thomas, Andrew Hunt"},
    reviews: [{"rating": 5, "comment": "A must-read!"}]
  },
  {
    id: "prod_456",
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    price: 199.99,
    stock: 75,
    imageUrl: "https://placehold.co/300x200.png",
    description: "Immersive sound experience.",
    details: {"color": "Black", "connectivity": "Bluetooth 5.0"},
    reviews: [{"rating": 4, "comment": "Great sound, a bit pricey."}]
  },
  {
    id: "prod_789",
    name: "Ergonomic Mechanical Keyboard",
    category: "Electronics",
    "price": 159.99,
    "stock": 50,
    imageUrl: "https://placehold.co/300x200.png",
    description: "Clicky and comfortable.",
    details: {"switchType": "Cherry MX Brown", "layout": "Tenkeyless"},
    reviews: []
  }
];

interface Params {
  productId: string;
}

// GET /api/products/{productId} - Retrieve a specific product
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { productId } = params;
  const product = products.find(p => p.id === productId);
  if (product) {
    return NextResponse.json(product);
  }
  return NextResponse.json({ error: "Product not found" }, { status: 404 });
}

// Note: PUT and DELETE for specific products would go here as well in a full implementation.

