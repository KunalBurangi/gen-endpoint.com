
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from "@vercel/analytics/react"


export const metadata: Metadata = {
  title: 'Gen-Endpoint: Free Public APIs, REST API Endpoints & AI Generation Tools',
  description: 'Discover free public APIs and REST API endpoints for testing and development. Gen-Endpoint also offers AI-powered tools to generate Next.js API handlers, JSON schemas, and sample data. Perfect for developers seeking test APIs, mock APIs, or quick backend solutions and web services.',
  keywords: ['free public API', 'test API', 'sample API', 'public endpoints', 'API for developers', 'Next.js API generator', 'AI API tools', 'JSON schema generator', 'API development', 'backend tools', 'genkit', 'free api', 'public api', 'restAPI', 'REST API', 'developer tools', 'mock API', 'JSON API', 'web services', 'AI powered API'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const faviconHref = "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#4285F4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='16' y='16' width='6' height='6' rx='1'/><rect x='2' y='16' width='6' height='6' rx='1'/><rect x='9' y='2' width='6' height='6' rx='1'/><path d='M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3'/><path d='M12 12V9'/></svg>");
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href={faviconHref} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7546609873197379"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen" suppressHydrationWarning={true}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
