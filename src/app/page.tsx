
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { publicApis, type ApiDefinition } from '@/data/apis';
import { ApiCard } from '@/components/ApiCard';
import { Lightbulb, Upload } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-10 bg-card rounded-lg shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-6">
          Welcome to Gen-Endpoint
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 px-4">
          Explore our built-in API endpoints, or use AI-powered tools to help you design and generate
          responses & schemas for your own API development.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" asChild>
            <Link href="#sample-apis">
              Explore Sample APIs
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/generate">
              <Lightbulb className="mr-2 h-5 w-5" />
              Go to AI API Tools
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/upload-test">
              <Upload className="mr-2 h-5 w-5" />
              Test File Upload
            </Link>
          </Button>
        </div>
      </section>

      <section id="sample-apis" className="py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Sample APIs</h2>
        {publicApis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicApis.map((api) => (
              <ApiCard key={api.id} api={api} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No sample APIs are currently defined. Check back later!
          </p>
        )}
      </section>

      <section className="py-8 bg-card rounded-lg shadow-md mt-12 p-6 md:p-8">
         <h2 className="text-3xl font-bold text-center mb-6">Build Your Own Endpoints</h2>
         <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Ready to create? You can define your own API routes directly in the <code>src/app/api/</code> directory.
          Use the Next.js App Router conventions to build out your backend functionality.
        </p>
      </section>
    </div>
  );
}
