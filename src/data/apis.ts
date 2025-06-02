
import { type LucideIcon, Smile, Activity, Database, Zap } from 'lucide-react';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  exampleRequest?: string; // JSON string for body, or example query params
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
    description: 'A versatile API for generating greeting messages. Supports simple GET requests and POST requests with data.',
    category: 'Utilities',
    documentationUrl: '/apis/greeting-api',
    Icon: Smile,
    endpoints: [
      {
        method: 'GET',
        path: '/api/greeting',
        description: 'Returns a generic greeting message with API version.',
        exampleResponse: '{"message": "Hello from our API!", "version": "1.0.0", "timestamp": "2024-08-15T10:00:00.000Z"}'
      },
      {
        method: 'GET',
        path: '/api/greeting?name=Alice',
        description: 'Returns a personalized greeting message using a query parameter.',
        exampleRequest: '?name=Alice',
        exampleResponse: '{"message": "Hello, Alice, from our API!", "personalized": true, "timestamp": "2024-08-15T10:01:00.000Z"}'
      },
      {
        method: 'POST',
        path: '/api/greeting',
        description: 'Receives a name in the JSON body and returns a custom greeting.',
        exampleRequest: '{\n  "name": "Bob",\n  "preferences": {\n    "formal": false\n  }\n}',
        exampleResponse: '{"message": "Greetings, Bob! Your POST request was received.", "confirmationId": "post-12345", "timestamp": "2024-08-15T10:02:00.000Z"}'
      },
    ],
  },
  {
    id: 'status-api',
    name: 'System Status API',
    description: 'Provides the current operational status, version, and timestamp of the application. Ideal for health checks and monitoring.',
    category: 'System',
    documentationUrl: '/apis/status-api',
    Icon: Activity,
    endpoints: [
      {
        method: 'GET',
        path: '/api/status',
        description: 'Returns the current system status, service name, uptime (illustrative), and a timestamp.',
        exampleResponse: '{\n  "status": "operational",\n  "serviceName": "API Endpoint Explorer Backend",\n  "version": "1.2.3", \n  "uptimeSeconds": 18345,\n  "lastChecked": "2024-08-15T11:00:00.000Z"\n}'
      },
    ],
  },
  {
    id: 'echo-api',
    name: 'Echo API',
    description: 'Echoes back the data sent to it. Supports GET (query parameters) and POST (JSON body). Useful for request inspection.',
    category: 'Utilities',
    documentationUrl: '/apis/echo-api',
    Icon: Zap, // Changed from Database for more dynamism
    endpoints: [
      {
        method: 'GET',
        path: '/api/echo?text=Hello%20World&count=5&active=true',
        description: 'Echoes the query parameters provided in the request URL.',
        exampleRequest: '?text=Hello%20World&count=5&active=true',
        exampleResponse: '{\n  "type": "GET",\n  "queryParams": {\n    "text": "Hello World",\n    "count": "5",\n    "active": "true"\n  },\n  "message": "Query parameters echoed successfully.",\n  "timestamp": "2024-08-15T12:00:00.000Z"\n}'
      },
      {
        method: 'POST',
        path: '/api/echo',
        description: 'Echoes the JSON body sent in the request.',
        exampleRequest: '{\n  "user": {\n    "id": "user-789",\n    "role": "admin",\n    "preferences": {\n      "theme": "dark",\n      "notifications": true\n    }\n  },\n  "data": [10, 20, 30],\n  "operation": "echo_test"\n}',
        exampleResponse: '{\n  "type": "POST",\n  "receivedBody": {\n    "user": {\n      "id": "user-789",\n      "role": "admin",\n      "preferences": {\n        "theme": "dark",\n        "notifications": true\n      }\n    },\n    "data": [10, 20, 30],\n    "operation": "echo_test"\n  },\n  "message": "JSON body echoed successfully.",\n  "timestamp": "2024-08-15T12:05:00.000Z"\n}'
      }
    ]
  }
];

// Update categories based on the defined APIs
export const apiCategories: string[] = Array.from(new Set(publicApis.map(api => api.category)));
