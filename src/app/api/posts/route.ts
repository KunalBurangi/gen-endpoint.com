
import { type NextRequest, NextResponse } from 'next/server';

// Mock data for blog posts (in a real app, this would come from a database or CMS)
const mockPosts = [
  {
    id: "post_123",
    title: "Getting Started with JavaScript",
    slug: "getting-started-javascript",
    excerpt: "Learn the basics of JavaScript programming...",
    content: "# Getting Started with JavaScript - A versatile programming language used for web development. This post covers the fundamentals.",
    author: { id: "usr_1", name: "Alice Wonderland" },
    publishedAt: "2024-08-15T10:00:00Z",
    readTime: "5 min",
    category: "tech",
    tags: ["javascript", "beginner", "webdev"],
    status: "published",
    views: 1250,
    likes: 89,
    seo: { metaDescription: "Learn the basics of JavaScript programming", keywords: ["javascript", "programming", "basics"] }
  },
  {
    id: "post_124",
    title: "Advanced React Patterns",
    slug: "advanced-react-patterns",
    excerpt: "Explore advanced patterns in React development.",
    content: "# Advanced React Patterns - In this post we explore advanced React development patterns including render props, compound components, and custom hooks.",
    author: { id: "usr_2", name: "Bob The Builder" },
    publishedAt: "2024-08-18T14:00:00Z",
    readTime: "10 min",
    category: "tech",
    tags: ["react", "javascript", "frontend", "advanced"],
    status: "published",
    views: 980,
    likes: 120,
    seo: { metaDescription: "Learn advanced React patterns for scalable applications", keywords: ["react", "patterns", "advanced"] }
  },
  {
    id: "post_125",
    title: "Understanding APIs",
    slug: "understanding-apis",
    excerpt: "A beginner's guide to understanding REST APIs.",
    content: "What are APIs? How do they work? This post explains it all.",
    author: { id: "usr_1", name: "Alice Wonderland" },
    publishedAt: "2024-07-20T10:00:00Z",
    readTime: "7 min",
    category: "general",
    tags: ["api", "basics", "tutorial"],
    status: "published",
    views: 2500,
    likes: 200,
    seo: { metaDescription: "A simple guide to APIs.", keywords: ["api", "rest", "web services"] }
  }
];

const mockCategories = [
  { id: "cat_1", name: "Technology", slug: "tech", postCount: 2 },
  { id: "cat_2", name: "Design", slug: "design", postCount: 0 },
  { id: "cat_3", name: "General", slug: "general", postCount: 1 }
];

const mockTags = [
  { name: "javascript", count: 2 },
  { name: "react", count: 1 },
  { name: "api", count: 1 },
  { name: "beginner", count: 1 },
];


// GET /api/posts - List blog posts with filtering and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  let filteredPosts = [...mockPosts];

  if (status) {
    filteredPosts = filteredPosts.filter(post => post.status === status);
  }
  if (categorySlug) {
    filteredPosts = filteredPosts.filter(post => post.category === categorySlug);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  const totalPosts = filteredPosts.length;
  const paginatedPosts = filteredPosts.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    posts: paginatedPosts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      author: p.author,
      publishedAt: p.publishedAt,
      readTime: p.readTime,
      category: p.category,
      tags: p.tags
    })),
    pagination: {
      page,
      limit,
      total: totalPosts,
      pages: Math.ceil(totalPosts / limit)
    }
  });
}

// POST /api/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, categoryId, tags, seo } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newPost = {
      id: `post_${Math.random().toString(36).substring(2, 9)}`,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      author: { id: "usr_mock", name: "Mock User" }, // In a real app, get authenticated user
      publishedAt: null, // Or new Date().toISOString() if published immediately
      readTime: Math.ceil(content.split(/\s+/).length / 200) + " min", // Approximate read time
      category: categoryId || "general", // Default category
      tags: tags || [],
      status: "draft", // Default status
      views: 0,
      likes: 0,
      seo: seo || { metaDescription: excerpt || title, keywords: tags || [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPosts.push(newPost); // Add to mock data store

    return NextResponse.json({
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      status: newPost.status,
      createdAt: newPost.createdAt
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or error creating post" }, { status: 400 });
  }
}

// GET /api/posts/{slug} - This would typically be in a [slug]/route.ts or similar
// For simplicity, if your API definition implied this under /api/posts, you might handle it
// with query params or reconsider the route structure.
// The provided data/apis.ts has /api/posts/{slug} so we will add a basic handler for it
// Note: This is a simplified way for a flat /api/posts route.
// Ideally /api/posts/[slug]/route.ts would be a separate file.
// This is a common way to handle GET by slug or ID on the same base path IF NOT using Next.js dynamic segments for API.
// However, for Next.js APIs, the standard is different files for different dynamic segments.
// For the purpose of matching the existing apis.ts, and assuming the user wants to test
// /api/posts/some-slug directly, we will add a check for a 'slug' query parameter.
// A more robust solution is a separate dynamic route.
// To actually support `/api/posts/some-slug`, you'd need `src/app/api/posts/[slug]/route.ts`.
// The current GET handles `/api/posts?slug=some-slug`.
// The `data/apis.ts` defines `GET /api/posts/{slug}` for the blog.
// Let's make the GET more specific to the `apis.ts` definition for the single post by slug.
// This will require a separate route file for the list of posts.

// To properly fix this, we'd need:
// 1. /api/posts/route.ts for GET (list) and POST (create)
// 2. /api/posts/[slug]/route.ts for GET (single by slug), PUT (update), DELETE (delete)

// For now, I will just make sure the main /api/posts route (this file) handles listing and creation.
// The single post, categories, etc. are defined as separate endpoints in apis.ts for "blog-api",
// which implies they would be separate route files.
// The user error was for /api/posts?status=... which is a GET list, so the GET above is correct.
    