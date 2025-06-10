export interface ProductReview {
  rating: number;
  comment: string;
}

export interface ProductDetails {
  [key: string]: any; // Allow arbitrary details
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  details?: ProductDetails;
  reviews?: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
}

// Initialize an in-memory array with mock data
let products: Product[] = [
  {
    id: "prod_123",
    name: "The Pragmatic Programmer",
    category: "Books",
    price: 29.99,
    stock: 150,
    imageUrl: "https://placehold.co/300x200.png",
    description: "From journeyman to master.",
    details: {"pages": 352, "author": "David Thomas, Andrew Hunt"},
    reviews: [{"rating": 5, "comment": "A must-read!"}],
    createdAt: "2024-01-10T10:00:00Z"
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
    reviews: [{"rating": 4, "comment": "Great sound, a bit pricey."}],
    createdAt: "2024-01-11T11:00:00Z"
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
    reviews: [],
    createdAt: "2024-01-12T12:00:00Z"
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
    reviews: [{"rating": 5, "comment": "Best coffee I've had!"}],
    createdAt: "2024-01-13T13:00:00Z"
  },
  // Add a few more for variety
  {
    id: "prod_201",
    name: "Smart LED Lightbulb",
    category: "Electronics",
    price: 19.99,
    stock: 150,
    imageUrl: "https://placehold.co/300x200.png",
    description: "Controllable via app, RGB colors.",
    details: {"wattage": "9W", "lumens": "800lm"},
    createdAt: "2024-01-14T14:00:00Z"
  }
];

// Function to generate a unique ID
function generateProductId(): string {
  return `prod_${Math.random().toString(36).substring(2, 9)}`;
}

// Exported functions

export function getAllProducts(): Product[] {
  return [...products]; // Return a copy
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const newProduct: Product = {
    ...productData,
    id: generateProductId(),
    imageUrl: productData.imageUrl || "https://placehold.co/300x200.png",
    details: productData.details || {},
    reviews: productData.reviews || [],
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | undefined {
  const productIndex = products.findIndex(product => product.id === id);
  if (productIndex === -1) {
    return undefined;
  }
  const updatedProduct: Product = {
    ...products[productIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  products[productIndex] = updatedProduct;
  return updatedProduct;
}

export function deleteProduct(id: string): boolean {
  const productIndex = products.findIndex(product => product.id === id);
  if (productIndex === -1) {
    return false;
  }
  products.splice(productIndex, 1);
  return true;
}
