'use server';

/**
 * @fileOverview An AI agent that generates client SDK code (TypeScript or Python) for a given API definition.
 *
 * - generateClientSdk - A function that handles the generation of client SDK code.
 * - GenerateClientSdkInput - The input type for the generateClientSdk function.
 * - GenerateClientSdkOutput - The return type for the generateClientSdk function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai as globalAi } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateClientSdkInputSchema = z.object({
    apiDefinition: z.string().describe('JSON string containing the API definition with endpoints, methods, and examples.'),
    language: z.enum(['typescript', 'python']).describe('The programming language for the generated SDK.'),
    userApiKey: z.string().optional().describe('Optional user-provided Google AI API key.')
});
export type GenerateClientSdkInput = z.infer<typeof GenerateClientSdkInputSchema>;

const GenerateClientSdkOutputSchema = z.object({
    sdkCode: z.string().describe('The complete SDK code in the requested language, including all necessary imports, class definitions, and methods.'),
    className: z.string().describe('The name of the main SDK class.'),
    usage: z.string().describe('Example usage code showing how to initialize and use the SDK.')
});
export type GenerateClientSdkOutput = z.infer<typeof GenerateClientSdkOutputSchema>;

export async function generateClientSdk(input: GenerateClientSdkInput): Promise<GenerateClientSdkOutput> {
    return generateClientSdkFlow(input);
}

const systemPrompt = `You are an expert SDK generator. Based on the provided API definition and target language, you will generate a complete, production-ready client SDK.

Your output MUST be a JSON object matching the following schema. Do NOT include any markdown formatting like \`\`\`json ... \`\`\` around the JSON object.

For TypeScript SDKs:
- Use modern TypeScript with proper types and interfaces
- Include error handling with try-catch blocks
- Use fetch API for HTTP requests
- Export a main class with methods for each endpoint
- Include JSDoc comments for all public methods
- Handle authentication via constructor options

For Python SDKs:
- Use modern Python 3.8+ syntax with type hints
- Use requests library for HTTP calls
- Include proper error handling with custom exceptions
- Export a main class with methods for each endpoint
- Include docstrings for all public methods
- Handle authentication via constructor parameters

The SDK should:
1. Have a clear, intuitive API
2. Include proper error handling
3. Support authentication if the API requires it
4. Have well-documented methods
5. Include type safety (TypeScript) or type hints (Python)

Schema for your JSON output:
{
  "sdkCode": "string (Complete SDK code with all imports, class definition, and methods)",
  "className": "string (Name of the main SDK class, e.g., 'GreetingApiClient')",
  "usage": "string (Example code showing how to initialize and use the SDK)"
}
`;

const generateClientSdkFlow = globalAi.defineFlow(
    {
        name: 'generateClientSdkFlow',
        inputSchema: GenerateClientSdkInputSchema,
        outputSchema: GenerateClientSdkOutputSchema,
    },
    async (input) => {
        console.log("[generateClientSdkFlow] Received input:", JSON.stringify(input));

        if (!input.userApiKey) {
            console.error("[generateClientSdkFlow] Error: input.userApiKey is missing or empty.");
            throw new Error("User API key is required. Please provide it using the API Key Manager.");
        }

        const customGenkit = genkit({
            plugins: [
                googleAI({
                    apiKey: input.userApiKey,
                }),
            ],
        });

        try {
            const response = await customGenkit.generate({
                model: 'googleai/gemini-2.0-flash',
                system: systemPrompt,
                prompt: `Generate a ${input.language} SDK for the following API:

API Definition:
${input.apiDefinition}

Language: ${input.language}

Generate a complete, production-ready SDK with proper error handling, type safety, and documentation.`,
                output: { schema: GenerateClientSdkOutputSchema },
            });

            const output = response.output;
            if (!output) {
                // Access text property safely
                const rawText = response.text;
                console.error("[generateClientSdkFlow] AI response.output was null. Raw text:", rawText);
                throw new Error("AI response output was empty or could not be parsed.");
            }

            console.log("[generateClientSdkFlow] Generated SDK successfully");

            return {
                sdkCode: output.sdkCode,
                className: output.className,
                usage: output.usage
            };
        } catch (e: any) {
            console.error("[generateClientSdkFlow] Error during generation:", e);
            throw new Error(`AI Generation Error: ${e.message || 'An unknown error occurred.'}`);
        }
    }
);
