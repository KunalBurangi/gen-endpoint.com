
import Link from 'next/link';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react'; // Added Heart icon

export function Footer() {
  return (
    <footer className="bg-card border-t text-center py-8 mt-12">
      <div className="container mx-auto px-4">
        <AdPlaceholder />
        <div className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gen-Endpoint. All rights reserved.
          </p>
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Heart className="h-4 w-4 mr-1.5 text-red-500 fill-red-500" /> {/* Added fill for the heart */}
            <span>Made with love in India-V2</span>
          </div>
          <Button variant="link" asChild size="sm" className="text-muted-foreground hover:text-primary">
            <Link href="/about">
              About Us
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
