
import Link from 'next/link';
import { type ApiDefinition } from '@/data/apis';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers } from 'lucide-react';

interface ApiCardProps {
  api: ApiDefinition;
}

export function ApiCard({ api }: ApiCardProps) {
  const { Icon } = api;
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          {Icon ? <Icon className="h-10 w-10 text-primary mt-1" /> : <Layers className="h-10 w-10 text-primary mt-1" />}
          <div>
            <CardTitle className="text-xl font-semibold text-primary">{api.name}</CardTitle>
            <CardDescription className="text-sm mt-1 line-clamp-2">{api.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant="secondary">{api.category}</Badge>
         <p className="text-xs text-muted-foreground mt-3">
          {api.endpoints.length} endpoint{api.endpoints.length === 1 ? '' : 's'} available.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/apis/${api.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
