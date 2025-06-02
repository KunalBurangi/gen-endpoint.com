
'use server';

/**
 * @fileOverview An AI agent that generates a Next.js API endpoint (path, method, handler code, example response) based on a user-provided prompt.
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
The 'exampleResponse' should be a direct JSON string example of what the 'handlerFunctionCode' would output.
The 'httpMethod' should be one of GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD.

Schema for your JSON output:
{
  "suggestedPath": "string (e.g., /api/items, /api/users/{userId}/profile)",
  "httpMethod": "string (e.g., GET, POST, PUT, DELETE)",
  "handlerFunctionCode": "string (Full TypeScript code for a Next.js 'route.ts' file, including imports and the async handler function like 'export async function GET(request) { ... }'. Focus on clarity and correctness. For example, if the user asks for an endpoint for 'random products', generate a few product objects directly in the code.)",
  "exampleResponse": "string (A valid JSON string example of the response from the generated code.)"
}
`;

const originalPrompt = globalAi.definePrompt({
  name: 'generateApiEndpointPrompt',
  input: { schema: GenerateApiEndpointInputSchema.omit({ userApiKey: true }) },
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
    if (input.userApiKey) {
      const customGenkit = genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] });
      const response = await customGenkit.generate({
        model: 'googleai/gemini-2.0-flash',
        system: systemPrompt,
        prompt: `User Prompt: ${input.prompt}`,
        output: { schema: GenerateApiEndpointOutputSchema },
        config: originalPrompt.config,
      });
      return response.output!;
    } else {
      const { output } = await originalPrompt({ prompt: input.prompt });
      return output!;
    }
  }
);
