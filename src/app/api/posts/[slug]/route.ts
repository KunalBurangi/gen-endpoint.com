
import { type NextRequest, NextResponse } from 'next/server';

// Mock data for blog posts - in a real app, share this or use a DB
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

interface Params {
  slug: string;
}

// GET /api/posts/{slug} - Get single post by slug
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { slug } = params;
  const post = mockPosts.find(p => p.slug === slug);

  if (post) {
    // Return full post details
    return NextResponse.json(post);
  } else {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}

// PUT /api/posts/{slug} - Update a post by slug (Example implementation)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
    const { slug } = params;
    try {
        const body = await request.json();
        const postIndex = mockPosts.findIndex(p => p.slug === slug);

        if (postIndex === -1) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Merge updates, ensuring slug and id are not changed from body
        const { id, slug: bodySlug, ...updates } = body;
        mockPosts[postIndex] = { ...mockPosts[postIndex], ...updates, updatedAt: new Date().toISOString() };
        
        return NextResponse.json(mockPosts[postIndex]);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request body or error updating post" }, { status: 400 });
    }
}

// DELETE /api/posts/{slug} - Delete a post by slug (Example implementation)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    const { slug } = params;
    const postIndex = mockPosts.findIndex(p => p.slug === slug);

    if (postIndex === -1) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const deletedPost = mockPosts.splice(postIndex, 1);
    return NextResponse.json({ message: `Post "${deletedPost[0].title}" deleted successfully.`, timestamp: new Date().toISOString() });
}
    