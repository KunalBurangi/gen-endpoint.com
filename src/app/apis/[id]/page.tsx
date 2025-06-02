import { publicApis, type ApiDefinition, type ApiEndpoint } from '@/data/apis';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Terminal } from 'lucide-react';

interface ApiDetailPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  return publicApis.map((api) => ({
    id: api.id,
  }));
}

export default async function ApiDetailPage({ params }: ApiDetailPageProps) {
  const api = publicApis.find(a => a.id === params.id);

  if (!api) {
    notFound();
  }

  const { Icon } = api;

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to API List
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {Icon && <Icon className="h-16 w-16 text-primary hidden md:block" />}
            <div>
              <CardTitle className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
                 {Icon && <Icon className="h-8 w-8 text-primary md:hidden" />} {api.name}
              </CardTitle>
              <CardDescription className="text-lg mt-1">{api.description}</CardDescription>
              <div className="mt-3 flex gap-2 items-center">
                <Badge variant="secondary">{api.category}</Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href={api.documentationUrl} target="_blank" rel="noopener noreferrer">
                    Official Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-accent" />
            API Endpoints
          </CardTitle>
          <CardDescription>Explore the available endpoints for the {api.name} API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {api.endpoints.length > 0 ? (
            api.endpoints.map((endpoint, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    className={
                      endpoint.method === 'GET' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                      endpoint.method === 'POST' ? 'bg-green-500 hover:bg-green-600 text-white' :
                      endpoint.method === 'PUT' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                      endpoint.method === 'DELETE' ? 'bg-red-500 hover:bg-red-600 text-white' :
                      'bg-gray-500 hover:bg-gray-600 text-white'
                    }
                  >
                    {endpoint.method}
                  </Badge>
                  <p className="font-mono text-sm font-semibold text-primary">{endpoint.path}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                {endpoint.exampleResponse && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-foreground">Example Response:</h4>
                    <CodeBlock code={endpoint.exampleResponse} language="json" className="text-xs" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No specific endpoints listed for this API here. Please refer to the official documentation.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
