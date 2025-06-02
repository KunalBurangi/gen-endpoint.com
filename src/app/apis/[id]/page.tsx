
import { publicApis, type ApiDefinition, type ApiEndpoint } from '@/data/apis';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Terminal, Info, Layers, Binary, FileInput, FileOutput } from 'lucide-react';

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
  const isExternalDoc = api.documentationUrl.startsWith('http://') || api.documentationUrl.startsWith('https://');

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
            {Icon ? <Icon className="h-16 w-16 text-primary hidden md:block" /> : <Layers className="h-16 w-16 text-primary hidden md:block" /> }
            <div>
              <CardTitle className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
                 {Icon ? <Icon className="h-8 w-8 text-primary md:hidden" /> : <Layers className="h-8 w-8 text-primary md:hidden" />} {api.name}
              </CardTitle>
              <CardDescription className="text-lg mt-1">{api.description}</CardDescription>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <Badge variant="secondary">{api.category}</Badge>
                {isExternalDoc ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={api.documentationUrl} target="_blank" rel="noopener noreferrer">
                      Official Documentation
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                   <Badge variant="outline" className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-300">
                    <Info className="mr-2 h-4 w-4" />
                    Internal API - Hosted by this App
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-accent" />
            API Endpoints & Usage
          </CardTitle>
          <CardDescription>
            Explore the available endpoints for the {api.name}. 
            These paths are relative to your application's base URL (e.g., if your app is at <code>http://localhost:3000</code>, then <code>/api/greeting</code> would be <code>http://localhost:3000/api/greeting</code>).
            You can use tools like <code>curl</code>, Postman, or your browser's address bar (for GET requests) to interact with them once implemented.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {api.endpoints.length > 0 ? (
            api.endpoints.map((endpoint, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        endpoint.method === 'GET' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        endpoint.method === 'POST' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        endpoint.method === 'PUT' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                        endpoint.method === 'DELETE' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        'bg-gray-500 hover:bg-gray-600 text-white'
                      }
                    >
                      {endpoint.method}
                    </Badge>
                    <p className="font-mono text-sm font-semibold text-primary break-all">{endpoint.path}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{endpoint.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {endpoint.exampleRequest && (
                    <div>
                      <h4 className="text-xs font-semibold mb-1 text-foreground flex items-center">
                        <FileInput className="h-4 w-4 mr-1.5 text-accent" />
                        Example Request {endpoint.method === 'GET' ? 'Parameters' : 'Body'}:
                      </h4>
                      <CodeBlock 
                        code={endpoint.exampleRequest} 
                        language={endpoint.method === 'GET' ? 'text' : 'json'} 
                        className="text-xs" 
                      />
                    </div>
                  )}
                  
                  {endpoint.exampleResponse && (
                    <div className={!endpoint.exampleRequest ? 'md:col-span-2' : ''}>
                      <h4 className="text-xs font-semibold mb-1 text-foreground flex items-center">
                        <FileOutput className="h-4 w-4 mr-1.5 text-accent" />
                        Example Response:
                      </h4>
                      <CodeBlock code={endpoint.exampleResponse} language="json" className="text-xs" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No specific endpoints listed for this API here. Please refer to the documentation or define them.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
