'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // To get slug from URL

import ReactMarkdown from 'react-markdown';

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string; // Assuming this is Markdown
  author: {
    name: string;
  };
  publishedAt: string;
  views?: number; // Added views
  likes?: number; // Added likes
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string; // params.slug can be string | string[]

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for optimistic UI update for likes
  const [currentLikes, setCurrentLikes] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!slug) {
      // Should not happen if routing is set up correctly
      setError('Post slug not available.');
      setLoading(false);
      return;
    }

    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found.');
          } else {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
          }
          // Post not found error is set, loading will be set to false in finally.
          // No further processing needed for 404.
          return;
        }
        // If response.ok is true, proceed to parse JSON
        const postData = await response.json();
        // Assuming a 200 OK means valid postData.
        // If postData could be null/empty on 200, further checks might be needed here.
        setPost(postData);
        setCurrentLikes(postData.likes); // Initialize currentLikes
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'Not published'; // Or some other placeholder
    }
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/blog" className="text-blue-500 hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  if (!post) {
    // Should be caught by error state, but as a fallback
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Post not found.</p>
        <Link href="/blog" className="text-blue-500 hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  const handleLike = async () => {
    if (!post) return;

    // Optimistic UI update
    setCurrentLikes((prevLikes) => (prevLikes !== undefined ? prevLikes + 1 : 1));

    try {
      const response = await fetch(`/api/posts/${post.slug}`, { // Corrected endpoint
        method: 'PATCH',
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setCurrentLikes((prevLikes) => (prevLikes !== undefined ? prevLikes - 1 : 0));
        console.error('Failed to like the post:', response.statusText);
        // Optionally, show an error message to the user
        return;
      }

      const updatedPost = await response.json();
      // Update with actual likes from server to ensure consistency
      setCurrentLikes(updatedPost.likes);
      // Also update the main post state if you want other parts of the component to react
      // setPost(prevPost => prevPost ? { ...prevPost, likes: updatedPost.likes } : null);

    } catch (err) {
      // Revert optimistic update on failure
      setCurrentLikes((prevLikes) => (prevLikes !== undefined ? prevLikes - 1 : 0));
      console.error('Error liking the post:', err);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/blog" className="text-blue-500 hover:underline mb-8 block">
        &larr; Back to Blog
      </Link>
      <article>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span>By {post.author.name}</span>
          <span className="mx-2">|</span>
          <span>Published on {formatDate(post.publishedAt)}</span>
          {post.views !== undefined && (
            <>
              <span className="mx-2">|</span>
              <span>{post.views} views</span>
            </>
          )}
        </div>

        {/* Like button and count */}
        <div className="my-4 flex items-center">
          <button
            onClick={handleLike}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Like
          </button>
          <span>{currentLikes !== undefined ? currentLikes : (post.likes !== undefined ? post.likes : 0)} likes</span>
        </div>

        {/* Markdown content will be rendered here */}
        <div className="prose dark:prose-invert lg:prose-xl max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
