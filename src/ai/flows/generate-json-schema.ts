
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
import { ai as globalAi } from '@/ai/genkit'; // Renamed to avoid conflict
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
    if (input.userApiKey) {
      const customGenkit = genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] });
      const response = await customGenkit.generate({
        model: globalAi.getModel('googleai/gemini-2.0-flash'),
        prompt: `You are a tool that takes an example JSON response and generates a JSON schema representing its structure and data types.

  Example JSON Response:
  ${input.exampleJson}

  JSON Schema:
  `,
        output: { schema: GenerateJsonSchemaOutputSchema },
        config: originalPrompt.config
      });
      return response.output!;
    } else {
      const { output } = await originalPrompt({ exampleJson: input.exampleJson });
      return output!;
    }
  }
);
