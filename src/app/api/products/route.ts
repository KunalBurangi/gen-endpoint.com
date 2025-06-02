
import { type NextRequest, NextResponse } from 'next/server';

// Mock data store for products
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
    "stock": 0, // Example of out of stock
    imageUrl: "https://placehold.co/300x200.png",
    description: "Clicky and comfortable.",
    details: {"switchType": "Cherry MX Brown", "layout": "Tenkeyless"},
    reviews: []
  }
];

// GET /api/products - Retrieve a list of products, with optional filtering
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const inStock = searchParams.get('inStock'); // 'true' or 'false'

  let filteredProducts = products;

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (inStock === 'true') {
    filteredProducts = filteredProducts.filter(p => p.stock > 0);
  } else if (inStock === 'false') {
    filteredProducts = filteredProducts.filter(p => p.stock === 0);
  }

  return NextResponse.json(filteredProducts);
}

// POST /api/products - Add a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProduct = {
      id: `prod_${Math.random().toString(36).substring(2, 9)}`,
      name: body.name,
      category: body.category,
      price: body.price,
      stock: body.stock,
      imageUrl: body.imageUrl || "https://placehold.co/300x200.png",
      description: body.description,
      details: body.details || {},
      reviews: body.reviews || [],
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error creating product." }, { status: 400 });
  }
}

