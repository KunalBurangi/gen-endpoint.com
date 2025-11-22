import fetch from 'node-fetch';
import { randomBytes } from 'crypto';

// Helper to generate a unique slug
const generateUniqueSlug = () => `test-post-${randomBytes(4).toString('hex')}-${Date.now()}`;

// Base URL for the API - adjust if your dev server runs elsewhere
const BASE_URL = 'http://localhost:3000/api/posts';

// Helper function to create a post
async function createTestPost(slug: string, title: string) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title,
      slug: slug, // Include slug in creation if your API supports/requires it
      content: 'Test content for view and like count testing.',
      categoryId: 'test-category', // Ensure this category ID is valid or handled by your API
      tags: ['test', 'api'],
      status: 'published', // Or 'draft' if preferred for tests
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to create post:', response.status, errorBody);
    throw new Error(`Failed to create post: ${response.status} ${errorBody}`);
  }
  return response.json();
}

// Helper function to delete a post
async function deleteTestPost(slug: string) {
  const response = await fetch(`${BASE_URL}/${slug}`, { method: 'DELETE' });
  if (!response.ok) {
    // Log error but don't necessarily fail the test here, cleanup is best-effort
    console.warn(`Failed to delete post ${slug}: ${response.status}`);
  }
  return response.json();
}

// Simple assertion helper
function assertEquals(expected: any, actual: any, message: string) {
  if (expected !== actual) {
    throw new Error(`Assertion failed: ${message}. Expected "${expected}", but got "${actual}".`);
  }
  console.log(`Assertion passed: ${message}.`);
}

async function main() {
  console.log('Starting API tests for posts...\n');

  // --- Test View Count Increment ---
  console.log('--- Testing View Count Increment ---');
  const viewTestSlug = generateUniqueSlug();
  let viewTestPostId: string | null = null;
  try {
    const createdViewPost: any = await createTestPost(viewTestSlug, `View Test Post ${viewTestSlug}`);
    viewTestPostId = createdViewPost.id;
    assertEquals(true, !!viewTestPostId, 'View test post created successfully with an ID');
    console.log(`Created post for view test: ${viewTestSlug} (ID: ${viewTestPostId})`);

    // Fetch 1 (Views are incremented on fetch by the API)
    const res1 = await fetch(`${BASE_URL}/${viewTestSlug}`);
    const post1: any = await res1.json();
    const views1 = post1.views;
    assertEquals(true, views1 >= 0, `Initial views count should be >= 0 (was ${views1})`);
    console.log(`Views after 1st fetch: ${views1}`);

    // Fetch 2
    const res2 = await fetch(`${BASE_URL}/${viewTestSlug}`);
    const post2: any = await res2.json();
    const views2 = post2.views;
    assertEquals(views1 + 1, views2, 'Views count should increment by 1 on second fetch');
    console.log(`Views after 2nd fetch: ${views2}`);

  } catch (error) {
    console.error('View count test failed:', error);
  } finally {
    if (viewTestPostId) { // Or use slug if ID not returned/used for deletion
      console.log(`Cleaning up view test post: ${viewTestSlug}`);
      await deleteTestPost(viewTestSlug);
    }
  }
  console.log('--- View Count Increment Test Finished ---\n');


  // --- Test Like Functionality ---
  console.log('--- Testing Like Functionality ---');
  const likeTestSlug = generateUniqueSlug();
  let likeTestPostId: string | null = null;
  try {
    const createdLikePost: any = await createTestPost(likeTestSlug, `Like Test Post ${likeTestSlug}`);
    likeTestPostId = createdLikePost.id;
    assertEquals(true, !!likeTestPostId, 'Like test post created successfully with an ID');
    console.log(`Created post for like test: ${likeTestSlug} (ID: ${likeTestPostId})`);

    const initialPostRes = await fetch(`${BASE_URL}/${likeTestSlug}`);
    const initialPost: any = await initialPostRes.json();
    const initialLikes = initialPost.likes !== undefined ? initialPost.likes : 0;
    console.log(`Initial likes: ${initialLikes}`);

    // Like 1
    const likeRes1 = await fetch(`${BASE_URL}/${likeTestSlug}`, { method: 'PATCH' }); // Corrected PATCH endpoint
    const likeData1: any = await likeRes1.json();
    assertEquals(200, likeRes1.status, 'Like request 1 should be successful (200 OK)');
    assertEquals(initialLikes + 1, likeData1.likes, 'Likes count should be incremented by 1 in PATCH response');
    console.log(`Likes after 1st PATCH: ${likeData1.likes}`);

    // Fetch to confirm
    const fetchAfterLike1Res = await fetch(`${BASE_URL}/${likeTestSlug}`);
    const postAfterLike1: any = await fetchAfterLike1Res.json();
    assertEquals(initialLikes + 1, postAfterLike1.likes, 'Likes count should be updated after 1st like when fetched');
    console.log(`Likes after 1st like (fetched): ${postAfterLike1.likes}`);

    // Like 2
    const likeRes2 = await fetch(`${BASE_URL}/${likeTestSlug}`, { method: 'PATCH' }); // Corrected PATCH endpoint
    const likeData2: any = await likeRes2.json();
    assertEquals(200, likeRes2.status, 'Like request 2 should be successful (200 OK)');
    assertEquals(initialLikes + 2, likeData2.likes, 'Likes count should be incremented again in PATCH response');
    console.log(`Likes after 2nd PATCH: ${likeData2.likes}`);

    // Fetch to confirm
    const fetchAfterLike2Res = await fetch(`${BASE_URL}/${likeTestSlug}`);
    const postAfterLike2: any = await fetchAfterLike2Res.json();
    assertEquals(initialLikes + 2, postAfterLike2.likes, 'Likes count should be updated after 2nd like when fetched');
    console.log(`Likes after 2nd like (fetched): ${postAfterLike2.likes}`);

  } catch (error) {
    console.error('Like functionality test failed:', error);
  } finally {
    if (likeTestPostId) {
      console.log(`Cleaning up like test post: ${likeTestSlug}`);
      await deleteTestPost(likeTestSlug);
    }
  }
  console.log('--- Like Functionality Test Finished ---\n');

  // --- Test Liking a Non-Existent Post ---
  console.log('--- Testing Liking a Non-Existent Post ---');
  const nonExistentSlug = 'non-existent-slug-for-testing-likes';
  try {
    const res = await fetch(`${BASE_URL}/${nonExistentSlug}`, { method: 'PATCH' }); // Corrected PATCH endpoint
    assertEquals(404, res.status, 'Liking a non-existent post should return 404');
    console.log(`Response status for liking non-existent post: ${res.status} (Correctly 404)`);
  } catch (error) {
    console.error('Liking non-existent post test failed:', error);
  }
  console.log('--- Liking Non-Existent Post Test Finished ---\n');

  console.log('All API tests for posts finished.');
}

main().catch(error => {
  console.error('Critical error during test execution:', error);
  process.exit(1);
});

/*
Instructions to run this test:

1. Ensure your Next.js development server is running (usually `npm run dev`).
   The server should be accessible at ${BASE_URL} (default: http://localhost:3000).

2. Save this file as `src/app/api/posts/posts-api.test.ts`.

3. Open your terminal and navigate to the root of your project.

4. You'll need `ts-node` to run this TypeScript file directly. If you don't have it, install it globally or as a dev dependency:
   `npm install -g ts-node` (for global)
   OR
   `npm install --save-dev ts-node typescript` (for local project, also add `typescript` if not already there)

5. Run the test file using:
   `ts-node src/app/api/posts/posts-api.test.ts`

   If you installed ts-node locally, you might need to run it via npx:
   `npx ts-node src/app/api/posts/posts-api.test.ts`

6. Observe the console output for test results and any errors.

Note:
- This test script performs create and delete operations on your Firestore database.
  It's designed to clean up after itself, but ensure you are running it against a
  development/testing environment.
- The `categoryId` in `createTestPost` is hardcoded to 'test-category'. Ensure this
  is a valid category in your system or that your API handles non-existent categories
  gracefully for test posts if they are not the focus of these specific tests.
- The PATCH endpoint for liking was assumed to be `${BASE_URL}/${slug}` based on previous subtask.
  If it were `${BASE_URL}/${slug}/like`, the test code would need adjustment.
*/
