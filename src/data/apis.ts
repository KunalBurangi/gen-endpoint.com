
import { type LucideIcon, Smile, Activity, Database, Zap, Users, ShoppingCart, Lock, PackageSearch, Upload, Search, Bell, BarChart3, FileText, MessageSquare, Webhook, Shield, MessageCircle, Clock, Link, QrCode, Smartphone, Download, ShoppingBag, Boxes, Edit3, FileDown, Trash2, List, Tag } from 'lucide-react';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
        description: 'Retrieves a list of users. Supports an optional `limit` query parameter (e.g., `?limit=5`) to control the number of users returned. If no limit is provided, all users are returned (up to the total of 25 mock users).',
        exampleRequest: 'Path: /api/users?limit=5',
        exampleResponse: JSON.stringify([
          {id: "usr_1", name: "Alice Wonderland", email: "alice@example.com", role: "admin", createdAt: "2024-01-10T10:00:00Z", profile: {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png"}},
          {id: "usr_2", name: "Bob The Builder", email: "bob@example.com", role: "editor", createdAt: "2024-01-11T11:00:00Z", profile: {"bio": "Can we fix it?", "avatarUrl": "https://placehold.co/100x100.png"}},
          {id: "usr_3", name: "Charlie Chaplin", email: "charlie@example.com", role: "viewer", createdAt: "2024-01-12T12:00:00Z", profile: {"bio": "A day without laughter is a day wasted.", "avatarUrl": "https://placehold.co/100x100.png"}},
          {id: "usr_4", name: "Diana Prince", email: "diana@example.com", role: "admin", createdAt: "2024-01-13T13:00:00Z", profile: {"bio": "Wonder Woman", "avatarUrl": "https://placehold.co/100x100.png"}},
          {id: "usr_5", name: "Edward Scissorhands", email: "edward@example.com", role: "viewer", createdAt: "2024-01-14T14:00:00Z", profile: {"bio": "I am not complete.", "avatarUrl": "https://placehold.co/100x100.png"}}
        ], null, 2)
      },
      {
        method: 'GET',
        path: '/api/users/{userId}',
        description: 'Retrieves a specific user by their ID. Replace {userId} with an actual ID like `usr_1`.',
        exampleRequest: '?userId=usr_1 (Path parameter example: /api/users/usr_1)',
        exampleResponse: '{"id": "usr_1", "name": "Alice Wonderland", "email": "alice@example.com", "role": "admin", "createdAt": "2024-01-10T10:00:00Z", "profile": {"bio": "Curiouser and curiouser!", "avatarUrl": "https://placehold.co/100x100.png" }}'
      },
      {
        method: 'POST',
        path: '/api/users',
        description: 'Creates a new user.',
        exampleRequest: '{\n  "name": "Charlie Brown",\n  "email": "charlie@example.com",\n  "password": "supersecretpassword",\n  "role": "viewer"\n}',
        exampleResponse: '{"id": "usr_new", "name": "Charlie Brown", "email": "charlie@example.com", "role": "viewer", "createdAt": "2024-08-16T14:30:00Z"}'
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
        description: 'Retrieves a list of products. Supports optional query parameters for filtering (e.g., `?category=electronics&inStock=true`) and `limit` to control the number of products returned (e.g., `?limit=1`). If no limit is provided, all products are returned (up to the total of 25 mock products).',
        exampleRequest: 'Path: /api/products?category=Books&limit=1',
        exampleResponse: '[\n  {"id": "prod_123", "name": "The Pragmatic Programmer", "category": "Books", "price": 29.99, "stock": 150, "imageUrl": "https://placehold.co/300x200.png", "description": "From journeyman to master.", "details": {"pages": 352, "author": "David Thomas, Andrew Hunt"}, "reviews": [{"rating": 5, "comment": "A must-read!"}]}\n]'
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
      }
    ]
  },
  {
    id: 'file-upload-api',
    name: 'File Upload & Management API',
    description: 'Handle file uploads, downloads, metadata, and bulk operations with validation.',
    category: 'Utilities',
    documentationUrl: '/apis/file-upload-api',
    Icon: Upload,
    endpoints: [
      {
        method: 'POST',
        path: '/api/upload',
        description: 'Upload single or multiple files with validation and metadata extraction.',
        exampleRequest: 'FormData with "files" field containing one or more files (e.g., document.pdf, image.jpg). Max 10MB per file.',
        exampleResponse: '{\n  "success": true,\n  "files": [\n    {\n      "id": "file_abc123",\n      "originalName": "document.pdf",\n      "filename": "file_abc123_document.pdf",\n      "size": 1024000,\n      "mimeType": "application/pdf",\n      "uploadedAt": "2024-08-16T10:00:00Z",\n      "url": "/api/files/file_abc123",\n      "downloadUrl": "/api/files/file_abc123/download"\n    }\n  ],\n  "uploaded": 1,\n  "message": "All 1 file(s) uploaded successfully"\n}'
      },
      {
        method: 'GET',
        path: '/api/files',
        description: 'List uploaded files with metadata and pagination support.',
        exampleRequest: '?page=1&limit=10&type=image&search=profile&sortBy=size&sortOrder=desc',
        exampleResponse: '{\n  "files": [\n    {\n      "id": "file_456",\n      "originalName": "profile-photo.jpg",\n      "size": 2048000,\n      "mimeType": "image/jpeg",\n      "uploadedAt": "2024-08-16T09:30:00Z",\n      "url": "/api/files/file_456",\n      "description": "Profile photo image",\n      "tags": ["image", "profile"]\n    }\n  ],\n  "pagination": {"page": 1, "limit": 10, "total": 1, "pages": 1, "hasNext": false, "hasPrev": false},\n  "statistics": {"totalFiles": 1, "totalSize": 2048000, "typeDistribution": {"image": 1}, "averageSize": 2048000}\n}'
      },
      {
        method: 'GET',
        path: '/api/files/{fileId}',
        description: 'Get file metadata by ID. Replace {fileId} with an actual ID like `file_123`.',
        exampleResponse: '{\n  "id": "file_123",\n  "originalName": "sample-document.pdf",\n  "filename": "file_123_sample-document.pdf",\n  "size": 1024000,\n  "mimeType": "application/pdf",\n  "uploadedAt": "2024-08-16T10:00:00Z",\n  "url": "/api/files/file_123",\n  "downloadUrl": "/api/files/file_123/download",\n  "description": "Sample PDF document for testing",\n  "tags": ["document", "sample"]\n}'
      },
      {
        method: 'PUT',
        path: '/api/files/{fileId}',
        description: 'Update file metadata (description, tags). Replace {fileId} with an ID like `file_123`.',
        exampleRequest: '{\n  "description": "Updated sample PDF document",\n  "tags": ["document", "sample", "updated"]\n}',
        exampleResponse: '{\n  "id": "file_123",\n  "originalName": "sample-document.pdf",\n  "size": 1024000,\n  "mimeType": "application/pdf",\n  "description": "Updated sample PDF document",\n  "tags": ["document", "sample", "updated"],\n  "updatedAt": "2024-08-17T10:00:00Z"\n}'
      },
      {
        method: 'DELETE',
        path: '/api/files/{fileId}',
        description: 'Delete uploaded file by ID. Replace {fileId} with an actual ID like `file_abc`.',
        exampleResponse: '{"message": "File file_abc deleted successfully.", "timestamp": "2024-08-16T11:00:00Z"}'
      },
      {
        method: 'GET',
        path: '/api/files/{fileId}/download',
        description: 'Download the actual file content. Replace {fileId} with an ID like `file_123`.',
        exampleResponse: 'File content of "sample-document.pdf" (actual binary data or text based on MIME type will be returned with appropriate headers).'
      },
      {
        method: 'POST',
        path: '/api/files/bulk',
        description: 'Perform bulk operations like delete or tag on multiple files.',
        exampleRequest: '{\n  "operation": "delete",\n  "fileIds": ["file_123", "file_456"]\n}',
        exampleResponse: '{\n  "operation": "delete",\n  "totalFiles": 2,\n  "successful": 2,\n  "failed": 0,\n  "errors": [],\n  "message": "Bulk delete completed: 2 successful, 0 failed"\n}'
      },
      {
        method: 'GET',
        path: '/api/files/bulk',
        description: 'Get information about available bulk operations and their parameters.',
        exampleResponse: '{\n  "endpoint": "/api/files/bulk",\n  "method": "POST",\n  "supportedOperations": [\n    {"operation": "delete", "description": "Delete multiple files"},\n    {"operation": "tag", "description": "Add tags to multiple files"}\n  ]\n}'
      }
    ]
  },
  {
    id: 'search-api',
    name: 'Advanced Search API',
    description: 'Demonstrates complex querying, filtering, sorting, and pagination with full-text search capabilities.',
    category: 'Data',
    documentationUrl: '/apis/search-api',
    Icon: Search,
    endpoints: [
      {
        method: 'GET',
        path: '/api/search',
        description: 'Multi-field search with filters, sorting, and pagination.',
        exampleRequest: '?q=javascript&category=books&sort=price&order=asc&page=1&limit=10',
        exampleResponse: '{\n  "results": [\n    {\n      "id": "prod_301",\n      "title": "JavaScript: The Good Parts",\n      "category": "Books",\n      "price": 25.99,\n      "relevanceScore": 0.95\n    }\n  ],\n  "pagination": {"page": 1, "limit": 10, "total": 156},\n  "filters": {"categories": ["Books", "Electronics"], "priceRange": {"min": 10, "max": 500}}\n}'
      },
      {
        method: 'POST',
        path: '/api/search/advanced',
        description: 'Complex search with nested filters, aggregations, and custom scoring.',
        exampleRequest: '{\n  "query": {\n    "text": "programming",\n    "filters": {\n      "category": ["Books", "Courses"],\n      "price": {"min": 20, "max": 100},\n      "rating": {"gte": 4.0}\n    }\n  },\n  "aggregations": ["category", "author", "price_range"]\n}',
        exampleResponse: '{\n  "results": [\n    {\n      "id": "prod_301",\n      "title": "JavaScript: The Good Parts",\n      "category": "Books",\n      "price": 25.99,\n      "relevanceScore": 0.95\n    },\n    {\n      "id": "course_101",\n      "title": "Advanced JavaScript Programming",\n      "category": "Courses",\n      "price": 89.99,\n      "relevanceScore": 0.87\n    }\n  ],\n  "aggregations": {\n    "category": {"Books": 45, "Courses": 23},\n    "price_range": {"20-50": 30, "50-100": 38}\n  },\n  "totalResults": 68\n}'
      },
      {
        method: 'GET',
        path: '/api/search/suggestions',
        description: 'Get search suggestions and autocomplete results.',
        exampleRequest: '?q=prog&limit=5',
        exampleResponse: '{\n  "suggestions": ["programming", "programs", "progress", "progressive", "programmer"],\n  "categories": ["Books", "Software", "Courses"]\n}'
      }
    ]
  },
  {
    id: 'notifications-api',
    name: 'Notification System API',
    description: 'Send emails, SMS, and push notifications with template support and delivery tracking.',
    category: 'Communication',
    documentationUrl: '/apis/notifications-api',
    Icon: Bell,
    endpoints: [
      {
        method: 'POST',
        path: '/api/notifications/email',
        description: 'Send email notification with template support.',
        exampleRequest: '{\n  "to": "user@example.com",\n  "template": "welcome",\n  "variables": {"name": "John", "appName": "Gen-Endpoint", "verificationUrl": "https://app.com/verify/123"},\n  "subject": "Welcome to our platform!"\n}',
        exampleResponse: '{\n  "id": "notif_123",\n  "type": "email",\n  "status": "queued",\n  "scheduledAt": "2024-08-16T12:00:00Z",\n  "estimatedDelivery": "2024-08-16T12:01:00Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/notifications/email',
        description: 'Get email notification history.',
        exampleRequest: '?status=delivered&limit=10',
        exampleResponse: '{\n  "notifications": [\n    {\n      "id": "notif_123",\n      "status": "delivered",\n      "recipient": "user@example.com",\n      "subject": "Welcome!",\n      "deliveredAt": "2024-08-16T12:01:15Z"\n    }\n  ],\n  "pagination": {"page": 1, "limit": 10, "total": 5}\n}'
      },
      {
        method: 'POST',
        path: '/api/notifications/push',
        description: 'Send push notification to devices.',
        exampleRequest: '{\n  "deviceTokens": ["token1", "token2"],\n  "title": "New Message",\n  "body": "You have a new message from Alice",\n  "data": {"messageId": "msg_456", "type": "chat"}\n}',
        exampleResponse: '{\n  "id": "notif_124",\n  "type": "push",\n  "status": "sent",\n  "deliveredTo": 2,\n  "failedDeliveries": 0\n}'
      },
       {
        method: 'GET',
        path: '/api/notifications/push',
        description: 'Get push notification history and stats.',
        exampleRequest: '?limit=10',
        exampleResponse: '{\n  "notifications": [\n    {\n      "id": "notif_124",\n      "title": "New Message",\n      "status": "sent",\n      "deliveredTo": 2,\n      "createdAt": "2024-08-16T12:05:00Z"\n    }\n  ],\n  "stats": {"totalSent": 10, "totalDelivered": 8, "successRate": 80}\n}'
      },
      {
        method: 'GET',
        path: '/api/notifications/templates',
        description: 'List available notification templates.',
        exampleResponse: '[\n  {\n    "id": "welcome",\n    "name": "Welcome Email",\n    "type": "email",\n    "variables": ["name", "verificationUrl"]\n  },\n  {\n    "id": "password_reset",\n    "name": "Password Reset",\n    "type": "email",\n    "variables": ["name", "resetUrl"]\n  }\n]'
      }
    ]
  },
  {
    id: 'analytics-api',
    name: 'Analytics & Metrics API',
    description: 'Track events, generate reports, and provide dashboard data with real-time metrics.',
    category: 'Analytics',
    documentationUrl: '/apis/analytics-api',
    Icon: BarChart3,
    endpoints: [
      {
        method: 'POST',
        path: '/api/analytics/track',
        description: 'Track user events and custom metrics.',
        exampleRequest: '{\n  "event": "page_view",\n  "userId": "usr_123",\n  "properties": {\n    "page": "/products",\n    "referrer": "google.com",\n    "device": "mobile"\n  },\n  "timestamp": "2024-08-16T12:00:00Z"\n}',
        exampleResponse: '{\n  "success": true,\n  "eventId": "evt_789",\n  "processed": true\n}'
      },
      {
        method: 'GET',
        path: '/api/analytics/track',
        description: 'Get recent tracked events for debugging.',
        exampleRequest: '?userId=usr_123&event=page_view&limit=10',
        exampleResponse: '{\n  "events": [\n    {\n      "id": "evt_789",\n      "event": "page_view",\n      "userId": "usr_123",\n      "timestamp": "2024-08-16T12:00:00Z",\n      "properties": {"page": "/products"}\n    }\n  ],\n  "total": 50, "filtered": 10\n}'
      },
      {
        method: 'GET',
        path: '/api/analytics/dashboard',
        description: 'Get dashboard metrics and KPIs for specified time range.',
        exampleRequest: '?period=7d&metrics=pageviews,users,conversions',
        exampleResponse: '{\n  "period": "7d",\n  "metrics": {\n    "pageviews": {"value": 15420, "change": "+12.5%"},\n    "uniqueUsers": {"value": 3254, "change": "+8.2%"},\n    "conversions": {"value": 89, "change": "-2.1%"}\n  },\n  "topPages": ["/products", "/home", "/about"]\n}'
      }
    ]
  },
  {
    id: 'data-export-api',
    name: 'Data Export API',
    description: 'Export data in various formats (CSV, JSON, XML) with filtering and field selection.',
    category: 'Data',
    documentationUrl: '/apis/data-export-api',
    Icon: FileDown,
    endpoints: [
      {
        method: 'POST',
        path: '/api/export/{format}',
        description: 'Request data export in CSV, JSON, or XML format. Replace {format} with "csv", "json", or "xml".',
        exampleRequest: 'Path: /api/export/csv\nBody: {\n  "entity": "users",\n  "filters": {"role": "admin"},\n  "fields": ["name", "email", "createdAt"]\n}',
        exampleResponse: '{\n  "jobId": "export_123",\n  "status": "processing",\n  "format": "csv",\n  "entity": "users",\n  "totalRecords": 150,\n  "estimatedCompletion": "2024-08-16T12:05:00Z",\n  "statusUrl": "/api/export/status/export_123"\n}'
      },
      {
        method: 'GET',
        path: '/api/export/{format}',
        description: 'Get information about the specified export format. Replace {format} with "csv", "json", or "xml".',
        exampleResponse: '{\n  "format": "csv",\n  "mimeType": "text/csv",\n  "description": "Comma-separated values format",\n  "supportedEntities": ["users", "products", "orders"]\n}'
      },
      {
        method: 'GET',
        path: '/api/export/status/{jobId}',
        description: 'Check export job status and get download link if completed. Replace {jobId} with an actual job ID like `export_123`.',
        exampleResponse: '{\n  "id": "export_123",\n  "format": "csv",\n  "entity": "users",\n  "status": "completed",\n  "totalRecords": 150,\n  "createdAt": "2024-08-16T12:00:00Z",\n  "completedAt": "2024-08-16T12:04:30Z",\n  "downloadUrl": "/api/export/download/export_123",\n  "fileSize": 2048000,\n  "filename": "users-export-2024-08-16.csv",\n  "mimeType": "text/csv"\n}'
      },
      {
        method: 'DELETE',
        path: '/api/export/status/{jobId}',
        description: 'Cancel an export job. Replace {jobId} with an actual job ID.',
        exampleResponse: '{\n  "message": "Export job export_456 cancelled successfully",\n  "jobId": "export_456",\n  "status": "cancelled"\n}'
      }
    ]
  },
  {
    id: 'cart-api',
    name: 'Shopping Cart API',
    description: 'Manage shopping cart operations with session handling, item management, and checkout preparation.',
    category: 'E-commerce',
    documentationUrl: '/apis/cart-api',
    Icon: ShoppingBag,
    endpoints: [
      {
        method: 'GET',
        path: '/api/cart/{sessionId}',
        description: 'Get cart contents for session with item details and totals. Replace {sessionId} with an actual session ID (e.g., sess_123).',
        exampleResponse: '{\n  "sessionId": "sess_123",\n  "items": [\n    {\n      "id": "item_1",\n      "productId": "prod_123",\n      "name": "Wireless Headphones",\n      "price": 99.99,\n      "quantity": 2,\n      "options": {"color": "black", "size": "standard"},\n      "imageUrl": "https://placehold.co/100x100.png",\n      "subtotal": 199.98,\n      "addedAt": "2024-08-16T12:00:00Z"\n    }\n  ],\n  "totals": {"subtotal": 199.98, "tax": 16.00, "shipping": 0.00, "discount": 0, "total": 215.98},\n  "createdAt": "2024-08-16T12:00:00Z",\n  "updatedAt": "2024-08-16T12:00:00Z",\n  "expiresAt": "2024-08-17T12:00:00Z"\n}'
      },
      {
        method: 'POST',
        path: '/api/cart/{sessionId}/items',
        description: 'Add an item to the cart. Replace {sessionId} with a session ID.',
        exampleRequest: '{\n  "productId": "prod_456",\n  "quantity": 1,\n  "options": {"format": "paperback"}\n}',
        exampleResponse: '{\n  "success": true,\n  "item": {\n    "id": "item_randomId",\n    "productId": "prod_456",\n    "name": "JavaScript Book",\n    "price": 29.99,\n    "quantity": 1,\n    "options": {"format": "paperback"},\n    "imageUrl": "https://placehold.co/100x100.png",\n    "subtotal": 29.99,\n    "addedAt": "2024-08-17T10:00:00Z"\n  },\n  "cartTotal": 245.97,\n  "itemCount": 3\n}'
      },
      {
        method: 'GET',
        path: '/api/cart/{sessionId}/items',
        description: 'List all items in the specified cart. Replace {sessionId} with a session ID.',
        exampleResponse: '{\n  "items": [\n    {\n      "id": "item_1",\n      "productId": "prod_123",\n      "name": "Wireless Headphones",\n      "price": 99.99,\n      "quantity": 2, \n      "options": {"color": "black"},\n      "subtotal": 199.98\n    }\n  ],\n  "itemCount": 2,\n  "totals": {"subtotal": 199.98, "tax": 16.00, "shipping": 0.00, "discount": 0, "total": 215.98}\n}'
      },
      {
        method: 'PUT',
        path: '/api/cart/{sessionId}',
        description: 'Update cart metadata, e.g., apply a coupon code. Replace {sessionId} with a session ID.',
        exampleRequest: '{\n  "couponCode": "SAVE10"\n}',
        exampleResponse: '{\n  "sessionId": "sess_123",\n  "items": [{"id": "item_1", "name": "Wireless Headphones", "quantity": 2, "subtotal": 199.98}],\n  "totals": {"subtotal": 199.98, "tax": 16.00, "shipping": 0.00, "discount": 20.00, "total": 195.98},\n  "couponCode": "SAVE10",\n  "updatedAt": "2024-08-17T11:00:00Z"\n}'
      },
      {
        method: 'DELETE',
        path: '/api/cart/{sessionId}',
        description: 'Clear all items from the cart. Replace {sessionId} with a session ID.',
        exampleResponse: '{\n  "message": "Cart cleared successfully",\n  "timestamp": "2024-08-17T11:05:00Z"\n}'
      }
    ]
  },
  {
    id: 'payment-api',
    name: 'Payment Processing API',
    description: 'Handle payment flows, refunds, and transaction history with multiple payment methods.',
    category: 'E-commerce',
    documentationUrl: '/apis/payment-api',
    Icon: Lock,
    endpoints: [
      {
        method: 'POST',
        path: '/api/payments/process',
        description: 'Process payment with validation and fraud detection.',
        exampleRequest: '{\n  "amount": 99.99,\n  "currency": "USD",\n  "paymentMethod": {\n    "type": "card",\n    "token": "pm_1234567890"\n  },\n  "orderId": "order_123",\n  "billingAddress": {\n    "street": "123 Main St",\n    "city": "Anytown",\n    "state": "CA",\n    "zipCode": "12345",\n    "country": "US"\n  }\n}',
        exampleResponse: '{\n  "paymentId": "pay_789",\n  "status": "succeeded",\n  "amount": 99.99,\n  "currency": "USD",\n  "transactionId": "txn_456",\n  "processedAt": "2024-08-16T12:00:00Z"\n}'
      },
      {
        method: 'POST',
        path: '/api/payments/{paymentId}/refund',
        description: 'Process full or partial refund for payment.',
        exampleRequest: '{\n  "amount": 49.99,\n  "reason": "customer_request",\n  "refundId": "ref_123"\n}',
        exampleResponse: '{\n  "refundId": "ref_123",\n  "status": "processing",\n  "amount": 49.99,\n  "originalPayment": "pay_789",\n  "estimatedCompletion": "2024-08-19T12:00:00Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/payments/history',
        description: 'Get payment transaction history with filtering.',
        exampleRequest: '?userId=usr_123&status=succeeded&limit=10&page=1',
        exampleResponse: '{\n  "payments": [\n    {\n      "id": "pay_789",\n      "amount": 99.99,\n      "status": "succeeded",\n      "createdAt": "2024-08-16T12:00:00Z"\n    }\n  ],\n  "pagination": {"page": 1, "limit": 10, "total": 25}\n}'
      }
    ]
  },
  {
    id: 'inventory-api',
    name: 'Inventory Management API',
    description: 'Track stock levels, handle reservations, manage warehouses, and process stock adjustments.',
    category: 'E-commerce',
    documentationUrl: '/apis/inventory-api',
    Icon: Boxes,
    endpoints: [
      {
        method: 'GET',
        path: '/api/inventory/{productId}',
        description: 'Get current stock levels and availability across warehouses.',
        exampleResponse: '{\n  "productId": "prod_123",\n  "totalStock": 150,\n  "reserved": 25,\n  "available": 125,\n  "warehouses": [\n    {"id": "wh_1", "location": "NYC", "stock": 75},\n    {"id": "wh_2", "location": "LA", "stock": 75}\n  ],\n  "lowStockThreshold": 20\n}'
      },
      {
        method: 'POST',
        path: '/api/inventory/reserve',
        description: 'Reserve items for orders with automatic expiration.',
        exampleRequest: '{\n  "items": [\n    {"productId": "prod_123", "quantity": 2, "warehouseId": "wh_1"}\n  ],\n  "orderId": "order_456",\n  "expiresAt": "2024-08-16T13:00:00Z"\n}',
        exampleResponse: '{\n  "reservationId": "res_789",\n  "status": "confirmed",\n  "items": [\n    {"productId": "prod_123", "quantity": 2, "reserved": true}\n  ],\n  "expiresAt": "2024-08-16T13:00:00Z"\n}'
      },
      {
        method: 'PUT',
        path: '/api/inventory/adjust',
        description: 'Adjust stock levels with reason tracking.',
        exampleRequest: '{\n  "productId": "prod_123",\n  "adjustment": -5,\n  "reason": "damaged_goods",\n  "warehouseId": "wh_1",\n  "notes": "Water damage during storage"\n}',
        exampleResponse: '{\n  "success": true,\n  "productId": "prod_123",\n  "previousStock": 150,\n  "newStock": 145,\n  "adjustmentId": "adj_321"\n}'
      }
    ]
  },
  {
    id: 'blog-api',
    name: 'Blog & CMS API',
    description: 'Manage blog posts, categories, tags, content publishing, and SEO metadata.',
    category: 'Content',
    documentationUrl: '/apis/blog-api',
    Icon: Edit3,
    endpoints: [
      {
        method: 'GET',
        path: '/api/posts',
        description: 'List blog posts with pagination, filtering (status, category, search), and sorting.',
        exampleRequest: '?status=published&category=tech&page=1&limit=10&search=javascript',
        exampleResponse: '{\n  "posts": [\n    {\n      "id": "post_123",\n      "title": "Getting Started with JavaScript",\n      "slug": "getting-started-javascript",\n      "excerpt": "Learn the basics of JavaScript programming...",\n      "author": {"id": "usr_1", "name": "Alice Wonderland"},\n      "publishedAt": "2024-08-15T10:00:00Z",\n      "readTime": "5 min"\n    }\n  ],\n  "pagination": {"page": 1, "limit": 10, "total": 45}\n}'
      },
      {
        method: 'POST',
        path: '/api/posts',
        description: 'Create new blog post with SEO metadata.',
        exampleRequest: '{\n  "title": "Advanced React Patterns",\n  "content": "# Advanced React Patterns - In this post we explore advanced React development patterns including render props, compound components, and custom hooks.",\n  "excerpt": "Explore advanced patterns in React development",\n  "categoryId": "cat_1",\n  "tags": ["react", "javascript", "frontend"],\n  "seo": {"metaDescription": "Learn advanced React patterns", "keywords": ["react", "patterns"]}\n}',
        exampleResponse: '{\n  "id": "post_124",\n  "title": "Advanced React Patterns",\n  "slug": "advanced-react-patterns",\n  "status": "draft",\n  "createdAt": "2024-08-16T12:00:00Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/posts/{slug}',
        description: 'Get single post by slug with full content. Replace {slug} with an actual post slug like "getting-started-javascript".',
        exampleResponse: '{\n  "id": "post_123",\n  "title": "Getting Started with JavaScript",\n  "content": "# Getting Started with JavaScript - A versatile programming language used for web development.",\n  "author": {"id": "usr_1", "name": "Alice Wonderland"},\n  "publishedAt": "2024-08-15T10:00:00Z",\n  "views": 1250,\n  "likes": 89\n}'
      },
      {
        method: 'GET',
        path: '/api/categories',
        description: 'List post categories and tags with post counts.',
        Icon: Tag,
        exampleResponse: '{\n  "categories": [\n    {"id": "cat_1", "name": "Technology", "slug": "tech", "postCount": 25},\n    {"id": "cat_2", "name": "Design", "slug": "design", "postCount": 18}\n  ],\n  "tags": [\n    {"name": "javascript", "count": 15},\n    {"name": "react", "count": 12}\n  ]\n}'
      }
    ]
  },
  {
    id: 'comments-api',
    name: 'Comments & Reviews API',
    description: 'Handle user comments, reviews, ratings, moderation, and threaded discussions.',
    category: 'Social',
    documentationUrl: '/apis/comments-api',
    Icon: MessageSquare,
    endpoints: [
      {
        method: 'POST',
        path: '/api/comments',
        description: 'Create new comment or review with rating.',
        exampleRequest: '{\n  "resourceType": "post",\n  "resourceId": "post_123",\n  "content": "Great article! Very helpful.",\n  "rating": 5,\n  "parentId": null\n}',
        exampleResponse: '{\n  "id": "comment_456",\n  "content": "Great article! Very helpful.",\n  "author": {"id": "usr_2", "name": "Bob Builder"},\n  "rating": 5,\n  "status": "pending_moderation",\n  "createdAt": "2024-08-16T12:00:00Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/comments/{resourceId}',
        description: 'Get comments for resource with threading and pagination.',
        exampleRequest: '?resourceType=post&sort=newest&page=1&limit=20',
        exampleResponse: '{\n  "comments": [\n    {\n      "id": "comment_456",\n      "content": "Great article!",\n      "author": {"name": "Bob Builder", "avatar": "https://placehold.co/40x40.png"},\n      "rating": 5,\n      "replies": [],\n      "createdAt": "2024-08-16T12:00:00Z"\n    }\n  ],\n  "summary": {"total": 45, "averageRating": 4.2}\n}'
      },
      {
        method: 'PUT',
        path: '/api/comments/{commentId}/moderate',
        description: 'Moderate comment - approve, reject, or flag.',
        exampleRequest: '{\n  "action": "approve",\n  "moderatorNote": "Content appropriate"\n}',
        exampleResponse: '{\n  "id": "comment_456",\n  "status": "approved",\n  "moderatedAt": "2024-08-16T12:05:00Z",\n  "moderatedBy": "usr_1"\n}'
      }
    ]
  },
  {
    id: 'webhooks-api',
    name: 'Webhook Management API',
    description: 'Register, manage, test webhook endpoints, and track delivery attempts with retry logic.',
    category: 'Integration',
    documentationUrl: '/apis/webhooks-api',
    Icon: Webhook,
    endpoints: [
      {
        method: 'POST',
        path: '/api/webhooks',
        description: 'Register new webhook endpoint with event subscriptions.',
        exampleRequest: '{\n  "url": "https://api.example.com/webhooks/orders",\n  "events": ["order.created", "order.updated", "payment.completed"],\n  "secret": "whsec_1234567890",\n  "description": "Order processing webhook"\n}',
        exampleResponse: '{\n  "id": "wh_789",\n  "url": "https://api.example.com/webhooks/orders",\n  "events": ["order.created", "order.updated", "payment.completed"],\n  "status": "active",\n  "createdAt": "2024-08-16T12:00:00Z"\n}'
      },
      {
        method: 'POST',
        path: '/api/webhooks/{webhookId}/test',
        description: 'Test webhook delivery with sample payload.',
        exampleRequest: '{\n  "event": "order.created",\n  "testPayload": {\n    "orderId": "order_123",\n    "amount": 99.99\n  }\n}',
        exampleResponse: '{\n  "testId": "test_456",\n  "status": "success",\n  "responseCode": 200,\n  "responseTime": 250,\n  "deliveredAt": "2024-08-16T12:01:00Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/webhooks/logs',
        description: 'Get webhook delivery logs with filtering and status.',
        exampleRequest: '?webhookId=wh_789&status=failed&limit=50',
        exampleResponse: '{\n  "logs": [\n    {\n      "id": "log_123",\n      "webhookId": "wh_789",\n      "event": "order.created",\n      "status": "failed",\n      "responseCode": 500,\n      "attempts": 3,\n      "nextRetry": "2024-08-16T12:15:00Z"\n    }\n  ]\n}'
      }
    ]
  },
  {
    id: 'rate-limit-api',
    name: 'Rate Limiting API',
    description: 'Demonstrate rate limiting patterns, quota management, and different tier restrictions.',
    category: 'Security',
    documentationUrl: '/apis/rate-limit-api',
    Icon: Shield,
    endpoints: [
      {
        method: 'GET',
        path: '/api/limited/basic',
        description: 'Basic rate limited endpoint (10 requests per minute).',
        exampleResponse: '{\n  "message": "Basic tier response",\n  "data": {"timestamp": "2024-08-16T12:00:00Z"},\n  "rateLimit": {\n    "limit": 10,\n    "remaining": 7,\n    "resetAt": "2024-08-16T12:01:00Z"\n  }\n}'
      },
      {
        method: 'GET',
        path: '/api/limited/premium',
        description: 'Premium rate limited endpoint (100 requests per minute).',
        exampleResponse: '{\n  "message": "Premium tier response",\n  "data": {"enhanced": true, "timestamp": "2024-08-16T12:00:00Z"},\n  "rateLimit": {\n    "limit": 100,\n    "remaining": 89,\n    "resetAt": "2024-08-16T12:01:00Z"\n  }\n}'
      },
      {
        method: 'GET',
        path: '/api/quota/status',
        description: 'Check current quota usage across all endpoints.',
        exampleResponse: '{\n  "userId": "usr_123",\n  "plan": "premium",\n  "quotas": {\n    "api_calls": {"used": 1250, "limit": 10000, "resetDate": "2024-09-01"},\n    "file_uploads": {"used": 45, "limit": 100, "resetDate": "2024-09-01"}\n  }\n}'
      }
    ]
  },
  {
    id: 'chat-api',
    name: 'Real-time Chat API',
    description: 'WebSocket-based chat with rooms, typing indicators, message history, and user presence.',
    category: 'Communication',
    documentationUrl: '/apis/chat-api',
    Icon: MessageCircle,
    endpoints: [
      {
        method: 'GET',
        path: '/api/chat/rooms',
        description: 'List available chat rooms with participant counts.',
        exampleResponse: '[\n  {\n    "id": "room_1",\n    "name": "General Discussion",\n    "description": "Main chat room for all users",\n    "participants": 45,\n    "lastActivity": "2024-08-16T12:00:00Z",\n    "type": "public"\n  },\n  {\n    "id": "room_2",\n    "name": "Tech Support",\n    "description": "Get help with technical issues",\n    "participants": 12,\n    "lastActivity": "2024-08-16T11:30:00Z",\n    "type": "public"\n  }\n]'
      },
      {
        method: 'POST',
        path: '/api/chat/rooms',
        description: 'Create new chat room with customizable settings.',
        exampleRequest: '{\n  "name": "Project Alpha",\n  "description": "Discussion for Project Alpha team",\n  "type": "private",\n  "maxParticipants": 20\n}',
        exampleResponse: '{\n  "id": "room_3",\n  "name": "Project Alpha",\n  "description": "Discussion for Project Alpha team",\n  "type": "private",\n  "createdAt": "2024-08-16T12:00:00Z",\n  "createdBy": "usr_1"\n}'
      },
      {
        method: 'GET',
        path: '/api/chat/rooms/{roomId}/messages',
        description: 'Get message history for room with pagination.',
        exampleRequest: '?page=1&limit=50&before=2024-08-16T12:00:00Z',
        exampleResponse: '{\n  "messages": [\n    {\n      "id": "msg_123",\n      "content": "Hello everyone!",\n      "author": {"id": "usr_1", "name": "Alice", "avatar": "https://placehold.co/40x40.png"},\n      "timestamp": "2024-08-16T11:58:00Z",\n      "type": "text"\n    }\n  ],\n  "pagination": {"page": 1, "limit": 50, "hasMore": true}\n}'
      },
      {
        method: 'POST',
        path: '/api/chat/rooms/{roomId}/messages',
        description: 'Send message to chat room.',
        exampleRequest: '{\n  "content": "How is everyone doing?",\n  "type": "text",\n  "replyTo": null\n}',
        exampleResponse: '{\n  "id": "msg_124",\n  "content": "How is everyone doing?",\n  "author": {"id": "usr_2", "name": "Bob"},\n  "timestamp": "2024-08-16T12:00:00Z",\n  "roomId": "room_1"\n}'
      }
    ]
  },
  {
    id: 'jobs-api',
    name: 'Background Jobs API',
    description: 'Queue and monitor long-running background tasks with progress tracking and retry logic.',
    category: 'System',
    documentationUrl: '/apis/jobs-api',
    Icon: Clock,
    endpoints: [
      {
        method: 'POST',
        path: '/api/jobs',
        description: 'Queue new background job with parameters.',
        exampleRequest: '{\n  "type": "data_export",\n  "parameters": {\n    "format": "csv",\n    "entity": "users",\n    "filters": {"role": "admin"}\n  },\n  "priority": "normal",\n  "scheduledAt": "2024-08-16T13:00:00Z"\n}',
        exampleResponse: '{\n  "id": "job_789",\n  "type": "data_export",\n  "status": "queued",\n  "priority": "normal",\n  "queuePosition": 3,\n  "estimatedStartTime": "2024-08-16T12:05:00Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/jobs/{jobId}',
        description: 'Get job status, progress, and results.',
        exampleResponse: '{\n  "id": "job_789",\n  "type": "data_export",\n  "status": "completed",\n  "progress": 100,\n  "startedAt": "2024-08-16T12:03:00Z",\n  "completedAt": "2024-08-16T12:08:00Z",\n  "result": {\n    "downloadUrl": "/api/downloads/export_789.csv",\n    "recordsProcessed": 1500\n  }\n}'
      },
      {
        method: 'GET',
        path: '/api/jobs',
        description: 'List jobs with status filtering and pagination.',
        exampleRequest: '?status=running&type=data_export&page=1&limit=20',
        exampleResponse: '{\n  "jobs": [\n    {\n      "id": "job_790",\n      "type": "data_export",\n      "status": "running",\n      "progress": 45,\n      "startedAt": "2024-08-16T12:10:00Z"\n    }\n  ],\n  "pagination": {"page": 1, "limit": 20, "total": 156}\n}'
      },
      {
        method: 'DELETE',
        path: '/api/jobs/{jobId}',
        description: 'Cancel queued or running job.',
        exampleResponse: '{\n  "id": "job_791",\n  "status": "cancelled",\n  "cancelledAt": "2024-08-16T12:15:00Z",\n  "reason": "user_requested"\n}'
      }
    ]
  },
  {
    id: 'url-shortener-api',
    name: 'URL Shortener API',
    description: 'Create and manage shortened URLs with click tracking, expiration, and custom aliases.',
    category: 'Utilities',
    documentationUrl: '/apis/url-shortener-api',
    Icon: Link,
    endpoints: [
      {
        method: 'POST',
        path: '/api/shorten',
        description: 'Create shortened URL with optional custom alias and expiration.',
        exampleRequest: '{\n  "originalUrl": "https://www.example.com/very/long/path/to/content",\n  "customAlias": "my-link",\n  "expiresAt": "2024-12-31T23:59:59Z",\n  "description": "Link to important content"\n}',
        exampleResponse: '{\n  "id": "link_123",\n  "shortUrl": "https://short.ly/my-link",\n  "originalUrl": "https://www.example.com/very/long/path/to/content",\n  "shortCode": "my-link",\n  "createdAt": "2024-08-16T12:00:00Z",\n  "expiresAt": "2024-12-31T23:59:59Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/stats/{shortCode}',
        description: 'Get click statistics and analytics for shortened URL.',
        exampleResponse: '{\n  "shortCode": "my-link",\n  "originalUrl": "https://www.example.com/very/long/path/to/content",\n  "totalClicks": 1250,\n  "uniqueClicks": 892,\n  "clicksByDate": [\n    {"date": "2024-08-15", "clicks": 45},\n    {"date": "2024-08-16", "clicks": 67}\n  ],\n  "topReferrers": ["google.com", "twitter.com", "facebook.com"],\n  "countries": [{"code": "US", "name": "United States", "clicks": 678}]\n}'
      },
      {
        method: 'GET',
        path: '/api/links',
        description: 'List user\'s shortened URLs with filtering.',
        exampleRequest: '?status=active&sort=created_desc&page=1&limit=10',
        exampleResponse: '{\n  "links": [\n    {\n      "id": "link_123",\n      "shortCode": "my-link",\n      "originalUrl": "https://www.example.com/very/long/path/to/content",\n      "totalClicks": 1250,\n      "status": "active",\n      "createdAt": "2024-08-16T12:00:00Z"\n    }\n  ],\n  "pagination": {"page": 1, "limit": 10, "total": 45}\n}'
      },
      {
        method: 'DELETE',
        path: '/api/links/{linkId}',
        description: 'Delete shortened URL and disable access.',
        exampleResponse: '{\n  "message": "Link link_123 deleted successfully",\n  "deletedAt": "2024-08-16T12:30:00Z"\n}'
      }
    ]
  },
  {
    id: 'qr-api',
    name: 'QR Code Generator API',
    description: 'Generate QR codes for text, URLs, and structured data with customizable styling.',
    category: 'Utilities',
    documentationUrl: '/apis/qr-api',
    Icon: QrCode,
    endpoints: [
      {
        method: 'POST',
        path: '/api/qr/generate',
        description: 'Generate QR code image with customizable options.',
        exampleRequest: '{\n  "data": "https://www.example.com",\n  "size": 256,\n  "format": "png",\n  "errorCorrection": "M",\n  "foregroundColor": "#000000",\n  "backgroundColor": "#FFFFFF",\n  "margin": 4\n}',
        exampleResponse: '{\n  "id": "qr_456",\n  "imageUrl": "/api/qr/qr_456/image.png",\n  "data": "https://www.example.com",\n  "size": 256,\n  "format": "png",\n  "createdAt": "2024-08-16T12:00:00Z"\n}'
      },
      {
        method: 'GET',
        path: '/api/qr/{qrId}',
        description: 'Get QR code metadata and download links.',
        exampleResponse: '{\n  "id": "qr_456",\n  "data": "https://www.example.com",\n  "imageUrl": "/api/qr/qr_456/image.png",\n  "downloadUrls": {\n    "png": "/api/qr/qr_456/download.png",\n    "svg": "/api/qr/qr_456/download.svg",\n    "pdf": "/api/qr/qr_456/download.pdf"\n  },\n  "scanCount": 45,\n  "createdAt": "2024-08-16T12:00:00Z"\n}'
      },
      {
        method: 'POST',
        path: '/api/qr/batch',
        description: 'Generate multiple QR codes in batch.',
        exampleRequest: '{\n  "codes": [\n    {"data": "https://example.com/page1", "filename": "page1"},\n    {"data": "https://example.com/page2", "filename": "page2"}\n  ],\n  "format": "png",\n  "size": 256\n}',
        exampleResponse: '{\n  "batchId": "batch_789",\n  "status": "processing",\n  "totalCodes": 2,\n  "estimatedCompletion": "2024-08-16T12:02:00Z"\n}'
      }
    ]
  },
  {
    id: 'device-api',
    name: 'Device Management API',
    description: 'Register and manage mobile devices, push tokens, preferences, and device analytics.',
    category: 'Mobile',
    documentationUrl: '/apis/device-api',
    Icon: Smartphone,
    endpoints: [
      {
        method: 'POST',
        path: '/api/devices/register',
        description: 'Register new device with platform and capabilities.',
        exampleRequest: '{\n  "deviceId": "device_abc123",\n  "platform": "ios",\n  "osVersion": "17.0",\n  "appVersion": "1.2.3",\n  "pushToken": "apns_token_123",\n  "deviceInfo": {\n    "model": "iPhone 15 Pro",\n    "manufacturer": "Apple"\n  }\n}',
        exampleResponse: '{\n  "id": "dev_789",\n  "deviceId": "device_abc123",\n  "platform": "ios",\n  "status": "active",\n  "registeredAt": "2024-08-16T12:00:00Z",\n  "lastSeen": "2024-08-16T12:00:00Z"\n}'
      },
      {
        method: 'PUT',
        path: '/api/devices/{deviceId}/token',
        description: 'Update push notification token for device.',
        exampleRequest: '{\n  "pushToken": "new_apns_token_456",\n  "tokenType": "apns"\n}',
        exampleResponse: '{\n  "deviceId": "device_abc123",\n  "pushToken": "new_apns_token_456",\n  "updatedAt": "2024-08-16T12:05:00Z",\n  "status": "token_updated"\n}'
      },
      {
        method: 'GET',
        path: '/api/devices',
        description: 'List user devices with last activity and status.',
        exampleResponse: '[\n  {\n    "id": "dev_789",\n    "deviceId": "device_abc123",\n    "platform": "ios",\n    "deviceInfo": {"model": "iPhone 15 Pro"},\n    "lastSeen": "2024-08-16T12:00:00Z",\n    "status": "active"\n  },\n  {\n    "id": "dev_790",\n    "deviceId": "device_def456",\n    "platform": "android",\n    "deviceInfo": {"model": "Pixel 8"},\n    "lastSeen": "2024-08-15T18:30:00Z",\n    "status": "inactive"\n  }\n]'
      },
      {
        method: 'PUT',
        path: '/api/devices/{deviceId}/preferences',
        description: 'Update notification preferences for device.',
        exampleRequest: '{\n  "notifications": {\n    "push": true,\n    "email": false,\n    "marketing": false\n  },\n  "quietHours": {\n    "enabled": true,\n    "start": "22:00",\n    "end": "08:00",\n    "timezone": "America/New_York"\n  }\n}',
        exampleResponse: '{\n  "deviceId": "device_abc123",\n  "preferences": {\n    "notifications": {\n      "push": true,\n      "email": false,\n      "marketing": false\n    },\n    "quietHours": {\n      "enabled": true,\n      "start": "22:00",\n      "end": "08:00",\n      "timezone": "America/New_York"\n    }\n  },\n  "updatedAt": "2024-08-16T12:10:00Z"\n}'
      }
    ]
  }
];

export const apiCategories: string[] = Array.from(new Set(publicApis.map(api => api.category)));

export const getApiById = (id: string): ApiDefinition | undefined => {
  return publicApis.find(api => api.id === id);
};

    