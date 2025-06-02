'use server';
/**
 * @fileOverview Flow to generate a JSON example from a given JSON schema.
 *
 * - generateJsonFromSchema - A function that generates JSON from a schema.
 * - GenerateJsonFromSchemaInput - The input type for the generateJsonFromSchema function.
 * - GenerateJsonFromSchemaOutput - The return type for the generateJsonFromSchema function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJsonFromSchemaInputSchema = z.object({
  jsonSchema: z.string().describe('The JSON schema to generate an example from.'),
});
export type GenerateJsonFromSchemaInput = z.infer<typeof GenerateJsonFromSchemaInputSchema>;

const GenerateJsonFromSchemaOutputSchema = z.object({
  jsonExample: z.string().describe('The generated JSON example.'),
});
export type GenerateJsonFromSchemaOutput = z.infer<typeof GenerateJsonFromSchemaOutputSchema>;

export async function generateJsonFromSchema(input: GenerateJsonFromSchemaInput): Promise<GenerateJsonFromSchemaOutput> {
  return generateJsonFromSchemaFlow(input);
}

const generateJsonFromSchemaPrompt = ai.definePrompt({
  name: 'generateJsonFromSchemaPrompt',
  input: {schema: GenerateJsonFromSchemaInputSchema},
  output: {schema: GenerateJsonFromSchemaOutputSchema},
  prompt: `You are a expert Typescript developer.
  Generate a JSON example based on the following JSON schema:\n\n  {{jsonSchema}}\n\n  The JSON should be valid and well-formatted.
  Ensure that the generated JSON adheres to the schema, including data types and required fields.`,
});

const generateJsonFromSchemaFlow = ai.defineFlow(
  {
    name: 'generateJsonFromSchemaFlow',
    inputSchema: GenerateJsonFromSchemaInputSchema,
    outputSchema: GenerateJsonFromSchemaOutputSchema,
  },
  async input => {
    const {output} = await generateJsonFromSchemaPrompt(input);
    return output!;
  }
);
