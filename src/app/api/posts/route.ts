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
    // --- Start of temporary hardcoded test ---
    try {
      console.log("Attempting hardcoded Firestore write to 'test_posts'...");
      const hardcodedData = {
        testTitle: "Hardcoded Test Post",
        testContent: "This is a test document to verify basic Firestore connectivity.",
        testDate: Timestamp.fromDate(new Date()),
        fixedTestValue: "固定値テスト" // Added a value with non-ASCII characters
      };
      const hardcodedRef = await addDoc(collection(db, 'test_posts'), hardcodedData);
      console.log("Hardcoded test document successfully written with ID: ", hardcodedRef.id, "Data:", hardcodedData);
    } catch (hcError) {
      console.error("!!! Hardcoded Firestore write FAILED:", hcError);
    }
    // --- End of temporary hardcoded test ---

    const body = await request.json();
    const { title, content, excerpt, categoryId, tags } = body; // 'excerpt', 'categoryId', 'tags' are unused with simplified newPost but keep for body structure consistency

    if (!title || !content ) { // categoryId temporarily removed from this check due to simplified newPost
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
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

    // Temporarily simplified newPost object for debugging
    const newPost = {
      title: title || "Default Title", // Ensure title is not undefined during this test
      slug: slug, // slug is now guaranteed to have a value
      content: content || "Default Content", // Ensure content is not undefined during this test
      createdAt: Timestamp.fromDate(new Date()),
      status: "draft"
      // All other fields (excerpt, author, categoryId, tags, views, likes, updatedAt, publishedAt) are temporarily removed for this test.
    };

    console.log("--- Attempting to save dynamic post ---");
    console.log("Title for Firestore:", newPost.title, "(Type:", typeof newPost.title, ")");
    console.log("Slug for Firestore:", newPost.slug, "(Type:", typeof newPost.slug, ")");
    console.log("Content for Firestore:", newPost.content, "(Type:", typeof newPost.content, ")");
    console.log("CreatedAt for Firestore:", newPost.createdAt, "(Type:", typeof newPost.createdAt, ")");
    console.log("Status for Firestore:", newPost.status, "(Type:", typeof newPost.status, ")");
    console.log("Full newPost object for Firestore:", newPost);

    const docRef = await addDoc(collection(db, 'posts'), newPost);

    return NextResponse.json({
      id: docRef.id,
      slug: newPost.slug,
      status: newPost.status,
      createdAt: (newPost.createdAt as Timestamp).toDate().toISOString(),
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
