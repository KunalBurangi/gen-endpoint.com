'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: {
    name: string;
  };
  publishedAt: string;
  likes?: number;
  views?: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError('Post slug not available.');
      setLoading(false);
      return;
    }

    async function fetchPost() {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          setError(response.status === 404 ? 'Post not found.' : `Error: ${response.status}`);
          return;
        }
        const data = await response.json();
        if (!data || Object.keys(data).length === 0) {
          setError('Post data is empty.');
          return;
        }
        setPost(data);
        // Check localStorage for like state
        setLiked(localStorage.getItem(`liked-${data.id}`) === 'true');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error.');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  // Like button handler
  const handleLike = async () => {
    if (!post || liked) return;
    setLiked(true);
    localStorage.setItem(`liked-${post.id}`, 'true');
    setPost({ ...post, likes: (post.likes || 0) + 1 });
    // Optimistically update UI, then PATCH
    await fetch(`/api/posts/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: 1 })
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not published';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400">
        Loading blog post...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-xl">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error || 'Post not found.'}</p>
          <Link
            href="/blog"
            className="px-6 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <Link
        href="/blog"
        className="text-indigo-600 dark:text-indigo-400 hover:underline mb-6 inline-block"
      >
        ← Back to Blog
      </Link>

      <article className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h1>

        <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>By <strong>{post.author.name}</strong></span>
          <span className="mx-2">•</span>
          <span>Published on {formatDate(post.publishedAt)}</span>
        </div>


        <div className="flex flex-wrap items-center text-xs text-gray-600 dark:text-gray-300 mb-8 gap-4">
          <button
            aria-label={liked ? 'Unlike' : 'Like'}
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-1 focus:outline-none ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'} transition`}
            style={{ fontSize: 16, lineHeight: 1 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.75c-1.74 0-3.41 1.01-4.5 2.61C10.91 4.76 9.24 3.75 7.5 3.75 4.42 3.75 2 6.17 2 9.25c0 5.25 9 11 9 11s9-5.75 9-11c0-3.08-2.42-5.5-5.5-5.5z"
                fill={liked ? 'currentColor' : 'none'}
              />
            </svg>
            <span>{typeof post.likes === 'number' ? post.likes : 0}</span>
          </button>
          <span>👁️ Views: {typeof post.views === 'number' ? post.views : 0}</span>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
