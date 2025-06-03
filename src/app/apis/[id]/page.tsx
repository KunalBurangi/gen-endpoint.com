
"use client";

import { publicApis, type ApiDefinition } from '@/data/apis';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Terminal, Info, Layers, FileInput, FileOutput, Server, PlayCircle } from 'lucide-react';
import { InteractiveEndpoint } from './components/InteractiveEndpoint';
import { use } from 'react'; // Import React.use

interface ApiDetailPageProps {
  // According to the Next.js warning, params is (or will be) a Promise.
  // To correctly use React.use, the type should reflect this.
  params: Promise<{ id: string }>;
}

export default function ApiDetailPage({ params: paramsPromise }: ApiDetailPageProps) { // Renamed prop to paramsPromise
  // Unwrap the params promise using React.use
  // This hook will suspend the component if the promise is not yet resolved.
  const params = use(paramsPromise);

  const api = publicApis.find(a => a.id === params.id); // Use the resolved params

  if (!api) {
    notFound();
  }

  const { Icon } = api;
  const isExternalDoc = api.documentationUrl.startsWith('http://') || api.documentationUrl.startsWith('https://');

  const exampleEndpointPath = api.endpoints.length > 0 ? api.endpoints[0].path : '/api/example-endpoint';
  const exampleFullUrl = `https://gen-endpoint.com${exampleEndpointPath}`;

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
                    <Server className="mr-2 h-4 w-4" />
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
            Explore and interact with the available endpoints for the {api.name}. These API routes are live!
            The paths shown below are relative to your application's base URL. For example, if this application is hosted at <code>https://gen-endpoint.com</code>, an endpoint path for this API, such as <code>{exampleEndpointPath}</code>, would be accessible at <code>{exampleFullUrl}</code>.
            You can use the &quot;Try it out&quot; section for each endpoint or use tools like <code>curl</code>, Postman, or your browser&apos;s address bar (for GET requests) to interact with them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          {api.endpoints.length > 0 ? (
            api.endpoints.map((endpoint, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card shadow-md space-y-4">
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
                
                {(endpoint.exampleRequest || endpoint.exampleResponse) && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-accent hover:underline list-none flex items-center">
                      <Info className="h-4 w-4 mr-1.5 text-accent group-open:rotate-90 transition-transform"/> 
                      Show Static Examples
                    </summary>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-accent/30">
                      {endpoint.exampleRequest && (
                        <div>
                          <h4 className="text-xs font-semibold mb-1 text-foreground flex items-center">
                            <FileInput className="h-4 w-4 mr-1.5 text-accent" />
                            Example Request {endpoint.method === 'GET' ? 'Parameters' : 'Body'}:
                          </h4>
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all p-2 bg-muted/50 rounded-md border">
                            <code>{endpoint.exampleRequest}</code>
                          </pre>
                        </div>
                      )}
                      
                      {endpoint.exampleResponse && (
                        <div className={!endpoint.exampleRequest ? 'md:col-span-2' : ''}>
                          <h4 className="text-xs font-semibold mb-1 text-foreground flex items-center">
                            <FileOutput className="h-4 w-4 mr-1.5 text-accent" />
                            Example Response:
                          </h4>
                           <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all p-2 bg-muted/50 rounded-md border">
                            <code>{JSON.stringify(JSON.parse(endpoint.exampleResponse), null, 2)}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <Card className="bg-background/50 border-dashed border-primary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PlayCircle className="h-5 w-5 mr-2 text-primary" />
                      Try it out
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InteractiveEndpoint endpoint={endpoint} />
                  </CardContent>
                </Card>
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
    
