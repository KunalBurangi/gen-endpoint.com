
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from "@vercel/analytics/react"


export const metadata: Metadata = {
  title: 'My API Platform',
  description: 'Explore and build API endpoints, with AI-powered tools for schema and response generation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/*
          GOOGLE ADSENSE SCRIPT (PLACEHOLDER)
          Replace 'ca-pub-YOUR_PUBLISHER_ID' with your actual AdSense Publisher ID.
          You get this script from your Google AdSense account.
          It's usually recommended to place this in the <head> of your pages.
        */}
        {/*
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
        ></script>
        */}
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
