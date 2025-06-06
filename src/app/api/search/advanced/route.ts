import { type NextRequest, NextResponse } from 'next/server';

// Mock search data with more detailed fields for advanced searching
const searchableItems = [
  {
    id: "prod_301",
    title: "JavaScript: The Good Parts",
    category: "Books",
    subcategory: "Programming",
    price: 25.99,
    description: "A comprehensive guide to JavaScript programming best practices",
    author: "Douglas Crockford",
    publisher: "O'Reilly Media",
    tags: ["javascript", "programming", "web development"],
    rating: 4.5,
    reviewCount: 234,
    inStock: true,
    stockCount: 45,
    publishedDate: "2008-05-01",
    pages: 176,
    language: "English",
    format: "Paperback",
    createdAt: "2024-08-01T10:00:00Z"
  },
  {
    id: "prod_302",
    title: "React Programming Guide",
    category: "Books",
    subcategory: "Programming",
    price: 35.50,
    description: "Learn modern React development with hooks and context",
    author: "Jane Smith",
    publisher: "Tech Publications",
    tags: ["react", "javascript", "frontend"],
    rating: 4.7,
    reviewCount: 189,
    inStock: true,
    stockCount: 23,
    publishedDate: "2023-03-15",
    pages: 342,
    language: "English",
    format: "Hardcover",
    createdAt: "2024-08-02T10:00:00Z"
  },
  {
    id: "prod_303",
    title: "Wireless Programming Keyboard",
    category: "Electronics",
    subcategory: "Keyboards",
    price: 159.99,
    description: "Mechanical keyboard perfect for programming with RGB lighting",
    brand: "TechPro",
    manufacturer: "TechPro Industries",
    tags: ["keyboard", "mechanical", "programming", "rgb"],
    rating: 4.3,
    reviewCount: 567,
    inStock: false,
    stockCount: 0,
    warranty: "2 years",
    color: "Black",
    connectivity: "Wireless",
    createdAt: "2024-08-03T10:00:00Z"
  },
  {
    id: "course_101",
    title: "Advanced JavaScript Programming",
    category: "Courses",
    subcategory: "Programming",
    price: 89.99,
    description: "Master advanced JavaScript concepts and patterns",
    instructor: "Mike Chen",
    platform: "LearnCode",
    tags: ["javascript", "advanced", "programming"],
    rating: 4.8,
    reviewCount: 1234,
    inStock: true,
    duration: "12 hours",
    level: "Advanced",
    language: "English",
    certificateOffered: true,
    createdAt: "2024-08-06T10:00:00Z"
  }
];

// POST /api/search/advanced - Complex search with nested filters and aggregations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, aggregations, sort, pagination } = body;

    let results = [...searchableItems];

    // Apply text search
    if (query && query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(item => {
        const searchableText = [
          item.title,
          item.description,
          item.author || item.brand || item.instructor,
          ...item.tags
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchText);
      });
    }

    // Apply complex filters
    if (filters) {
      // Category filters
      if (filters.category && filters.category.length > 0) {
        results = results.filter(item => 
          filters.category.includes(item.category)
        );
      }

      // Price range filter
      if (filters.price) {
        if (filters.price.min !== undefined) {
          results = results.filter(item => item.price >= filters.price.min);
        }
        if (filters.price.max !== undefined) {
          results = results.filter(item => item.price <= filters.price.max);
        }
      }

      // Rating filter
      if (filters.rating) {
        if (filters.rating.gte !== undefined) {
          results = results.filter(item => item.rating >= filters.rating.gte);
        }
        if (filters.rating.lte !== undefined) {
          results = results.filter(item => item.rating <= filters.rating.lte);
        }
      }

      // Stock filter
      if (filters.inStock !== undefined) {
        results = results.filter(item => item.inStock === filters.inStock);
      }

      // Date range filter
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          results = results.filter(item => 
            new Date(item.createdAt) >= new Date(filters.dateRange.start)
          );
        }
        if (filters.dateRange.end) {
          results = results.filter(item => 
            new Date(item.createdAt) <= new Date(filters.dateRange.end)
          );
        }
      }

      // Tags filter (any of the specified tags)
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(item =>
          filters.tags.some((tag: string) =>
            item.tags.some((itemTag: string) =>
              itemTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }

      // Language filter
      if (filters.language && filters.language.length > 0) {
        results = results.filter(item =>
          item.language && filters.language.includes(item.language)
        );
      }
    }

    // Apply sorting
    if (sort && sort.field) {
      results.sort((a: any, b: any) => {
        let aVal = a[sort.field];
        let bVal = b[sort.field];

        // Handle nested fields
        if (sort.field.includes('.')) {
          const fields = sort.field.split('.');
          aVal = fields.reduce((obj: any, field: string) => obj?.[field], a);
          bVal = fields.reduce((obj: any, field: string) => obj?.[field], b);
        }

        // Handle different data types
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sort.order === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    // Calculate aggregations
    const aggregationResults: any = {};
    
    if (aggregations && aggregations.length > 0) {
      for (const agg of aggregations) {
        switch (agg) {
          case 'category':
            aggregationResults.category = results.reduce((acc: any, item) => {
              acc[item.category] = (acc[item.category] || 0) + 1;
              return acc;
            }, {});
            break;

          case 'price_range':
            const priceRanges = {
              '0-25': 0,
              '25-50': 0,
              '50-100': 0,
              '100-200': 0,
              '200+': 0
            };
            results.forEach(item => {
              if (item.price < 25) priceRanges['0-25']++;
              else if (item.price < 50) priceRanges['25-50']++;
              else if (item.price < 100) priceRanges['50-100']++;
              else if (item.price < 200) priceRanges['100-200']++;
              else priceRanges['200+']++;
            });
            aggregationResults.price_range = priceRanges;
            break;

          case 'rating':
            aggregationResults.rating = {
              average: results.reduce((sum, item) => sum + item.rating, 0) / results.length,
              distribution: results.reduce((acc: any, item) => {
                const rating = Math.floor(item.rating);
                acc[rating] = (acc[rating] || 0) + 1;
                return acc;
              }, {})
            };
            break;

          case 'tags':
            const tagCounts: any = {};
            results.forEach(item => {
              item.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            });
            // Return top 10 tags
            aggregationResults.tags = Object.entries(tagCounts)
              .sort(([,a]: any, [,b]: any) => b - a)
              .slice(0, 10)
              .reduce((acc: any, [tag, count]) => {
                acc[tag] = count;
                return acc;
              }, {});
            break;

          case 'author':
            aggregationResults.author = results.reduce((acc: any, item) => {
              const author = item.author || item.instructor || item.brand;
              if (author) {
                acc[author] = (acc[author] || 0) + 1;
              }
              return acc;
            }, {});
            break;

          case 'stock_status':
            aggregationResults.stock_status = {
              in_stock: results.filter(item => item.inStock).length,
              out_of_stock: results.filter(item => !item.inStock).length
            };
            break;
        }
      }
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    const response = {
      results: paginatedResults,
      aggregations: aggregationResults,
      pagination: {
        page,
        limit,
        total: results.length,
        pages: Math.ceil(results.length / limit),
        hasNext: endIndex < results.length,
        hasPrev: page > 1
      },
      meta: {
        totalResults: results.length,
        searchTime: Math.random() * 50 + 20, // Mock search time
        query: query?.text || '',
        filtersApplied: Object.keys(filters || {}).length
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body or search error' },
      { status: 400 }
    );
  }
}