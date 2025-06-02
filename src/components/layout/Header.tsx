import Link from 'next/link';
import { Network, Code2, Settings2 } from 'lucide-react'; // Settings2 for Generate
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold font-headline text-primary">
          <Network className="h-7 w-7" />
          <span>API Endpoint Explorer</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <Code2 className="h-4 w-4 mr-2" />
              Browse APIs
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/generate">
              <Settings2 className="h-4 w-4 mr-2" />
              Generate Response
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
