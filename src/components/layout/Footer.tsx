
import Link from 'next/link';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-card border-t text-center py-6">
      <div className="container mx-auto px-4">
        <AdPlaceholder />
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gen-Endpoint. All rights reserved.
          </p>
          <Button variant="link" asChild size="sm" className="text-muted-foreground">
            <Link href="/about">
              About Us
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
