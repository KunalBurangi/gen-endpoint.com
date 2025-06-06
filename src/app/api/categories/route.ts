
import { type NextRequest, NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database or CMS
const mockCategories = [
  { id: "cat_1", name: "Technology", slug: "tech", postCount: 25 },
  { id: "cat_2", name: "Design", slug: "design", postCount: 18 },
  { id: "cat_3", name: "Tutorials", slug: "tutorials", postCount: 12 },
  { id: "cat_4", name: "General", slug: "general", postCount: 30 },
];

const mockTags = [
  { name: "javascript", count: 15 },
  { name: "react", count: 12 },
  { name: "api", count: 10 },
  { name: "css", count: 8 },
  { name: "nextjs", count: 7 },
];

// GET /api/categories - List post categories and tags
export async function GET(request: NextRequest) {
  // In a real application, you might calculate postCount dynamically
  // For this mock, we're using predefined counts.
  return NextResponse.json({
    categories: mockCategories,
    tags: mockTags
  });
}
    