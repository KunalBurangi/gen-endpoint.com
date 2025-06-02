
import { type NextRequest, NextResponse } from 'next/server';
import { generateRuntimeResponse, type GenerateRuntimeResponseInput } from '@/ai/flows/generate-runtime-response';

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
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

  try {
    const input: GenerateRuntimeResponseInput = {
      pathSlug,
      userQuery,
      userApiKey,
    };
    const result = await generateRuntimeResponse(input);
    
    try {
      // The flow should ideally ensure this is valid JSON, but double check
      const jsonData = JSON.parse(result.jsonResponse);
      return NextResponse.json(jsonData);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response in /api/runtime:", parseError, "Raw AI response:", result.jsonResponse);
      return NextResponse.json({ error: "AI generated an invalid JSON response.", details: result.jsonResponse.substring(0, 200) + "..." }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in /api/runtime/[...slug]:", error);
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
        statusCode = 502; // Bad Gateway, as AI is upstream
      } else {
        errorMessage = error.message; // Use the specific error message from the flow if available
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
