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
        } else {
          const data = await response.json();
          setPost(data.post || null); // Adjust based on actual API response
          if (!data.post) {
            setError('Post not found.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        </div>
        {/* Markdown content will be rendered here */}
        <div className="prose dark:prose-invert lg:prose-xl max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
