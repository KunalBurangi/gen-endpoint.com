
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from 'next/image';
import { Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export default function AboutPage() {
  return (
    <div className="space-y-8">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary shadow-md">
            <Image
              src="https://placehold.co/200x200.png"
              alt="Your Name"
              width={200}
              height={200}
              className="object-cover"
              data-ai-hint="profile photo"
            />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">
            Your Name / Project Name
          </CardTitle>
          <CardDescription className="text-lg mt-1 text-muted-foreground">
            Passionate Developer / Creator of Gen-Endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none dark:prose-invert text-center">
          <p>
            Welcome to the About Me page! This is where you can share more information
            about yourself, your project, or your company.
          </p>
          <p>
            Gen-Endpoint is a powerful platform designed to help developers explore, test, and generate API endpoints
            with ease, leveraging the power of AI for schema generation and mock data creation.
          </p>
          <p>
            Feel free to customize this section with your personal story, project goals,
            mission, vision, or any other details you'd like to share with your audience.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-7 w-7" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-7 w-7" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-7 w-7" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="h-7 w-7" />
              <span className="sr-only">Personal Website</span>
            </a>
          </div>
        </CardContent>
      </Card>

       <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">More About Gen-Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            Gen-Endpoint aims to simplify the API development lifecycle. Key features include:
          </p>
          <ul>
            <li>Exploring pre-defined sample APIs to understand various functionalities.</li>
            <li>Interactively testing API endpoints directly from the browser.</li>
            <li>Utilizing AI to generate Next.js API handler code from natural language prompts.</li>
            <li>Generating JSON schemas from example JSON, and vice-versa.</li>
            <li>A live AI runtime endpoint for dynamic data generation based on user queries.</li>
          </ul>
          <p>
            This project is built with Next.js, React, ShadCN UI, Tailwind CSS, and Genkit for AI capabilities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
