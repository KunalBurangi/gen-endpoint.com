
import { type NextRequest, NextResponse } from 'next/server';
import { generateRuntimeResponse, type GenerateRuntimeResponseInput } from '@/ai/flows/generate-runtime-response';

async function handleRuntimeRequest(request: NextRequest, params: { slug: string[] }, httpMethod: string) {
  const userApiKey = request.headers.get('x-goog-api-key');
  let userQueryFromQuery = request.nextUrl.searchParams.get('user_query');
  let userQueryFromBody: string | undefined;
  let finalRequestBodyString: string | undefined;
  const pathSlug = params.slug ? params.slug.join('/') : '';

  if (!userApiKey) {
    return NextResponse.json({ error: "Missing Google AI API Key. Please include it in the 'X-Goog-Api-Key' header." }, { status: 401 });
  }

  if (!pathSlug) {
    return NextResponse.json({ error: "Invalid path. The path for the runtime endpoint cannot be empty." }, { status: 400 });
  }

  let bodyForAi: any = undefined;

  if (['POST', 'PUT', 'PATCH'].includes(httpMethod.toUpperCase())) {
    try {
      if (request.body) {
        const rawBody = await request.json();
        if (typeof rawBody === 'object' && rawBody !== null) {
          if (rawBody.user_query && typeof rawBody.user_query === 'string') {
            userQueryFromBody = rawBody.user_query;
          }
          // Prepare bodyForAi by removing user_query if it was present
          const { user_query, ...restOfBody } = rawBody;
          bodyForAi = Object.keys(restOfBody).length > 0 ? restOfBody : undefined;
        } else {
          // If rawBody is not an object (e.g. array or primitive), pass it as is
           bodyForAi = rawBody;
        }
        if (bodyForAi !== undefined) {
            finalRequestBodyString = JSON.stringify(bodyForAi);
        }
      }
    } catch (e) {
      console.warn(`Could not parse request body for ${httpMethod} /api/runtime/${pathSlug}: ${(e as Error).message}`);
      finalRequestBodyString = undefined; // Explicitly undefined if parsing fails
    }
  }

  const finalUserQuery = userQueryFromBody || userQueryFromQuery;

  if (!finalUserQuery) {
    return NextResponse.json({ error: "Missing 'user_query'. Please provide it either as a query parameter or in the JSON body for POST/PUT/PATCH requests." }, { status: 400 });
  }

  try {
    const input: GenerateRuntimeResponseInput = {
      pathSlug,
      userQuery: finalUserQuery,
      httpMethod,
      requestBody: finalRequestBodyString,
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
