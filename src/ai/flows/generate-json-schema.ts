
'use server';

/**
 * @fileOverview Flow to generate a JSON schema from an example JSON response.
 *
 * - generateJsonSchema - A function that generates a JSON schema from an example JSON response.
 * - GenerateJsonSchemaInput - The input type for the generateJsonSchema function.
 * - GenerateJsonSchemaOutput - The return type for the generateJsonSchema function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai as globalAi } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateJsonSchemaInputSchema = z.object({
  exampleJson: z.string().describe('An example JSON response as a string.'),
  userApiKey: z.string().optional().describe('Optional user-provided Google AI API key.')
});
export type GenerateJsonSchemaInput = z.infer<typeof GenerateJsonSchemaInputSchema>;

const GenerateJsonSchemaOutputSchema = z.object({
  jsonSchema: z.string().describe('The generated JSON schema as a string.'),
});
export type GenerateJsonSchemaOutput = z.infer<typeof GenerateJsonSchemaOutputSchema>;

export async function generateJsonSchema(input: GenerateJsonSchemaInput): Promise<GenerateJsonSchemaOutput> {
  return generateJsonSchemaFlow(input);
}

const originalPrompt = globalAi.definePrompt({
  name: 'generateJsonSchemaPrompt',
  input: { schema: GenerateJsonSchemaInputSchema.omit({ userApiKey: true }) },
  output: { schema: GenerateJsonSchemaOutputSchema },
  prompt: `You are a tool that takes an example JSON response and generates a JSON schema representing its structure and data types.

  Example JSON Response:
  {{{exampleJson}}}

  JSON Schema:
  `,
});

const generateJsonSchemaFlow = globalAi.defineFlow(
  {
    name: 'generateJsonSchemaFlow',
    inputSchema: GenerateJsonSchemaInputSchema,
    outputSchema: GenerateJsonSchemaOutputSchema,
  },
  async (input) => {
    if (!input.userApiKey) {
      throw new Error("User API key is required. Please provide it using the API Key Manager.");
    }

    const customGenkit = genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] });
    const response = await customGenkit.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are a tool that takes an example JSON response and generates a JSON schema representing its structure and data types.

  Example JSON Response:
  ${input.exampleJson}

  JSON Schema:
  `,
      output: { schema: GenerateJsonSchemaOutputSchema },
    });

    const output = response.output;
    if (!output) {
      console.error("AI response was empty or could not be parsed to the GenerateJsonSchemaOutputSchema. Raw response text:", response.text);
      const errorText = response.text ?? "No error text available from AI response.";
      throw new Error(`AI response could not be parsed to the expected format. AI message: ${errorText}`);
    }
    return output;
  }
);

