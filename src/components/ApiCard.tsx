import Link from 'next/link';
import type { ApiDefinition } from '@/data/apis';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface ApiCardProps {
  api: ApiDefinition;
}

export function ApiCard({ api }: ApiCardProps) {
  const { Icon } = api;
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex-row items-center gap-4 pb-4">
        {Icon && <Icon className="h-10 w-10 text-primary" />}
        <div>
          <CardTitle className="font-headline text-lg">{api.name}</CardTitle>
          <CardDescription>{api.category}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{api.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <a href={api.documentationUrl} target="_blank" rel="noopener noreferrer">
            Docs
            <ExternalLink className="h-3 w-3 ml-1.5" />
          </a>
        </Button>
        <Button variant="default" size="sm" asChild>
          <Link href={`/apis/${api.id}`}>
            View Details
            <ArrowRight className="h-3 w-3 ml-1.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
