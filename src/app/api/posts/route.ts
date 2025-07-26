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
    // Hardcoded write test removed.

    const body = await request.json();
    // Ensure all expected fields are destructured from the body
    const { title, content, excerpt, categoryId, tags } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: "Title, content, and categoryId are required" }, { status: 400 });
    }

    let slug = title.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w-]+/g, '')     // Remove all non-word chars
      .replace(/--+/g, '-')        // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text

    if (!slug) {
      console.warn("Generated slug was empty for title:", title, ". Using fallback slug.");
      slug = `post-${Date.now()}`;
    }

    // Restored full newPost object
    const newPost = {
      title: title,
      slug: slug,
      content: content,
      excerpt: excerpt || (content && content.length > 150 ? content.substring(0, 150) + "..." : content || ""), // Ensure content is defined for substring
      author: { name: "Kunal Burangi" }, // Placeholder, to match frontend expectations. Consider adding id later.
      categoryId: categoryId, // categoryId is validated as required
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()).filter(t => t) : []), // Ensure tags is an array
      status: "draft", // Default status
      views: 0,
      likes: 0,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()), // For new posts, updatedAt is same as createdAt
      publishedAt: Timestamp.fromDate(new Date()) // Always set publishedAt to now
    };

    console.log("--- Attempting to save full dynamic post ---");
    console.log("Title:", newPost.title, typeof newPost.title);
    console.log("Slug:", newPost.slug, typeof newPost.slug);
    console.log("Content:", newPost.content, typeof newPost.content); // Be mindful of logging very long content
    console.log("Excerpt:", newPost.excerpt, typeof newPost.excerpt);
    console.log("Author:", newPost.author, typeof newPost.author);
    console.log("CategoryId:", newPost.categoryId, typeof newPost.categoryId);
    console.log("Tags:", newPost.tags, typeof newPost.tags);
    console.log("Status:", newPost.status, typeof newPost.status);
    console.log("CreatedAt:", newPost.createdAt, typeof newPost.createdAt);
    console.log("UpdatedAt:", newPost.updatedAt, typeof newPost.updatedAt);
    console.log("PublishedAt:", newPost.publishedAt, typeof newPost.publishedAt);
    console.log("Full newPost object for Firestore:", newPost);

    const docRef = await addDoc(collection(db, 'posts'), newPost);

    return NextResponse.json({
      id: docRef.id,
      slug: newPost.slug,
      status: newPost.status,
      createdAt: (newPost.createdAt as Timestamp).toDate().toISOString(), // Already a Timestamp, safe to convert
    }, { status: 201 });

  } catch (error) {
    console.error("!!! Error creating dynamic post in Firestore:", error);
    // Check if the error is due to request parsing
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ error: "Invalid JSON in request body", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error creating post", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
