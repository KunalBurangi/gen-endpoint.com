import { NextResponse } from 'next/server';
import { publicApis } from '@/data/apis';

export async function GET() {
    // Generate OpenAPI 3.0 specification
    const openApiSpec = {
        openapi: '3.0.0',
        info: {
            title: 'Gen-Endpoint API Collection',
            version: '1.0.0',
            description: 'A comprehensive collection of mock and demonstration APIs for testing and development purposes.',
            contact: {
                name: 'Gen-Endpoint',
                url: 'https://gen-endpoint.com',
            },
        },
        servers: [
            {
                url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
                description: 'Current server',
            },
        ],
        paths: {} as Record<string, any>,
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    description: 'Use "mock_token" for demonstration purposes',
                },
            },
        },
    };

    // Convert each API definition to OpenAPI paths
    publicApis.forEach((api) => {
        api.endpoints.forEach((endpoint) => {
            const path = endpoint.path.split('?')[0]; // Remove query params from path
            const method = endpoint.method.toLowerCase();

            if (!openApiSpec.paths[path]) {
                openApiSpec.paths[path] = {};
            }

            // Build operation object
            const operation: any = {
                summary: endpoint.description,
                description: `${api.name}: ${endpoint.description}`,
                tags: [api.category],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                example: endpoint.exampleResponse ? JSON.parse(endpoint.exampleResponse) : {},
                            },
                        },
                    },
                },
            };

            // Add request body for POST, PUT, PATCH
            if (['post', 'put', 'patch'].includes(method) && endpoint.exampleRequest) {
                try {
                    operation.requestBody = {
                        required: true,
                        content: {
                            'application/json': {
                                example: JSON.parse(endpoint.exampleRequest),
                            },
                        },
                    };
                } catch (e) {
                    // If exampleRequest is not valid JSON, skip it
                }
            }

            // Add query parameters for GET requests
            if (method === 'get' && endpoint.exampleRequest) {
                const params: any[] = [];
                const queryString = endpoint.exampleRequest.startsWith('?')
                    ? endpoint.exampleRequest.substring(1)
                    : endpoint.exampleRequest;

                queryString.split('&').forEach((param) => {
                    const [name, value] = param.split('=');
                    if (name) {
                        params.push({
                            name: decodeURIComponent(name),
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'string',
                            },
                            example: value ? decodeURIComponent(value) : undefined,
                        });
                    }
                });

                if (params.length > 0) {
                    operation.parameters = params;
                }
            }

            // Add security for protected routes
            const protectedPaths = ['/api/inventory/adjust', '/api/inventory/reserve', '/api/webhooks', '/api/jobs'];
            if (protectedPaths.some(p => path.startsWith(p)) && ['post', 'put', 'delete'].includes(method)) {
                operation.security = [{ BearerAuth: [] }];
            }

            openApiSpec.paths[path][method] = operation;
        });
    });

    return NextResponse.json(openApiSpec, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
