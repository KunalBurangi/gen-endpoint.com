
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
    price: 159.99,
    stock: 0, // Example of out of stock
    imageUrl: "https://placehold.co/300x200.png",
    description: "Clicky and comfortable.",
    details: {"switchType": "Cherry MX Brown", "layout": "Tenkeyless"},
    reviews: []
  },
  {
    id: "prod_101",
    name: "Organic Whole Bean Coffee",
    category: "Groceries",
    price: 15.99,
    stock: 200,
    imageUrl: "https://placehold.co/300x200.png",
    description: "Rich and aromatic dark roast.",
    details: {"origin": "Colombia", "roast": "Dark"},
    reviews: [{"rating": 5, "comment": "Best coffee I've had!"}]
  },
  {id: "prod_102", name: "Artisan Sourdough Bread", category: "Groceries", price: 7.50, stock: 30, imageUrl: "https://placehold.co/300x200.png", description: "Freshly baked daily.", details: {"ingredients": "Flour, water, salt, starter"}},
  {id: "prod_103", name: "Gourmet Olive Oil", category: "Groceries", price: 22.00, stock: 50, imageUrl: "https://placehold.co/300x200.png", description: "Extra virgin, cold-pressed.", details: {"origin": "Italy", "volume": "500ml"}},
  {id: "prod_104", name: "Fair Trade Chocolate Bar", category: "Groceries", price: 4.99, stock: 120, imageUrl: "https://placehold.co/300x200.png", description: "70% dark chocolate.", details: {"cocoaPercentage": "70%", "origin": "Ecuador"}},
  {id: "prod_105", name: "Herbal Tea Selection", category: "Groceries", price: 12.99, stock: 80, imageUrl: "https://placehold.co/300x200.png", description: "Assorted calming herbal teas.", details: {"types": ["Chamomile", "Peppermint", "Lavender"], "count": 20}},
  {id: "prod_201", name: "Smart LED Lightbulb", category: "Electronics", price: 19.99, stock: 150, imageUrl: "https://placehold.co/300x200.png", description: "Controllable via app, RGB colors.", details: {"wattage": "9W", "lumens": "800lm"}},
  {id: "prod_202", name: "Portable Bluetooth Speaker", category: "Electronics", price: 49.99, stock: 60, imageUrl: "https://placehold.co/300x200.png", description: "Water-resistant, 10-hour battery.", details: {"connectivity": "Bluetooth 5.1", "waterResistance": "IPX7"}},
  {id: "prod_203", name: "USB-C Hub Adapter", category: "Electronics", price: 35.50, stock: 90, imageUrl: "https://placehold.co/300x200.png", description: "7-in-1 adapter with HDMI, USB 3.0.", details: {"ports": ["HDMI", "USB-A x3", "SD Card", "MicroSD Card", "USB-C PD"]}},
  {id: "prod_204", name: "Webcam with Microphone", category: "Electronics", price: 65.00, stock: 40, imageUrl: "https://placehold.co/300x200.png", description: "1080p HD video, noise-cancelling mic.", details: {"resolution": "1920x1080", "focusType": "Autofocus"}},
  {id: "prod_301", name: "Clean Code", category: "Books", price: 35.99, stock: 100, imageUrl: "https://placehold.co/300x200.png", description: "A Handbook of Agile Software Craftsmanship.", details: {"author": "Robert C. Martin", "pages": 464}},
  {id: "prod_302", name: "Designing Data-Intensive Applications", category: "Books", price: 45.50, stock: 70, imageUrl: "https://placehold.co/300x200.png", description: "The Big Ideas Behind Reliable, Scalable, and Maintainable Systems.", details: {"author": "Martin Kleppmann", "pages": 616}},
  {id: "prod_303", name: "The Phoenix Project", category: "Books", price: 24.99, stock: 120, imageUrl: "https://placehold.co/300x200.png", description: "A Novel About IT, DevOps, and Helping Your Business Win.", details: {"author": "Gene Kim, Kevin Behr, George Spafford", "pages": 448}},
  {id: "prod_304", name: "Sapiens: A Brief History of Humankind", category: "Books", price: 18.75, stock: 150, imageUrl: "https://placehold.co/300x200.png", description: "Exploring the history of our species.", details: {"author": "Yuval Noah Harari", "pages": 464}},
  {id: "prod_401", name: "Yoga Mat", category: "Sports", price: 29.99, stock: 90, imageUrl: "https://placehold.co/300x200.png", description: "Non-slip, eco-friendly material.", details: {"thickness": "6mm", "material": "TPE"}},
  {id: "prod_402", name: "Adjustable Dumbbells Set", category: "Sports", price: 149.99, stock: 30, imageUrl: "https://placehold.co/300x200.png", description: "Up to 50 lbs, space-saving design.", details: {"weightRange": "5-50 lbs", "increments": "2.5 lbs"}},
  {id: "prod_403", name: "Resistance Bands Set", category: "Sports", price: 15.99, stock: 200, imageUrl: "https://placehold.co/300x200.png", description: "5 levels of resistance for various workouts.", details: {"levels": "X-Light to X-Heavy", "material": "Latex"}},
  {id: "prod_404", name: "Running Shoes", category: "Sports", price: 120.00, stock: 60, imageUrl: "https://placehold.co/300x200.png", description: "Lightweight and breathable for optimal performance.", details: {"brand": "RunFast", "type": "Neutral"}},
  {id: "prod_501", name: "Stainless Steel Water Bottle", category: "Lifestyle", price: 22.50, stock: 110, imageUrl: "https://placehold.co/300x200.png", description: "Insulated, keeps drinks cold for 24h or hot for 12h.", details: {"capacity": "750ml", "material": "Stainless Steel"}},
  {id: "prod_502", name: "Indoor Plant - Snake Plant", category: "Lifestyle", price: 18.00, stock: 50, imageUrl: "https://placehold.co/300x200.png", description: "Low maintenance, air purifying plant.", details: {"type": "Sansevieria", "potIncluded": true}},
  {id: "prod_503", name: "Desk Organizer Set", category: "Lifestyle", price: 25.99, stock: 70, imageUrl: "https://placehold.co/300x200.png", description: "Keeps your workspace tidy and efficient.", details: {"pieces": 5, "material": "Bamboo"}},
  {id: "prod_504", name: "Essential Oil Diffuser", category: "Lifestyle", price: 32.00, stock: 40, imageUrl: "https://placehold.co/300x200.png", description: "Ultrasonic, with mood lighting.", details: {"capacity": "300ml", "runtime": "6-8 hours"}},
  {id: "prod_505", name: "Travel Neck Pillow", category: "Lifestyle", price: 19.99, stock: 100, imageUrl: "https://placehold.co/300x200.png", description: "Memory foam for comfortable travel.", details: {"material": "Memory Foam", "cover": "Washable Velour"}}
];

// GET /api/products - Retrieve a list of products, with optional filtering
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const inStock = searchParams.get('inStock'); // 'true' or 'false'
  const limitParam = searchParams.get('limit');

  let filteredProducts = [...products]; // Start with a copy

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
