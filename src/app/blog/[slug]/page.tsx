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
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string; // params.slug can be string | string[]

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Post slug not available.');
      setLoading(false);
      return;
    }

    async function fetchPost() {
      setLoading(true); // Ensure loading is true at the start of fetch
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found.');
          } else {
            setError(`Failed to fetch post: Server responded with ${response.status}`);
          }
          // No need to throw, error state is set.
          return;
        }
        const postData = await response.json();
        if (!postData || Object.keys(postData).length === 0) {
            setError('Post data is empty or invalid.');
            setPost(null);
        } else {
            setPost(postData);
        }
      } catch (err) {
        console.error('Fetch post error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching the post.');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'Not published';
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
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          {/* Optional: Add a spinner here if you have one in your project */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Link
            href="/blog"
            className="mt-4 inline-block px-6 py-3 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    // This state should ideally be covered by the error handling for "Post not found" or "Post data empty"
    return (
      <div className="container mx-auto px-4 py-12 text-center">
         <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Post Unavailable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The requested post could not be displayed.</p>
          <Link
            href="/blog"
            className="mt-4 inline-block px-6 py-3 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-left"> {/* Wrapper for back link */}
        <Link
          href="/blog"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors duration-150"
        >
          &larr; Back to Blog
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <article className="p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="border-y border-gray-200 dark:border-gray-700 py-4 my-6 flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="mr-3">By {post.author.name}</span>
            <span className="mx-2 text-gray-400 dark:text-gray-600 hidden sm:inline">·</span>
            <span className="mt-1 sm:mt-0">Published on {formatDate(post.publishedAt)}</span>
          </div>

          <div className="prose dark:prose-invert lg:prose-xl max-w-none text-gray-700 dark:text-gray-300">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
