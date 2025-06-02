
import { type LucideIcon, Smile, Activity, Database, Zap, Users, ShoppingCart, Lock, PackageSearch } from 'lucide-react';

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
        exampleResponse: '{"message": "Greetings, Bob! Your POST request was received.", "confirmationId": "post-12345", "receivedData": {"name": "Bob", "preferences": {"formal": false}}, "timestamp": "2024-08-15T10:02:00.000Z"}'
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
        exampleResponse: '{\n  "status": "operational",\n  "serviceName": "API Endpoint Explorer Backend",\n  "version": "1.2.3",\n  "uptimeSeconds": 18345,\n  "lastChecked": "2024-08-15T11:00:00.000Z"\n}'
      },
    ],
  },
  {
    id: 'echo-api',
    name: 'Echo API',
    description: 'Echoes back the data sent to it. Supports GET (query parameters) and POST (JSON or Text body). Useful for request inspection.',
    category: 'Utilities',
    documentationUrl: '/apis/echo-api',
    Icon: Zap,
    endpoints: [
      {
        method: 'GET',
        path: '/api/echo?text=Hello%20World&count=5&active=true',
        description: 'Echoes the query parameters provided in the request URL.',
        exampleRequest: '?text=Hello%20World&count=5&active=true',
        exampleResponse: '{\n  "type": "GET",\n  "queryParams": {\n    "text": "Hello World",\n    "count": "5",\n    "active": "true"\n  },\n  "message": "Query parameters echoed successfully.",\n  "headers": { "example-header": "example-value" },\n  "timestamp": "2024-08-15T12:00:00.000Z"\n}'
      },
      {
        method: 'POST',
        path: '/api/echo',
        description: 'Echoes the JSON or Text body sent in the request. Try sending non-JSON text too!',
        exampleRequest: '{\n  "user": {\n    "id": "user-789",\n    "role": "admin"\n  },\n  "operation": "echo_test"\n}',
        exampleResponse: '{\n  "type": "POST",\n  "receivedBody": {\n    "user": {\n      "id": "user-789",\n      "role": "admin"\n    },\n    "operation": "echo_test"\n  },\n  "message": "JSON body echoed successfully.",\n  "headers": { "example-header": "example-value" },\n  "timestamp": "2024-08-15T12:05:00.000Z"\n}'
      }
    ]
  },
  {
    id: 'user-management-api',
    name: 'User Management API',
    description: 'A comprehensive API for managing user accounts, including CRUD operations.',
    category: 'Application',
    documentationUrl: '/apis/user-management-api',
    Icon: Users,
    endpoints: [
      {
        method: 'GET',
        path: '/api/users',
        description: 'Retrieves a list of all users.',
        exampleResponse: '[\n  {"id": "usr_1", "name": "Alice Wonderland", "email": "alice@example.com", "role": "admin", "createdAt": "2024-01-10T10:00:00Z"},\n  {"id": "usr_2", "name": "Bob The Builder", "email": "bob@example.com", "role": "editor", "createdAt": "2024-01-11T11:00:00Z"}\n]'
      },
      {
        method: 'GET',
        path: '/api/users/{userId}',
        description: 'Retrieves a specific user by their ID. Replace {userId} with an actual ID like `usr_1`.',
        exampleRequest: 'Path parameter: /api/users/usr_1',
        exampleResponse: '{"id": "usr_1", "name": "Alice Wonderland", "email": "alice@example.com", "role": "admin", "createdAt": "2024-01-10T10:00:00Z", "profile": {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png" }}'
      },
      {
        method: 'POST',
        path: '/api/users',
        description: 'Creates a new user.',
        exampleRequest: '{\n  "name": "Charlie Brown",\n  "email": "charlie@example.com",\n  "password": "supersecretpassword",\n  "role": "viewer"\n}',
        exampleResponse: '{"id": "usr_3", "name": "Charlie Brown", "email": "charlie@example.com", "role": "viewer", "createdAt": "2024-08-16T14:30:00Z"}'
      },
      {
        method: 'PUT',
        path: '/api/users/{userId}',
        description: 'Updates an existing user by ID. Replace {userId} with an actual ID like `usr_1`.',
        exampleRequest: '{\n  "name": "Alice Wonderland",\n  "email": "alice.wonderland@example.com",\n  "role": "lead_admin"\n}',
        exampleResponse: '{"id": "usr_1", "name": "Alice Wonderland", "email": "alice.wonderland@example.com", "role": "lead_admin", "updatedAt": "2024-08-16T15:00:00Z"}'
      },
      {
        method: 'DELETE',
        path: '/api/users/{userId}',
        description: 'Deletes a user by ID. Replace {userId} with an actual ID like `usr_2`.',
        exampleResponse: '{"message": "User usr_2 deleted successfully.", "timestamp": "2024-08-16T15:30:00Z"}'
      }
    ]
  },
  {
    id: 'product-catalog-api',
    name: 'Product Catalog API',
    description: 'API for browsing and managing a product catalog.',
    category: 'E-commerce',
    documentationUrl: '/apis/product-catalog-api',
    Icon: ShoppingCart,
    endpoints: [
      {
        method: 'GET',
        path: '/api/products',
        description: 'Retrieves a list of all available products. Supports optional query parameters for filtering (e.g., ?category=electronics&inStock=true).',
        exampleRequest: 'Optional query: /api/products?category=Books',
        exampleResponse: '[\n  {"id": "prod_123", "name": "The Pragmatic Programmer", "category": "Books", "price": 29.99, "stock": 150, "imageUrl": "https://placehold.co/300x200.png", "description": "From journeyman to master."},\n  {"id": "prod_456", "name": "Wireless Noise-Cancelling Headphones", "category": "Electronics", "price": 199.99, "stock": 75, "imageUrl": "https://placehold.co/300x200.png", "description": "Immersive sound experience."}\n]'
      },
      {
        method: 'GET',
        path: '/api/products/{productId}',
        description: 'Retrieves details for a specific product by ID. Replace {productId} with an ID like `prod_123`.',
        exampleResponse: '{"id": "prod_123", "name": "The Pragmatic Programmer", "category": "Books", "price": 29.99, "stock": 150, "imageUrl": "https://placehold.co/300x200.png", "description": "From journeyman to master.", "details": {"pages": 352, "author": "David Thomas, Andrew Hunt"}, "reviews": [{"rating": 5, "comment": "A must-read!"}]}'
      },
      {
        method: 'POST',
        path: '/api/products',
        description: 'Adds a new product to the catalog (Admin only).',
        exampleRequest: '{\n  "name": "Ergonomic Mechanical Keyboard",\n  "category": "Electronics",\n  "price": 159.99,\n  "stock": 50,\n  "imageUrl": "https://placehold.co/300x200.png",\n  "description": "Clicky and comfortable."\n}',
        exampleResponse: '{"id": "prod_789", "name": "Ergonomic Mechanical Keyboard", "category": "Electronics", "price": 159.99, "stock": 50, "imageUrl": "https://placehold.co/300x200.png", "description": "Clicky and comfortable.", "createdAt": "2024-08-16T16:00:00Z"}'
      }
    ]
  },
  {
    id: 'auth-api',
    name: 'Authentication API',
    description: 'Simplified API for user authentication processes like login, logout, and status check.',
    category: 'Security',
    documentationUrl: '/apis/auth-api',
    Icon: Lock,
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticates a user and returns a session token.',
        exampleRequest: '{\n  "email": "alice@example.com",\n  "password": "securepassword123"\n}',
        exampleResponse: '{\n  "message": "Login successful.",\n  "user": {"id": "usr_1", "name": "Alice Wonderland", "email": "alice@example.com", "role": "admin"},\n  "token": "mock_jwt_token_string_12345",\n  "expiresAt": "2024-08-17T10:00:00Z"\n}'
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Logs out the current user and invalidates their session.',
        exampleResponse: '{"message": "Logout successful.", "timestamp": "2024-08-16T17:00:00Z"}'
      },
      {
        method: 'GET',
        path: '/api/auth/status',
        description: 'Checks the current authentication status of the user.',
        exampleResponse: '{\n  "isAuthenticated": true,\n  "user": {"id": "usr_1", "name": "Alice Wonderland", "email": "alice@example.com", "role": "admin"},\n  "checkedAt": "2024-08-16T17:05:00Z"\n}'
        // Or for unauthenticated:
        // exampleResponse: '{\n  "isAuthenticated": false,\n  "user": null,\n  "checkedAt": "2024-08-16T17:06:00Z"\n}'
      }
    ]
  }
];

// Update categories based on the defined APIs
export const apiCategories: string[] = Array.from(new Set(publicApis.map(api => api.category)));

// Placeholder for a function to get an API by ID, useful for detail pages
// This is not used by the current list page but would be for an API detail page.
export const getApiById = (id: string): ApiDefinition | undefined => {
  return publicApis.find(api => api.id === id);
};

