import { publicApis, ApiDefinition, ApiEndpoint } from './../src/data/apis';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';

// Mock NextRequest and other necessary objects/functions if needed for route handlers
// This is a simplified mock; real route handlers might need more sophisticated mocks
function createMockRequest(method: string, path: string, body?: any, queryParams?: string): NextRequest {
  const url = new URL(`http://localhost:3000${path}${queryParams ? queryParams : ''}`);
  let requestInit: RequestInit = { method };
  if (body) {
    if (typeof body === 'object' && !(body instanceof FormData)) {
      requestInit.body = JSON.stringify(body);
      requestInit.headers = { 'Content-Type': 'application/json' };
    } else {
      requestInit.body = body; // FormData or string
    }
  }
  return new NextRequest(url, requestInit);
}

async function testApiEndpoints() {
  const results: any[] = [];

  for (const api of publicApis) {
    console.log(`Testing API: ${api.name} (Documentation: ${api.documentationUrl})`);
    for (const endpoint of api.endpoints) {
      console.log(`  Testing endpoint: ${endpoint.method} ${endpoint.path}`);
      let response: Response | undefined;
      let responseBody: any;
      let statusText: string = "OK";
      let isSuccess: boolean = false;

      try {
        // Dynamically import the route handler
        // The path needs to be relative to the 'src/app' directory for Next.js App Router
        let routePath = endpoint.path.startsWith('/api/') ? endpoint.path.substring('/api/'.length) : endpoint.path;

        // Handle dynamic segments like [id] or [...slug]
        // This is a basic replacement, might need to be more sophisticated
        // For now, let's assume example paths in apis.ts are concrete or we use placeholders
        const placeholderRegex = /\{\w+\}/g;
        const dynamicSegmentRegex = /\[\w+\]/g;
        const catchAllSegmentRegex = /\[\.\.\.\w+\]/g;

        let concretePath = endpoint.path;
        let requestPathForHandler = routePath;

        // Try to extract params from exampleRequest if it's a path
        if (typeof endpoint.exampleRequest === 'string' && (endpoint.exampleRequest.startsWith('Path: /api/') || endpoint.exampleRequest.startsWith('/api/'))) {
            let examplePath = endpoint.exampleRequest.startsWith('Path: ') ? endpoint.exampleRequest.substring('Path: '.length) : endpoint.exampleRequest;
            if (examplePath.includes('?')) { // Remove query params for path matching
                examplePath = examplePath.split('?')[0];
            }
            concretePath = examplePath; // Use this path for the request
            requestPathForHandler = concretePath.startsWith('/api/') ? concretePath.substring('/api/'.length) : concretePath;
        } else {
            // Replace placeholders like {userId} with a default value if not specified in exampleRequest
             if (placeholderRegex.test(requestPathForHandler)) {
                console.warn(`  Endpoint ${endpoint.path} uses a placeholder. Replacing with 'test-id'. This might not match all route handlers correctly.`);
                requestPathForHandler = requestPathForHandler.replace(placeholderRegex, 'test-id');
                concretePath = concretePath.replace(placeholderRegex, 'test-id');
            }
        }

        // Construct the module path. This is a heuristic and might need adjustments.
        // Example: /api/users/{userId} -> src/app/api/users/[userId]/route.ts
        // Example: /api/echo -> src/app/api/echo/route.ts
        // let modulePath = `./src/app${concretePath.split('?')[0]}/route.ts`; // Default for non-dynamic

        // const segments = endpoint.path.split('/').filter(Boolean);
        // let currentPathForModule = './src/app';
        // let resolvedRouteHandlerPath = '';

        // for(let i = 0; i < segments.length; i++) {
        //     const segment = segments[i];
        //     if (segment.startsWith('{') && segment.endsWith('}')) {
        //         // Dynamic segment like {userId} -> maps to [userId]
        //         const dynamicSegmentName = segment.substring(1, segment.length - 1);
        //         currentPathForModule += `/[${dynamicSegmentName}]`;
        //     } else if (segment.startsWith('[...') && segment.endsWith(']')) {
        //         // Catch-all segment like [...slug]
        //         currentPathForModule += `/${segment}`;
        //     } else {
        //          currentPathForModule += `/${segment}`;
        //     }
        // }
        // resolvedRouteHandlerPath = `${currentPathForModule}/route.ts`;

        let resolvedParams: Record<string, string> = {};
        const basePath = './../src/app'; // Relative to scripts/test-apis.ts
        let pathSegmentsForModule = endpoint.path.split('?')[0].split('/').filter(p => p); // Filter out empty segments

        let constructedFsPath = basePath;
        let concretePathSegmentsForParams = concretePath.split('?')[0].split('/').filter(p => p);

        let currentConcreteIdx = 0;
        for (let i = 0; i < pathSegmentsForModule.length; i++) {
            const segment = pathSegmentsForModule[i];
            if (segment.startsWith('{') && segment.endsWith('}')) {
                const paramName = segment.substring(1, segment.length - 1);
                constructedFsPath += `/[${paramName}]`;
                // Resolve param value from concretePath
                // This assumes concretePath segments align with template path segments
                if (concretePathSegmentsForParams[currentConcreteIdx]) {
                    resolvedParams[paramName] = concretePathSegmentsForParams[currentConcreteIdx];
                } else {
                     // Fallback if concrete path doesn't have enough segments (should ideally not happen if concretePath is well-formed)
                    resolvedParams[paramName] = 'test-id';
                    console.warn(`  Could not resolve param '${paramName}' from concretePath '${concretePath}', using 'test-id'.`);
                }
            } else {
                constructedFsPath += `/${segment}`;
            }
            currentConcreteIdx++;
        }
        let handlerModulePath = `${constructedFsPath}/route.ts`;

        // Special handling for catch-all routes that might not be perfectly matched by above
        // e.g. /api/files/[...filePath]/route.ts
        // The endpoint.path might be /api/files/{filePath+} or similar non-standard notation
        // For now, we assume the segment construction handles common cases like [...slug] if endpoint.path is /api/foo/[...slug]
        // The current logic for resolvedParams will fill {filePath: 'test-id'}, context needs it as array.

        console.log(`  Attempting to load route handler from: ${handlerModulePath}`);
        const routeHandlerModule = await import(handlerModulePath);

        const handlerFunction = routeHandlerModule[endpoint.method];

        if (!handlerFunction) {
          throw new Error(`No ${endpoint.method} handler found in ${handlerModulePath}`);
        }

        let requestBody: any = undefined;
        let queryParamsForRequest: string | undefined = undefined;

        if (endpoint.exampleRequest) {
            if (endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH') {
                try {
                    requestBody = JSON.parse(endpoint.exampleRequest);
                } catch (e) {
                    if (endpoint.exampleRequest.includes('FormData with "files" field')) {
                        requestBody = new FormData();
                        console.warn(`  Skipping true FormData test for ${endpoint.path}, using empty FormData.`);
                    } else {
                        requestBody = endpoint.exampleRequest;
                    }
                }
            } else if (endpoint.method === 'GET' || endpoint.method === 'DELETE') {
                 if(endpoint.exampleRequest.startsWith('?')) {
                    queryParamsForRequest = endpoint.exampleRequest;
                 } else if (endpoint.exampleRequest.startsWith('Path: ')) {
                    const pathAndQuery = endpoint.exampleRequest.substring('Path: '.length);
                    if (pathAndQuery.includes('?')) {
                        queryParamsForRequest = pathAndQuery.substring(pathAndQuery.indexOf('?'));
                    }
                 }
            }
        }

        const mockReq = createMockRequest(endpoint.method, concretePath, requestBody, queryParamsForRequest);

        const contextParams: { [key: string]: any } = { ...resolvedParams }; // Initialize with resolved path parameters

        // Refined logic for catch-all routes for context.params
        // Example endpoint.path: /api/files/{filePath+} or /api/proxy/[...slug]
        // handlerModulePath will be like: ./../src/app/api/files/[filePath+]/route.ts or ./../src/app/api/proxy/[...slug]/route.ts

        const catchAllFileMatch = handlerModulePath.match(/\[\.\.\.([\w-]+)\]/); // Matches [...paramName]
        if (catchAllFileMatch) {
            const paramName = catchAllFileMatch[1]; // e.g., "filePath" or "slug"

            // Find the static part of the path from endpoint.path before the catch-all segment
            // e.g. /api/files/ or /api/proxy/
            let basePathForSlugExtraction = "";
            const endpointPathSegments = endpoint.path.split('/');
            for (const seg of endpointPathSegments) {
                if (seg.includes('[...') || seg.includes('{') && seg.includes('+')) { // Heuristic for catch-all
                    break;
                }
                basePathForSlugExtraction += seg + '/';
            }
            // Remove trailing slash if it's not just "/"
            if (basePathForSlugExtraction.length > 1 && basePathForSlugExtraction.endsWith('/')) {
                basePathForSlugExtraction = basePathForSlugExtraction.slice(0, -1);
            }

            let slugValue = concretePath.startsWith(basePathForSlugExtraction)
                ? concretePath.substring(basePathForSlugExtraction.length)
                : '';
            slugValue = slugValue.split('?')[0]; // Remove query params
            // Ensure it starts with a slash if not empty, then split and filter
            const slugParts = slugValue.startsWith('/') ? slugValue.substring(1).split('/') : slugValue.split('/');
            contextParams[paramName] = slugParts.filter(Boolean);

            // If resolvedParams also contains this param (e.g. from {filePath+} mapping to [filePath]), overwrite with array
            if (resolvedParams[paramName] && typeof resolvedParams[paramName] === 'string') {
                 console.log(`  Overwriting param ${paramName} for catch-all route with array: ${JSON.stringify(contextParams[paramName])}`);
            }
        }

        response = await handlerFunction(mockReq, { params: contextParams });
        statusText = response.statusText;

        if (response.headers.get('Content-Type')?.includes('application/json')) {
          responseBody = await response.json();
        } else if (response.headers.get('Content-Type')?.includes('text/plain') || response.headers.get('Content-Type')?.includes('text/html')) {
          responseBody = await response.text();
        } else if (response.headers.get('Content-Disposition')?.includes('attachment')) {
            responseBody = `File download: ${response.headers.get('Content-Disposition')}`;
        }
        else {
          try {
            responseBody = await response.text();
            if (!responseBody && response.status !== 204) {
                const buffer = await response.arrayBuffer();
                responseBody = `Binary data (ArrayBuffer, size: ${buffer.byteLength})`;
            } else if (!responseBody && response.status === 204) {
                responseBody = "No Content";
            }
          } catch (e:any) {
            responseBody = `Could not parse response body: ${(e as Error).message}`;
          }
        }

        isSuccess = response.ok;

      } catch (error: any) {
        console.error(`Error testing ${api.name} - ${endpoint.method} ${endpoint.path}: ${error.message}`);
        responseBody = { error: error.message, stack: error.stack };
        isSuccess = false;
        if (!response) {
            response = new Response(JSON.stringify(responseBody), { status: 500, statusText: "Internal Server Error during test execution" });
        }
        statusText = response?.statusText ?? "Error in test execution";
      }

      results.push({
        apiName: api.name,
        endpointPath: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        success: isSuccess,
        status: response?.status || 500,
        statusText: statusText,
        responseSummary: typeof responseBody === 'string' ? responseBody.substring(0, 200) + (responseBody.length > 200 ? '...' : '') : JSON.stringify(responseBody)?.substring(0,200) + (JSON.stringify(responseBody)?.length > 200 ? '...' : ''),
        exampleResponseSummary: endpoint.exampleResponse?.substring(0, 200) + (endpoint.exampleResponse?.length > 200 ? '...' : ''),
      });
    }
  }
  console.log("\n--- Test Results Summary ---");
  results.forEach(r => {
      console.log(`${r.success ? '✅' : '❌'} ${r.apiName} - ${r.method} ${r.endpointPath} (Status: ${r.status} ${r.statusText}) - Response: ${r.responseSummary}`);
  });

  const failedCount = results.filter(r => !r.success).length;
  console.log(`
Total APIs: ${publicApis.length}`);
  console.log(`Total Endpoints Tested: ${results.length}`);
  console.log(`Passed: ${results.length - failedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount > 0) {
    console.log("\n--- Failed Tests Details ---");
    results.filter(r => !r.success).forEach(r => {
        console.log(`API: ${r.apiName}, Endpoint: ${r.method} ${r.endpointPath}, Status: ${r.status} ${r.statusText}, Response: ${r.responseSummary}`);
        // console.log(`Full Response Body: ${JSON.stringify(r.fullResponseBody)}`); // If captured
    });
  }
}

testApiEndpoints().catch(error => {
  console.error("Unhandled error during script execution:", error);
  process.exit(1); // Exit with error code if the script itself crashes
});
