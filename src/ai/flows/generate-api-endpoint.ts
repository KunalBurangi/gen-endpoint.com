
'use server';

/**
 * @fileOverview An AI agent that generates a Next.js API endpoint (path, method, handler code, example response, and example request body) based on a user-provided prompt.
 *
 * - generateApiEndpoint - A function that handles the generation of the API endpoint details.
 * - GenerateApiEndpointInput - The input type for the generateApiEndpoint function.
 * - GenerateApiEndpointOutput - The return type for the generateApiEndpoint function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai as globalAi } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateApiEndpointInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the desired API endpoint, its behavior, and the data it should handle.'),
  userApiKey: z.string().optional().describe('Optional user-provided Google AI API key.')
});
export type GenerateApiEndpointInput = z.infer<typeof GenerateApiEndpointInputSchema>;

const GenerateApiEndpointOutputSchema = z.object({
  suggestedPath: z.string().describe("A suggested URL path for the new API endpoint, e.g., /api/items or /api/users/{userId}/profile. It should start with /api/."),
  httpMethod: z.string().describe("The suggested HTTP method for the endpoint, e.g., GET, POST, PUT, DELETE."),
  handlerFunctionCode: z.string().describe("The full TypeScript code for the Next.js App Router API route handler function (typically for a 'route.ts' file). This should include necessary imports like 'NextResponse' from 'next/server', and the 'export async function METHOD(request) { ... }' structure. The response should be returned using NextResponse.json(...). If the prompt implies data storage or complex logic, generate a functional, self-contained mock or simple in-memory example."),
  exampleRequestBody: z.string().optional().describe("Optional. A valid JSON string representing an example request body that the generated 'handlerFunctionCode' would expect. This is primarily for POST, PUT, or PATCH methods. If the method is GET or DELETE, or if no body is typically required, this can be omitted or be an empty string."),
  exampleResponse: z.string().describe("A valid JSON string representing an example response that the generated handlerFunctionCode would produce.")
});
export type GenerateApiEndpointOutput = z.infer<typeof GenerateApiEndpointOutputSchema>;

export async function generateApiEndpoint(input: GenerateApiEndpointInput): Promise<GenerateApiEndpointOutput> {
  return generateApiEndpointFlow(input);
}

const systemPrompt = `You are an expert Next.js API route generator. Based on the user's prompt, you will design and generate the code for a Next.js App Router API endpoint.

Your output MUST be a JSON object matching the following schema description. Do NOT include any markdown formatting like \`\`\`json ... \`\`\` around the JSON object.
Ensure the 'handlerFunctionCode' is complete and runnable for a 'route.ts' file in a Next.js App Router project.
It should handle the specified HTTP method and return a JSON response using 'NextResponse.json()'.
If the prompt implies data (e.g., "list of users"), create a small, self-contained in-memory array or object for the data within the handler.
The 'suggestedPath' should always start with '/api/'.
For 'exampleRequestBody', provide a valid JSON string if the HTTP method is POST, PUT, or PATCH and a body is expected by your generated 'handlerFunctionCode'. If no body is expected (e.g., for GET/DELETE or simple POSTs), omit this field or provide an empty string.
The 'exampleResponse' should be a direct JSON string example of what the 'handlerFunctionCode' would output.
The 'httpMethod' should be one of GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD.

Schema for your JSON output:
{
  "suggestedPath": "string (e.g., /api/items, /api/users/{userId}/profile)",
  "httpMethod": "string (e.g., GET, POST, PUT, DELETE)",
  "handlerFunctionCode": "string (Full TypeScript code for a Next.js 'route.ts' file, including imports and the async handler function like 'export async function GET(request) { ... }'. Focus on clarity and correctness. For example, if the user asks for an endpoint for 'random products', generate a few product objects directly in the code.)",
  "exampleRequestBody": "string (Optional. A valid JSON string representing an example request body that the generated 'handlerFunctionCode' would expect. This is primarily for POST, PUT, or PATCH methods. If the method is GET or DELETE, or if no body is typically required, this can be omitted or be an empty string.)",
  "exampleResponse": "string (A valid JSON string example of the response from the generated code.)"
}
`;

// originalPrompt is useful for its schema definitions for Genkit tooling, even if not directly called.
const originalPrompt = globalAi.definePrompt({
  name: 'generateApiEndpointPrompt',
  input: { schema: GenerateApiEndpointInputSchema.omit({ userApiKey: true }) }, // userApiKey is handled in the flow
  output: { schema: GenerateApiEndpointOutputSchema },
  system: systemPrompt,
  prompt: `User Prompt: {{{prompt}}}`,
});

const generateApiEndpointFlow = globalAi.defineFlow(
  {
    name: 'generateApiEndpointFlow',
    inputSchema: GenerateApiEndpointInputSchema,
    outputSchema: GenerateApiEndpointOutputSchema,
  },
  async (input) => {
      console.log("Reaching  generateApiEndpointFlow")

    if (!input.userApiKey) {
      throw new Error("User API key is required. Please provide it using the API Key Manager.");
    }
    const customGenkit = genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] });
      console.log("Reaching  generateApiEndpointFlow", input.userApiKey)

    try {
      const response = await customGenkit.generate({
        model: 'googleai/gemini-2.0-flash',
        system: systemPrompt,
        prompt: `User Prompt: ${input.prompt}`,
        output: { schema: GenerateApiEndpointOutputSchema },
      });

      const output = response.output; // This is already the parsed output object or null
      if (!output) {
        // Try to get raw text if output is null and response.text is a function
        const rawText = typeof response.text === 'function' ? response.text() : response.text;
        console.error("[generateApiEndpointFlow] AI response.output was null or undefined. Raw response text:", rawText);
        const errorText = rawText ?? "No error text available from AI response.";
        throw new Error(`AI response output was empty or could not be parsed to the expected schema. AI message: ${errorText}`);
      }
      return output;
    } catch (e: any) {
      console.error("[generateApiEndpointFlow] Error during customGenkit.generate() or output processing:", e);
      // Re-throw a new, standard Error to ensure clean propagation to the client
      // Include a more specific prefix for easier debugging from client-side logs if it reaches there
      throw new Error(`AI Generation Error: ${e.message || 'An unknown error occurred during AI processing.'}`);
    }
  }
);
