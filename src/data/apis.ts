
import { type LucideIcon, Smile, Activity, Database } from 'lucide-react';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  exampleResponse: string; // JSON string
}

export interface ApiDefinition {
  id: string;
  name: string;
  description:string;
  category: string;
  documentationUrl: string; // For internal APIs, this can be the path to its detail page
  endpoints: ApiEndpoint[];
  Icon?: LucideIcon;
}

export const publicApis: ApiDefinition[] = [
  {
    id: 'greeting-api',
    name: 'Greeting API',
    description: 'A simple API that returns a greeting message. Illustrates basic GET requests with optional query parameters.',
    category: 'Utilities',
    documentationUrl: '/apis/greeting-api', // Points to its own detail page
    Icon: Smile,
    endpoints: [
      { 
        method: 'GET', 
        path: '/api/greeting', 
        description: 'Returns a generic greeting message.', 
        exampleResponse: '{"message": "Hello from our API!"}' 
      },
      { 
        method: 'GET', 
        path: '/api/greeting?name=User', 
        description: 'Returns a personalized greeting message using a query parameter.', 
        exampleResponse: '{"message": "Hello, User, from our API!"}' 
      },
    ],
  },
  {
    id: 'status-api',
    name: 'System Status API',
    description: 'Provides the current status and timestamp of the application. Useful for health checks.',
    category: 'System',
    documentationUrl: '/apis/status-api', // Points to its own detail page
    Icon: Activity,
    endpoints: [
      { 
        method: 'GET', 
        path: '/api/status', 
        description: 'Returns the current system status and a timestamp.', 
        // Note: The timestamp in the example is static. A real implementation would generate a dynamic timestamp.
        exampleResponse: '{"status": "ok", "timestamp": "2024-07-30T10:00:00.000Z"}' 
      },
    ],
  },
  // Example of a more complex API we could build out
  // {
  //   id: 'echo-api',
  //   name: 'Echo API',
  //   description: 'Echoes back the data sent to it. Supports GET (query params) and POST (JSON body).',
  //   category: 'Utilities',
  //   documentationUrl: '/apis/echo-api',
  //   Icon: Database, // Placeholder icon
  //   endpoints: [
  //     {
  //       method: 'GET',
  //       path: '/api/echo?message=HelloWorld',
  //       description: 'Echoes the message provided in the query parameter.',
  //       exampleResponse: '{"received_query_params": {"message": "HelloWorld"}}'
  //     },
  //     {
  //       method: 'POST',
  //       path: '/api/echo',
  //       description: 'Echoes the JSON body sent in the request.',
  //       exampleResponse: '{"received_body": {"your_key": "your_value"}}'
  //     }
  //   ]
  // }
];

// Update categories based on the defined APIs
export const apiCategories: string[] = Array.from(new Set(publicApis.map(api => api.category)));
