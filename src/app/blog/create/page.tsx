'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface PostCreatePayload {
  title: string;
  content: string;
  excerpt?: string;
  categoryId: string; // Using category name as categoryId for now
  tags: string[];
}

interface PostCreateResponse {
  id: string;
  slug: string;
  // ... other fields that might be returned
}

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState(''); // Comma-separated string

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title || !content || !category) {
      toast({
        title: 'Missing Fields',
        description: 'Title, Content, and Category are required.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const payload: PostCreatePayload = {
      title,
      content,
      excerpt: excerpt || undefined, // Send undefined if empty
      categoryId: category, // Using category name as ID as per requirement
      tags: tagsArray,
    };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during post creation.' }));
        throw new Error(errorData.message || `Failed to create post: ${response.statusText}`);
      }

      const result: PostCreateResponse = await response.json();

      toast({
        title: 'Post Created!',
        description: 'Your new blog post has been successfully created.',
      });

      // Redirect to the new post page if slug is available, otherwise to blog index
      if (result.slug) {
        router.push(`/blog/${result.slug}`);
      } else {
        router.push('/blog');
      }

    } catch (error) {
      toast({
        title: 'Error Creating Post',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <Button variant="outline" asChild>
          <Link href="/blog">&larr; Back to Blog</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-lg">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="content" className="text-lg">Content (Markdown)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content in Markdown..."
            required
            rows={15}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="excerpt" className="text-lg">Excerpt (Optional)</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary of your post"
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-lg">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category name (e.g., Technology)"
            required
            className="mt-1"
          />
          {/* Future improvement: could be a select dropdown if categories are predefined */}
        </div>

        <div>
          <Label htmlFor="tags" className="text-lg">Tags (Comma-separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., nextjs, tailwindcss, webdev"
            className="mt-1"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? 'Creating Post...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
