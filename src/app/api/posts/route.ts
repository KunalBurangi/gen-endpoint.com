import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  query,
  orderBy,
  limit as firestoreLimit,
  where
} from 'firebase/firestore';

// Helper function to convert Firestore Timestamps
const convertTimestamps = (data: any) => {
  const converted = { ...data };
  for (const key in converted) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = (converted[key] as Timestamp).toDate().toISOString();
    }
  }
  return converted;
};

// GET /api/posts - List blog posts with filtering and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const categorySlug = searchParams.get('category'); // Frontend sends categoryId as 'category'
  const tag = searchParams.get('tag');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const postsLimit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const postsCol = collection(db, 'posts');
    const queryConstraints = [];

    if (status) {
      queryConstraints.push(where('status', '==', status));
    }
    if (categorySlug) {
      // Assuming categoryId is the field storing the category identifier in Firestore
      queryConstraints.push(where('categoryId', '==', categorySlug));
    }
    if (tag) {
      queryConstraints.push(where('tags', 'array-contains', tag));
    }

    // Construct the query with all constraints
    let q = query(postsCol, orderBy('createdAt', 'desc'));
    if (queryConstraints.length > 0) {
      // Apply where filters after orderBy on the main sort field
      q = query(postsCol, ...queryConstraints, orderBy('createdAt', 'desc'));
    }
    // Apply limit last
    q = query(q, firestoreLimit(postsLimit));

    const postSnapshot = await getDocs(q);
    const posts = postSnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    }));

    return NextResponse.json({
      posts: posts,
      pagination: {
        page: page,
        limit: postsLimit,
        fetchedCount: posts.length,
      }
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Error fetching posts", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// POST /api/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, categoryId, tags } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: "Title, content, and categoryId are required" }, { status: 400 });
    }

    const slug = title.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w-]+/g, '')     // Remove all non-word chars
      .replace(/--+/g, '-')        // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text

    const newPostData = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 120) + (content.length > 120 ? "..." : ""),
      author: { id: "user_placeholder_id", name: "Placeholder User" }, // Replace with actual user later
      categoryId, // Already validated as present
      tags: Array.isArray(tags) ? tags : (tags ? (tags as string).split(',').map(t => t.trim()).filter(t => t) : []),
      status: "published", // Or 'draft' by default
      views: 0,
      likes: 0,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      publishedAt: Timestamp.fromDate(new Date()), // Assuming immediate publish
    };

    const docRef = await addDoc(collection(db, 'posts'), newPostData);

    return NextResponse.json({
      id: docRef.id,
      slug: newPostData.slug,
      status: newPostData.status,
      createdAt: (newPostData.createdAt as Timestamp).toDate().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating post:", error);
    // Check if the error is due to request parsing
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ error: "Invalid JSON in request body", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error creating post", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
