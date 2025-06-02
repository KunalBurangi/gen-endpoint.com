
import { type NextRequest, NextResponse } from 'next/server';
import { generateRuntimeResponse, type GenerateRuntimeResponseInput } from '@/ai/flows/generate-runtime-response';

async function handleRuntimeRequest(request: NextRequest, params: { slug: string[] }, httpMethod: string) {
  const userApiKey = request.headers.get('x-goog-api-key');
  const userQuery = request.nextUrl.searchParams.get('user_query');
  const pathSlug = params.slug ? params.slug.join('/') : '';

  if (!userApiKey) {
    return NextResponse.json({ error: "Missing Google AI API Key. Please include it in the 'X-Goog-Api-Key' header." }, { status: 401 });
  }

  if (!userQuery) {
    return NextResponse.json({ error: "Missing 'user_query' parameter. Please provide a query to generate data." }, { status: 400 });
  }

  if (!pathSlug) {
    return NextResponse.json({ error: "Invalid path. The path for the runtime endpoint cannot be empty." }, { status: 400 });
  }

  let requestBodyString: string | undefined;
  if (['POST', 'PUT', 'PATCH'].includes(httpMethod.toUpperCase())) {
    try {
      // Check if request has a body
      if (request.body) {
        const body = await request.json();
        requestBodyString = JSON.stringify(body);
      }
    } catch (e) {
      // If body parsing fails (e.g. not JSON or empty), proceed without it.
      // The AI flow is designed to handle an optional requestBody.
      console.warn(`Could not parse request body for ${httpMethod} /api/runtime/${pathSlug}: ${(e as Error).message}`);
      requestBodyString = undefined;
    }
  }

  try {
    const input: GenerateRuntimeResponseInput = {
      pathSlug,
      userQuery,
      httpMethod,
      requestBody: requestBodyString,
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
