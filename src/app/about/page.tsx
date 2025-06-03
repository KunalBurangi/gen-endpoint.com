
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from 'next/image';
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react'; // Kept ExternalLink in case it's used for other purposes, but won't link a personal site if not provided
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
              alt="Kunal Burangi"
              width={200}
              height={200}
              className="object-cover"
              data-ai-hint="profile photo"
            />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">
            Kunal Burangi
          </CardTitle>
          <CardDescription className="text-lg mt-1 text-muted-foreground">
            Passionate Developer / Creator of Gen-Endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none dark:prose-invert text-left md:text-center px-4 md:px-6">
          <p>
            Hi there! 👋 I'm glad you stopped by.
          </p>
          <p>
            I'm the creator of Gen Endpoint — a platform built out of curiosity, passion, and a love for clean and powerful web APIs. With a background in full-stack development and a strong focus on backend systems, I created this space to share tools, endpoints, and experiments that simplify how developers work with data, APIs, and AI.
          </p>
          <p>
            At Gen Endpoint, the goal is simple: Build reliable, developer-friendly endpoints that just work.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-3 text-primary text-center">What I Do</h3>
          <ul className="list-disc list-inside space-y-1 text-left mx-auto max-w-md">
            <li>🔧 Create and maintain useful public API endpoints</li>
            <li>🤖 Experiment with AI integrations, automation, and data processing</li>
            <li>🚀 Build backend systems using Node.js, TypeScript, and cloud services</li>
            <li>🧪 Test new technologies and make them accessible to others</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-3 text-primary text-center">Why I Built Gen Endpoint</h3>
          <p className="text-left md:text-center">
            I found myself frequently needing test APIs, AI integrations, or quick backend solutions — so instead of rebuilding the same things over and over, I decided to make them available to anyone who needs them.
          </p>
          <p className="text-left md:text-center">
            Gen Endpoint is still growing, and your feedback or collaboration is always welcome.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-3 text-primary text-center">Get in Touch</h3>
          <p className="text-left md:text-center">
            Have ideas, questions, or want to collaborate?
            Drop me a message at <a href="mailto:kunal.burangi96@gmail.com" className="text-accent hover:underline">kunal.burangi96@gmail.com</a> or connect with me via the links below.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <a href="https://github.com/KunalBurangi" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
              <Github className="h-7 w-7" />
            </a>
            <a href="https://www.linkedin.com/in/kunalburangi/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-7 w-7" />
            </a>
             <a href="mailto:kunal.burangi96@gmail.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
              <Mail className="h-7 w-7" />
            </a>
            {/* Removed Twitter and Personal Website placeholder links */}
          </div>
           <p className="mt-8 text-center">
            Thanks for visiting — let’s build something cool! 🚀
          </p>
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
