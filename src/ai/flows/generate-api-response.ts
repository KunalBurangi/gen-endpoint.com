'use server';

/**
 * @fileOverview An AI agent that generates a sample API response in JSON format based on a user-provided prompt.
 *
 * - generateApiResponse - A function that handles the generation of the API response.
 * - GenerateApiResponseInput - The input type for the generateApiResponse function.
 * - GenerateApiResponseOutput - The return type for the generateApiResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateApiResponseInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the desired API response data and format.'),
});
export type GenerateApiResponseInput = z.infer<typeof GenerateApiResponseInputSchema>;

const GenerateApiResponseOutputSchema = z.object({
  apiResponse: z.string().describe('The generated API response in JSON format.'),
});
export type GenerateApiResponseOutput = z.infer<typeof GenerateApiResponseOutputSchema>;

export async function generateApiResponse(input: GenerateApiResponseInput): Promise<GenerateApiResponseOutput> {
  return generateApiResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApiResponsePrompt',
  input: {schema: GenerateApiResponseInputSchema},
  output: {schema: GenerateApiResponseOutputSchema},
  prompt: `You are an API response generator.  You will generate a sample API response in JSON format based on the user-provided prompt. Ensure that the response is valid JSON.\n\nPrompt: {{{prompt}}}`,
});

const generateApiResponseFlow = ai.defineFlow(
  {
    name: 'generateApiResponseFlow',
    inputSchema: GenerateApiResponseInputSchema,
    outputSchema: GenerateApiResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
