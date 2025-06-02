'use server';

/**
 * @fileOverview Flow to generate a JSON schema from an example JSON response.
 *
 * - generateJsonSchema - A function that generates a JSON schema from an example JSON response.
 * - GenerateJsonSchemaInput - The input type for the generateJsonSchema function.
 * - GenerateJsonSchemaOutput - The return type for the generateJsonSchema function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJsonSchemaInputSchema = z.object({
  exampleJson: z.string().describe('An example JSON response as a string.'),
});
export type GenerateJsonSchemaInput = z.infer<typeof GenerateJsonSchemaInputSchema>;

const GenerateJsonSchemaOutputSchema = z.object({
  jsonSchema: z.string().describe('The generated JSON schema as a string.'),
});
export type GenerateJsonSchemaOutput = z.infer<typeof GenerateJsonSchemaOutputSchema>;

export async function generateJsonSchema(input: GenerateJsonSchemaInput): Promise<GenerateJsonSchemaOutput> {
  return generateJsonSchemaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJsonSchemaPrompt',
  input: {schema: GenerateJsonSchemaInputSchema},
  output: {schema: GenerateJsonSchemaOutputSchema},
  prompt: `You are a tool that takes an example JSON response and generates a JSON schema representing its structure and data types.

  Example JSON Response:
  {{exampleJson}}

  JSON Schema:
  `,
});

const generateJsonSchemaFlow = ai.defineFlow(
  {
    name: 'generateJsonSchemaFlow',
    inputSchema: GenerateJsonSchemaInputSchema,
    outputSchema: GenerateJsonSchemaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
