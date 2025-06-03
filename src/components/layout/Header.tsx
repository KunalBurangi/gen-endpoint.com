
import Link from 'next/link';
import { Network, Home, Settings2 } from 'lucide-react'; // Settings2 for Generate, Home for homepage
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold font-headline text-primary">
          <Network className="h-7 w-7" />
          <span>Gen-Endpoint</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/generate">
              <Settings2 className="h-4 w-4 mr-2" />
              AI API Tools
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
