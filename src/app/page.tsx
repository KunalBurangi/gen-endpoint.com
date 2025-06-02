
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Build Your Own APIs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          This application is a starting point for creating and hosting your own API endpoints.
          You can also use the AI tools to help generate responses or schemas.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/generate">
              Go to AI API Tools
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-4">Next Steps</h2>
        <p className="text-center text-muted-foreground">
          Define your API routes in the <code>src/app/api/</code> directory.
        </p>
        {/* Future content about the app's own APIs can go here */}
      </section>
    </div>
  );
}
