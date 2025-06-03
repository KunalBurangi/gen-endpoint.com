
import { type NextRequest, NextResponse } from 'next/server';
import { generateRuntimeResponse, type GenerateRuntimeResponseInput } from '@/ai/flows/generate-runtime-response';

async function handleRuntimeRequest(request: NextRequest, params: { slug: string[] }, httpMethod: string) {
  const userApiKey = request.headers.get('x-goog-api-key');
  const pathSlug = params.slug ? params.slug.join('/') : '';

  if (!userApiKey) {
    return NextResponse.json({ error: "Missing Google AI API Key. Please include it in the 'X-Goog-Api-Key' header." }, { status: 401 });
  }

  if (!pathSlug) {
    return NextResponse.json({ error: "Invalid path. The path for the runtime endpoint cannot be empty." }, { status: 400 });
  }

  let shortUserPromptForAi: string;
  let requestBodyForAiString: string | undefined;

  if (httpMethod.toUpperCase() === 'GET' || httpMethod.toUpperCase() === 'DELETE') {
    const originalUserPromptParam = request.nextUrl.searchParams.get('prompt');
    const limitParam = request.nextUrl.searchParams.get('limit');

    if (!originalUserPromptParam) {
      return NextResponse.json({ error: "Missing 'prompt' query parameter for GET/DELETE request. This should be the user's original description of the endpoint's purpose." }, { status: 400 });
    }
    shortUserPromptForAi = originalUserPromptParam;
    if (limitParam) {
      shortUserPromptForAi += ` (Consider a limit of ${limitParam} items if applicable for a list).`;
    }
    requestBodyForAiString = undefined;

  } else { // POST, PUT, PATCH
    let requestJsonBody: any;
    try {
      if (request.body) {
        requestJsonBody = await request.json();
      } else {
        return NextResponse.json({ error: "Request body is missing for POST/PUT/PATCH." }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON in request body for POST/PUT/PATCH." }, { status: 400 });
    }

    if (typeof requestJsonBody !== 'object' || requestJsonBody === null) {
        return NextResponse.json({ error: "Request body must be a JSON object for POST/PUT/PATCH." }, { status: 400 });
    }
    
    const userQueryFromBody = requestJsonBody.user_query;

    if (!userQueryFromBody || typeof userQueryFromBody !== 'string') {
      return NextResponse.json({ error: "Missing 'user_query' string in JSON body for POST/PUT/PATCH, or it's not a string. This 'user_query' should be the user's original, concise prompt describing the endpoint's purpose." }, { status: 400 });
    }
    shortUserPromptForAi = userQueryFromBody;

    // Separate the 'user_query' from the actual data payload for the AI flow
    const { user_query, ...actualDataPayload } = requestJsonBody;
    if (Object.keys(actualDataPayload).length > 0) {
      requestBodyForAiString = JSON.stringify(actualDataPayload);
    } else {
      requestBodyForAiString = undefined; // No actual data payload beyond the user_query
    }
  }

  try {
    const input: GenerateRuntimeResponseInput = {
      pathSlug,
      userQuery: shortUserPromptForAi, // This is now the short, direct user prompt
      httpMethod,
      requestBody: requestBodyForAiString, // This is the actual data part of the body (if any)
      userApiKey,
    };
    const result = await generateRuntimeResponse(input);
    
    try {
      const jsonData = JSON.parse(result.jsonResponse);
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response in /api/runtime:", parseError, "Raw AI response:", result.jsonResponse);
      return NextResponse.json({ error: "AI generated an invalid JSON response.", details: result.jsonResponse.substring(0, 200) + "..." }, { status: 500 });
    }

  } catch (error) {
    console.error(`Error in /api/runtime/[...slug] (${httpMethod}):`, error);
    let errorMessage = "An unexpected error occurred while generating the AI response.";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("User API key is required")) {
        errorMessage = "A Google AI API key is required for the AI flow. Ensure 'X-Goog-Api-Key' header is correctly passed and valid.";
        statusCode = 401;
      } else if (error.message.includes("API key not valid")) {
        errorMessage = "The provided Google AI API key is not valid.";
        statusCode = 403;
      } else if (error.message.includes("503") || error.message.toLowerCase().includes("model is overloaded") || error.message.toLowerCase().includes("service unavailable")) {
        errorMessage = "The AI model is currently overloaded or unavailable. Please try again later.";
        statusCode = 503;
      } else if (error.message.includes("AI response could not be parsed") || error.message.includes("AI generated data that was not valid JSON")) {
        errorMessage = "The AI returned data that couldn't be processed as valid JSON. Try rephrasing your query.";
        statusCode = 502; 
      } else {
        errorMessage = error.message; 
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return handleRuntimeRequest(request, params, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return handleRuntimeRequest(request, params, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return handleRuntimeRequest(request, params, 'PUT');
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return handleRuntimeRequest(request, params, 'PATCH');
}

export async function DELETE(request: NextRequest, { params }: { params: { slug:string[] } }) {
  return handleRuntimeRequest(request, params, 'DELETE');
}
