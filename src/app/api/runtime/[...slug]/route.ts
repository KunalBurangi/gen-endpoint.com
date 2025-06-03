
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

  let finalUserQueryForAi: string;
  let requestBodyForAiString: string | undefined;

  if (httpMethod.toUpperCase() === 'GET' || httpMethod.toUpperCase() === 'DELETE') {
    const originalUserPrompt = request.nextUrl.searchParams.get('prompt');
    const limitParam = request.nextUrl.searchParams.get('limit');

    if (!originalUserPrompt) {
      return NextResponse.json({ error: "Missing 'prompt' query parameter for GET/DELETE request." }, { status: 400 });
    }

    finalUserQueryForAi = `The HTTP method for this request is ${httpMethod.toUpperCase()}.
The conceptual API path being targeted is '/${pathSlug}'.
The user's specific instruction or goal for this request is: "${originalUserPrompt}".`;
    if (limitParam) {
      finalUserQueryForAi += ` If applicable to the request (e.g., for lists), please consider a limit of ${limitParam} items.`;
    }
    finalUserQueryForAi += "\nBased on all this information, generate a concise and relevant JSON response. Only output the raw JSON data.";
    requestBodyForAiString = undefined; // No request body for GET/DELETE in this context

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
    
    const detailedPromptFromBody = requestJsonBody.user_query;

    if (!detailedPromptFromBody || typeof detailedPromptFromBody !== 'string') {
      return NextResponse.json({ error: "Missing 'user_query' string in JSON body for POST/PUT/PATCH, or it's not a string. This 'user_query' should be the detailed prompt describing the AI's task." }, { status: 400 });
    }
    finalUserQueryForAi = detailedPromptFromBody;

    const { user_query, ...actualRequestBodyPayload } = requestJsonBody;
    if (Object.keys(actualRequestBodyPayload).length > 0) {
      requestBodyForAiString = JSON.stringify(actualRequestBodyPayload);
    } else {
      requestBodyForAiString = undefined;
    }
  }

  try {
    const input: GenerateRuntimeResponseInput = {
      pathSlug,
      userQuery: finalUserQueryForAi,
      httpMethod,
      requestBody: requestBodyForAiString,
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
