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
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error.');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          <span>By <strong>{post.author.name}</strong></span>
          <span className="mx-2">•</span>
          <span>Published on {formatDate(post.publishedAt)}</span>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
