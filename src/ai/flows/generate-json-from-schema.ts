
'use server';
/**
 * @fileOverview Flow to generate a JSON example from a given JSON schema.
 *
 * - generateJsonFromSchema - A function that generates JSON from a schema.
 * - GenerateJsonFromSchemaInput - The input type for the generateJsonFromSchema function.
 * - GenerateJsonFromSchemaOutput - The return type for the generateJsonFromSchema function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai as globalAi } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateJsonFromSchemaInputSchema = z.object({
  jsonSchema: z.string().describe('The JSON schema to generate an example from.'),
  userApiKey: z.string().optional().describe('Optional user-provided Google AI API key.')
});
export type GenerateJsonFromSchemaInput = z.infer<typeof GenerateJsonFromSchemaInputSchema>;

const GenerateJsonFromSchemaOutputSchema = z.object({
  jsonExample: z.string().describe('The generated JSON example.'),
});
export type GenerateJsonFromSchemaOutput = z.infer<typeof GenerateJsonFromSchemaOutputSchema>;

export async function generateJsonFromSchema(input: GenerateJsonFromSchemaInput): Promise<GenerateJsonFromSchemaOutput> {
  return generateJsonFromSchemaFlow(input);
}

const originalPrompt = globalAi.definePrompt({
  name: 'generateJsonFromSchemaPrompt',
  input: { schema: GenerateJsonFromSchemaInputSchema.omit({ userApiKey: true }) },
  output: { schema: GenerateJsonFromSchemaOutputSchema },
  prompt: `You are a expert Typescript developer.
  Generate a JSON example based on the following JSON schema:\n\n  {{{jsonSchema}}}\n\n  The JSON should be valid and well-formatted.
  Ensure that the generated JSON adheres to the schema, including data types and required fields.`,
});

const generateJsonFromSchemaFlow = globalAi.defineFlow(
  {
    name: 'generateJsonFromSchemaFlow',
    inputSchema: GenerateJsonFromSchemaInputSchema,
    outputSchema: GenerateJsonFromSchemaOutputSchema,
  },
  async (input) => {
    if (!input.userApiKey) {
      throw new Error("User API key is required. Please provide it using the API Key Manager.");
    }

    const customGenkit = genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] });
    const response = await customGenkit.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are a expert Typescript developer.
  Generate a JSON example based on the following JSON schema:\n\n  ${input.jsonSchema}\n\n  The JSON should be valid and well-formatted.
  Ensure that the generated JSON adheres to the schema, including data types and required fields.`,
      output: { schema: GenerateJsonFromSchemaOutputSchema },
    });
    
    const output = response.output;
    if (!output) {
      console.error("AI response was empty or could not be parsed to the GenerateJsonFromSchemaOutputSchema. Raw response text:", response.text);
      const errorText = response.text ?? "No error text available from AI response.";
      throw new Error(`AI response could not be parsed to the expected format. AI message: ${errorText}`);
    }
    return output;
  }
);

