import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc, // Added for completeness, though PUT currently doesn't return full updated doc
  updateDoc,
  deleteDoc,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';

interface Params {
  slug: string;
}

// Helper function to convert Firestore Timestamps in an object
const convertTimestamps = (data: any) => {
  const convertedData = { ...data };
  for (const key in convertedData) {
    if (convertedData[key] instanceof Timestamp) {
      convertedData[key] = (convertedData[key] as Timestamp).toDate().toISOString();
    } else if (typeof convertedData[key] === 'object' && convertedData[key] !== null) {
      // Simple conversion: does not handle nested Timestamps within objects or arrays.
      // If your schema has deeper Timestamps, enhance this function.
    }
  }
  return convertedData;
};

// Helper function to find a post document by slug and return its snapshot
async function getPostSnapshotBySlug(slug: string) {
  const postsCol = collection(db, 'posts');
  const q = query(postsCol, where('slug', '==', slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null; // Indicates post not found
  }
  // Assuming slug is unique, so there should be at most one document.
  return querySnapshot.docs[0];
}

// GET /api/posts/{slug} - Get single post by slug
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { slug } = params;

  try {
    const postDocSnapshot = await getPostSnapshotBySlug(slug);

    if (!postDocSnapshot) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = postDocSnapshot.data();
    const postId = postDocSnapshot.id;

    // Increment view count
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        views: FieldValue.increment(1)
      });
      // Update postData to reflect incremented view count for the response
      // If views field didn't exist, it's now 1. If it did, it's incremented.
      postData.views = (postData.views || 0) + 1;
    } catch (updateError) {
      console.error(`Error updating view count for post "${slug}":`, updateError);
      // Non-critical error, log it but proceed with returning the post data
    }

    const responseData = convertTimestamps(postData);
    // Include the document ID along with other post data
    return NextResponse.json({ id: postId, ...responseData });

  } catch (error) {
    console.error(`Error fetching post by slug "${slug}":`, error);
    return NextResponse.json({
      error: 'Error fetching post',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PATCH /api/posts/{slug} - Like a post (increment likes count)
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const { slug } = params;

  try {
    const postDocSnapshot = await getPostSnapshotBySlug(slug);

    if (!postDocSnapshot) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postId = postDocSnapshot.id;
    const postRef = doc(db, 'posts', postId);

    // Atomically increment the likes count
    await updateDoc(postRef, {
      likes: FieldValue.increment(1)
    });

    // Fetch the updated post data to return the new likes count
    const updatedPostDoc = await getDoc(postRef);
    if (!updatedPostDoc.exists()) {
      // This case should ideally not happen if the snapshot existed moments ago
      return NextResponse.json({ error: 'Post disappeared after update' }, { status: 404 });
    }

    const updatedPostData = convertTimestamps(updatedPostDoc.data());

    return NextResponse.json({
      message: 'Post liked successfully',
      id: postId,
      likes: updatedPostData.likes, // Return the new likes count
      // Optionally, return the full updated post data:
      // ...updatedPostData
    });

  } catch (error) {
    console.error(`Error liking post by slug "${slug}":`, error);
    return NextResponse.json({
      error: 'Error liking post',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PUT /api/posts/{slug} - Update a post by slug
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { slug } = params;

  try {
    const postDocSnapshot = await getPostSnapshotBySlug(slug);

    if (!postDocSnapshot) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    // Exclude fields that should not be changed via this PUT method directly
    const {
      id: bodyId,
      slug: bodySlug, // Slug should not be changed once created usually
      author: bodyAuthor, // Author should likely be immutable or handled by a separate process
      createdAt: bodyCreatedAt, // Creation timestamp is immutable
      ...updatePayload
    } = body;

    const postRef = doc(db, 'posts', postDocSnapshot.id);
    await updateDoc(postRef, {
      ...updatePayload, // Apply the filtered updates
      updatedAt: Timestamp.now(), // Always set/update the updatedAt timestamp
    });

    // Optionally, fetch and return the updated document
    // const updatedDoc = await getDoc(postRef);
    // const updatedData = convertTimestamps(updatedDoc.data());
    // return NextResponse.json({ id: updatedDoc.id, ...updatedData });

    return NextResponse.json({ message: 'Post updated successfully', id: postDocSnapshot.id });

  } catch (error) {
    console.error(`Error updating post by slug "${slug}":`, error);
    if (error instanceof SyntaxError) { // Check for invalid JSON
        return NextResponse.json({ error: "Invalid JSON in request body", details: error.message }, { status: 400 });
    }
    return NextResponse.json({
      error: 'Error updating post',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE /api/posts/{slug} - Delete a post by slug
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { slug } = params;

  try {
    const postDocSnapshot = await getPostSnapshotBySlug(slug);

    if (!postDocSnapshot) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postTitle = postDocSnapshot.data().title || "Untitled"; // For a more informative message
    const postRef = doc(db, 'posts', postDocSnapshot.id);
    await deleteDoc(postRef);

    return NextResponse.json({ message: `Post "${postTitle}" (slug: ${slug}) deleted successfully.` });

  } catch (error) {
    console.error(`Error deleting post by slug "${slug}":`, error);
    return NextResponse.json({
      error: 'Error deleting post',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
