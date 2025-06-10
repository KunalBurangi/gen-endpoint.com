
import { type NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct, Product } from '../../../lib/data/products';

// GET /api/products - Retrieve a list of products, with optional filtering
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const inStock = searchParams.get('inStock'); // 'true' or 'false'
  const limitParam = searchParams.get('limit');

  let filteredProducts = getAllProducts();

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (inStock === 'true') {
    filteredProducts = filteredProducts.filter(p => p.stock > 0);
  } else if (inStock === 'false') {
    filteredProducts = filteredProducts.filter(p => p.stock === 0);
  }

  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    if (!isNaN(limit) && limit > 0) {
      filteredProducts = filteredProducts.slice(0, limit);
    }
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
