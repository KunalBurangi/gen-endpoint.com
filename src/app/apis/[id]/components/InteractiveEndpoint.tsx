
"use client";

import type { ApiEndpoint } from '@/data/apis';
import { useState, useEffect } from 'react';
import { getUserApiKey } from '@/app/generate/components/ApiKeyManager';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CodeBlock } from '@/components/CodeBlock';
import { Loader2, AlertCircle, ChevronRight, PlayCircle, Upload, X } from 'lucide-react'; // Added PlayCircle
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


interface InteractiveEndpointProps {
  endpoint: ApiEndpoint;
  isSimulationOnly?: boolean; // New prop for simulation mode
}

export function InteractiveEndpoint({ endpoint, isSimulationOnly = false }: InteractiveEndpointProps) {
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
    setSelectedFiles([]);
  }, [endpoint]);

  const isFileUploadEndpoint = endpoint.path.includes('/upload') || 
    (endpoint.exampleRequest && endpoint.exampleRequest.includes('FormData'));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    setStatusCode(null);

    if (isSimulationOnly) {
      // Simulate execution
      setTimeout(() => { // Add a small delay for UX
        setResponse(endpoint.exampleResponse);
        setStatusCode(200); // Mock success
        setIsLoading(false);
      }, 300);
      return;
    }

    // Real execution
    const options: RequestInit = {
      method: endpoint.method,
      headers: {},
    };

    const fetchPath = requestPath.startsWith('/api/') ? requestPath : `/api${requestPath.startsWith('/') ? '' : '/'}${requestPath}`;

    if (fetchPath.startsWith('/api/runtime/')) {
      const userApiKey = getUserApiKey();
      if (!userApiKey) {
        setError("Google AI API Key is required for this runtime endpoint. Please set it in the 'AI Key Manager' section on the Generate page.");
        setStatusCode(401); // Unauthorized
        setIsLoading(false);
        return;
      }
      (options.headers as Record<string, string>)['X-Goog-Api-Key'] = userApiKey;
    }

    // Handle file uploads
    if (isFileUploadEndpoint && selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      options.body = formData;
      // Don't set Content-Type for FormData - let browser set it with boundary
    } else if ((endpoint.method === 'POST' || endpoint.method === 'PUT') && requestBody) {
      (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
      options.body = requestBody;
    }

    let httpResponse: Response | null = null;
    try {
      httpResponse = await fetch(fetchPath, options);
      setStatusCode(httpResponse.status);

      if (!httpResponse.ok) {
        let errorBodyText: string;
        try {
          const errorData = await httpResponse.clone().json();
          errorBodyText = JSON.stringify(errorData, null, 2);
        } catch (jsonParseError) {
          try {
            errorBodyText = await httpResponse.text();
          } catch (textParseError) {
            errorBodyText = `Request failed with status ${httpResponse.status}, and error body could not be read.`;
          }
        }
        setError(errorBodyText);
      } else {
        let successBodyText: string;
        try {
            const successData = await httpResponse.clone().json();
            successBodyText = JSON.stringify(successData, null, 2);
        } catch (jsonParseError) {
            try {
                successBodyText = await httpResponse.text();
            } catch (textParseError) {
                successBodyText = `Request succeeded with status ${httpResponse.status}, but response body could not be read.`;
            }
        }
        setResponse(successBodyText);
      }
    } catch (err) {
      console.error("API call error:", err);
      let errorMessage = 'An unknown error occurred during the request.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setStatusCode(httpResponse ? httpResponse.status : null);
    } finally {
      setIsLoading(false);
    }
  };

  const isJsonString = (str: string) => {
    if (!str || typeof str !== 'string') return false;
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
        // keep original if not parsable
      }
  }

  const hasPathPlaceholders = endpoint.path.includes('{') && endpoint.path.includes('}');
  const isGetRequest = endpoint.method === 'GET';
  const showPathInput = isGetRequest || hasPathPlaceholders;

  let pathInputDescription = '';
  if (hasPathPlaceholders) {
    pathInputDescription += 'Replace placeholders (e.g., {userId}) with actual values in the path above. ';
  }
  if (isGetRequest && hasPathPlaceholders) {
    pathInputDescription += 'You can also add/edit query parameters (e.g., ?key=value).';
  } else if (isGetRequest) {
    pathInputDescription += 'You can add or change query parameters in the path above (e.g., ?name=User).';
  }


  return (
    <div className="space-y-4">
      {showPathInput && (
        <div className="space-y-1">
          <Label htmlFor={`requestPath-${endpoint.path}-${isSimulationOnly}`}>Request Path</Label>
          <Input
            id={`requestPath-${endpoint.path}-${isSimulationOnly}`}
            value={requestPath}
            onChange={(e) => setRequestPath(e.target.value)}
            placeholder={endpoint.path} 
            className="font-mono text-sm"
            disabled={isLoading}
          />
           {pathInputDescription && (
            <p className="text-xs text-muted-foreground">
              {pathInputDescription.trim()}
            </p>
          )}
        </div>
      )}

      {isFileUploadEndpoint && !isSimulationOnly && (
        <div className="space-y-2">
          <Label>File Upload</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Select files to upload</p>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id={`fileInput-${endpoint.path}`}
              accept="image/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`fileInput-${endpoint.path}`)?.click()}
              disabled={isLoading}
            >
              Choose Files
            </Button>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Selected Files ({selectedFiles.length})</Label>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.type}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(endpoint.method === 'POST' || endpoint.method === 'PUT') && !isFileUploadEndpoint && (
        <div className="space-y-1">
          <Label htmlFor={`requestBody-${endpoint.path}-${isSimulationOnly}`}>Request Body (JSON)</Label>
          <Textarea
            id={`requestBody-${endpoint.path}-${isSimulationOnly}`}
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={5}
            placeholder={isSimulationOnly ? 'Enter JSON body for simulation (not sent to a live server)' : 'e.g., { "name": "John Doe" }'}
            className="font-mono text-sm"
            disabled={isLoading}
          />
        </div>
      )}

      {isFileUploadEndpoint && isSimulationOnly && (
        <div className="space-y-1">
          <Label>File Upload (Simulation Mode)</Label>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              In simulation mode, this would upload files using FormData. The response below shows what a successful upload would return.
            </p>
          </div>
        </div>
      )}

      <Button 
        onClick={handleExecute} 
        disabled={isLoading || (isFileUploadEndpoint && !isSimulationOnly && selectedFiles.length === 0 ? true : false)}
        className="w-full sm:w-auto"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSimulationOnly ? 'Simulate & Show Example Response' : isFileUploadEndpoint ? 'Upload Files' : 'Execute'}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
      
      {isFileUploadEndpoint && !isSimulationOnly && selectedFiles.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Please select at least one file to upload.
        </p>
      )}

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
                 <CodeBlock code={error} language="text" className="text-xs border-destructive/30" />
            </CardContent>
        </Card>
      )}

      {response && (
         <Card className="border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-400/10">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Response {isSimulationOnly && "(Simulated)"}
                </CardTitle>
                {statusCode &&
                  <Badge
                    className={`text-xs ${statusCode >= 200 && statusCode < 300 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                  >
                    {statusCode} {isSimulationOnly && " (Simulated)"}
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

