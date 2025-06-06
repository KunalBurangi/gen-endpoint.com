import { type NextRequest, NextResponse } from 'next/server';

// Mock search data - in a real app, this would be from a database or search engine
const searchableItems = [
  {
    id: "prod_301",
    title: "JavaScript: The Good Parts",
    category: "Books",
    price: 25.99,
    description: "A comprehensive guide to JavaScript programming best practices",
    author: "Douglas Crockford",
    tags: ["javascript", "programming", "web development"],
    rating: 4.5,
    inStock: true,
    createdAt: "2024-08-01T10:00:00Z"
  },
  {
    id: "prod_302",
    title: "React Programming Guide",
    category: "Books",
    price: 35.50,
    description: "Learn modern React development with hooks and context",
    author: "Jane Smith",
    tags: ["react", "javascript", "frontend"],
    rating: 4.7,
    inStock: true,
    createdAt: "2024-08-02T10:00:00Z"
  },
  {
    id: "prod_303",
    title: "Wireless Programming Keyboard",
    category: "Electronics",
    price: 159.99,
    description: "Mechanical keyboard perfect for programming with RGB lighting",
    brand: "TechPro",
    tags: ["keyboard", "mechanical", "programming"],
    rating: 4.3,
    inStock: false,
    createdAt: "2024-08-03T10:00:00Z"
  },
  {
    id: "prod_304",
    title: "Python for Data Science",
    category: "Books",
    price: 42.00,
    description: "Complete guide to Python programming for data analysis",
    author: "Alex Johnson",
    tags: ["python", "data science", "programming"],
    rating: 4.6,
    inStock: true,
    createdAt: "2024-08-04T10:00:00Z"
  },
  {
    id: "prod_305",
    title: "Programming Monitor 27 inch",
    category: "Electronics",
    price: 299.99,
    description: "4K monitor ideal for programming and design work",
    brand: "DisplayMax",
    tags: ["monitor", "4k", "programming"],
    rating: 4.4,
    inStock: true,
    createdAt: "2024-08-05T10:00:00Z"
  },
  {
    id: "course_101",
    title: "Advanced JavaScript Programming",
    category: "Courses",
    price: 89.99,
    description: "Master advanced JavaScript concepts and patterns",
    instructor: "Mike Chen",
    tags: ["javascript", "advanced", "programming"],
    rating: 4.8,
    inStock: true,
    createdAt: "2024-08-06T10:00:00Z"
  },
  {
    id: "course_102",
    title: "React Native Mobile Development",
    category: "Courses",
    price: 129.99,
    description: "Build mobile apps with React Native",
    instructor: "Sarah Wilson",
    tags: ["react native", "mobile", "programming"],
    rating: 4.5,
    inStock: true,
    createdAt: "2024-08-07T10:00:00Z"
  }
];

// Helper function to calculate relevance score
function calculateRelevance(item: any, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  // Title match (highest weight)
  if (item.title.toLowerCase().includes(q)) {
    score += 1.0;
  }

  // Description match
  if (item.description.toLowerCase().includes(q)) {
    score += 0.7;
  }

  // Tags match
  const tagMatches = item.tags.filter((tag: string) => 
    tag.toLowerCase().includes(q)
  ).length;
  score += tagMatches * 0.5;

  // Category match
  if (item.category.toLowerCase().includes(q)) {
    score += 0.3;
  }

  // Author/brand/instructor match
  const authorFields = [item.author, item.brand, item.instructor].filter(Boolean);
  for (const field of authorFields) {
    if (field && field.toLowerCase().includes(q)) {
      score += 0.2;
    }
  }

  return score;
}

// Helper function to apply filters
function applyFilters(items: any[], filters: any): any[] {
  let filtered = [...items];

  if (filters.category) {
    const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
    filtered = filtered.filter(item => 
      categories.some((cat: string) => item.category.toLowerCase() === cat.toLowerCase())
    );
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(item => item.price >= parseFloat(filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(item => item.price <= parseFloat(filters.maxPrice));
  }

  if (filters.inStock !== undefined) {
    filtered = filtered.filter(item => item.inStock === (filters.inStock === 'true'));
  }

  if (filters.minRating !== undefined) {
    filtered = filtered.filter(item => item.rating >= parseFloat(filters.minRating));
  }

  if (filters.tags) {
    const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    filtered = filtered.filter(item =>
      tags.some((tag: string) => 
        item.tags.some((itemTag: string) => 
          itemTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  return filtered;
}

// GET /api/search - Multi-field search with filters and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'relevance';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');
  const minRating = searchParams.get('minRating');
  const tags = searchParams.get('tags');

  let results = [...searchableItems];

  // Apply text search if query provided
  let resultsWithScore: any[] = [];
  if (query) {
    resultsWithScore = results
      .map(item => ({
        ...item,
        relevanceScore: calculateRelevance(item, query)
      }))
      .filter(item => item.relevanceScore > 0);
  } else {
    resultsWithScore = results.map(item => ({ ...item, relevanceScore: 0 }));
  }

  // Apply filters
  const filters = {
    category,
    minPrice,
    maxPrice,
    inStock,
    minRating,
    tags
  };
  resultsWithScore = applyFilters(resultsWithScore, filters);

  // Sort results
  resultsWithScore.sort((a, b) => {
    let aVal: any, bVal: any;

    switch (sort) {
      case 'price':
        aVal = a.price;
        bVal = b.price;
        break;
      case 'rating':
        aVal = a.rating;
        bVal = b.rating;
        break;
      case 'date':
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'relevance':
      default:
        aVal = a.relevanceScore;
        bVal = b.relevanceScore;
        break;
    }

    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = resultsWithScore.slice(startIndex, endIndex);

  // Remove relevanceScore from final results if not sorting by relevance
  const cleanResults = paginatedResults.map(({ relevanceScore, ...item }) => {
    if (sort === 'relevance' && query) {
      return { ...item, relevanceScore };
    }
    return item;
  });

  // Generate filter options for frontend
  const availableCategories = [...new Set(searchableItems.map(item => item.category))];
  const priceRange = {
    min: Math.min(...searchableItems.map(item => item.price)),
    max: Math.max(...searchableItems.map(item => item.price))
  };

  const response = {
    results: cleanResults,
    pagination: {
      page,
      limit,
      total: resultsWithScore.length,
      pages: Math.ceil(resultsWithScore.length / limit),
      hasNext: endIndex < resultsWithScore.length,
      hasPrev: page > 1
    },
    filters: {
      categories: availableCategories,
      priceRange
    },
    meta: {
      query,
      totalResults: resultsWithScore.length,
      searchTime: Math.random() * 100 + 10 // Mock search time in ms
    }
  };

  return NextResponse.json(response);
}