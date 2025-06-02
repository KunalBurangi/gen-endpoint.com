
"use client";

import type { ApiEndpoint } from '@/data/apis';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CodeBlock } from '@/components/CodeBlock';
import { Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


interface InteractiveEndpointProps {
  endpoint: ApiEndpoint;
}

export function InteractiveEndpoint({ endpoint }: InteractiveEndpointProps) {
  const [requestPath, setRequestPath] = useState(endpoint.path);
  const [requestBody, setRequestBody] = useState(
    (endpoint.method === 'POST' || endpoint.method === 'PUT') && endpoint.exampleRequest 
    ? endpoint.exampleRequest 
    : ''
  );
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Update requestPath if endpoint.path changes (e.g. on navigation)
  useEffect(() => {
    setRequestPath(endpoint.path);
    if ((endpoint.method === 'POST' || endpoint.method === 'PUT') && endpoint.exampleRequest) {
      setRequestBody(endpoint.exampleRequest);
    } else {
      setRequestBody('');
    }
    setResponse(null);
    setError(null);
    setIsLoading(false);
    setStatusCode(null);
  }, [endpoint]);

  const handleExecute = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    setStatusCode(null);

    const options: RequestInit = {
      method: endpoint.method,
      headers: {},
    };

    if ((endpoint.method === 'POST' || endpoint.method === 'PUT') && requestBody) {
      (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
      options.body = requestBody;
    }
    
    // Prepend /api if not already present, to ensure it hits our Next.js API routes
    const fetchPath = requestPath.startsWith('/api/') ? requestPath : `/api${requestPath.startsWith('/') ? '' : '/'}${requestPath}`;

    try {
      const res = await fetch(fetchPath, options);
      setStatusCode(res.status);
      const responseData = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(responseData, null, 2) || `Request failed with status ${res.status}`);
      } else {
        setResponse(JSON.stringify(responseData, null, 2));
      }
    } catch (err) {
      console.error("API call error:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatusCode(null); // Or a generic error code like 500
    } finally {
      setIsLoading(false);
    }
  };

  const isJsonString = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
  
  let exampleRequestBodyFormatted = requestBody;
  if ((endpoint.method === 'POST' || endpoint.method === 'PUT') && requestBody && isJsonString(requestBody)) {
      try {
        exampleRequestBodyFormatted = JSON.stringify(JSON.parse(requestBody), null, 2);
      } catch (e) {
        // keep original if not parsable, though it should be
      }
  }


  return (
    <div className="space-y-4">
      {endpoint.method === 'GET' && endpoint.path.includes('?') && (
        <div className="space-y-1">
          <Label htmlFor={`requestPath-${endpoint.path}`}>Request Path (with query params)</Label>
          <Input
            id={`requestPath-${endpoint.path}`}
            value={requestPath}
            onChange={(e) => setRequestPath(e.target.value)}
            placeholder="e.g., /greeting?name=User"
            className="font-mono text-sm"
            disabled={isLoading}
          />
           <p className="text-xs text-muted-foreground">
            For GET requests with parameters, modify the path above.
          </p>
        </div>
      )}

      {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
        <div className="space-y-1">
          <Label htmlFor={`requestBody-${endpoint.path}`}>Request Body (JSON)</Label>
          <Textarea
            id={`requestBody-${endpoint.path}`}
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={5}
            placeholder='e.g., { "name": "John Doe" }'
            className="font-mono text-sm"
            disabled={isLoading}
          />
        </div>
      )}

      <Button onClick={handleExecute} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Execute
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading response...</div>
      )}

      {error && (
        <Card className="border-destructive bg-destructive/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2"/> Error
                </CardTitle>
                {statusCode && <Badge variant="destructive" className="text-xs">{statusCode}</Badge>}
            </CardHeader>
            <CardContent>
                 <CodeBlock code={error} language="json" className="text-xs border-destructive/30" />
            </CardContent>
        </Card>
      )}

      {response && (
         <Card className="border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-400/10">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Response
                </CardTitle>
                {statusCode && 
                  <Badge 
                    className={`text-xs ${statusCode >= 200 && statusCode < 300 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                  >
                    {statusCode}
                  </Badge>
                }
            </CardHeader>
            <CardContent>
                <CodeBlock code={response} language="json" className="text-xs border-green-500/30 dark:border-green-400/30" />
            </CardContent>
        </Card>
      )}
    </div>
  );
}

    