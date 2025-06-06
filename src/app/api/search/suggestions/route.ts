import { type NextRequest, NextResponse } from 'next/server';

// Mock suggestion data
const searchTerms = [
  'programming', 'programs', 'progress', 'progressive', 'programmer',
  'javascript', 'java', 'python', 'react', 'nextjs', 'typescript',
  'database', 'api', 'web development', 'mobile app', 'frontend',
  'backend', 'fullstack', 'devops', 'cloud', 'aws', 'docker',
  'kubernetes', 'machine learning', 'ai', 'artificial intelligence',
  'data science', 'analytics', 'blockchain', 'cryptocurrency',
  'books', 'courses', 'tutorials', 'documentation', 'guides',
  'electronics', 'software', 'hardware', 'tools', 'frameworks',
  'libraries', 'packages', 'modules', 'components', 'services'
];

const categories = [
  'Books', 'Courses', 'Electronics', 'Software', 'Tools',
  'Frameworks', 'Languages', 'Databases', 'Cloud Services',
  'Development Tools', 'Mobile', 'Web', 'AI/ML', 'Data Science'
];

// GET /api/search/suggestions - Get search suggestions and autocomplete results
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  if (!query) {
    return NextResponse.json({
      suggestions: [],
      categories: categories.slice(0, limit),
      message: 'Provide a query parameter "q" to get suggestions'
    });
  }

  const queryLower = query.toLowerCase();
  
  // Find matching suggestions
  const suggestions = searchTerms
    .filter(term => term.toLowerCase().includes(queryLower))
    .slice(0, limit);

  // Find matching categories
  const matchingCategories = categories
    .filter(cat => cat.toLowerCase().includes(queryLower))
    .slice(0, Math.min(3, limit));

  // Add some popular suggestions if we don't have enough matches
  if (suggestions.length < limit) {
    const popular = ['javascript', 'python', 'react', 'programming', 'web development'];
    const additional = popular
      .filter(term => !suggestions.includes(term))
      .slice(0, limit - suggestions.length);
    suggestions.push(...additional);
  }

  return NextResponse.json({
    suggestions: suggestions.slice(0, limit),
    categories: matchingCategories,
    query,
    total: suggestions.length
  });
}