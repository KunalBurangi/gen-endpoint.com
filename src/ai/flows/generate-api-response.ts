
'use server';

/**
 * @fileOverview An AI agent that generates a sample API response in JSON format based on a user-provided prompt.
 *
 * - generateApiResponse - A function that handles the generation of the API response.
 * - GenerateApiResponseInput - The input type for the generateApiResponse function.
 * - GenerateApiResponseOutput - The return type for the generateApiResponse function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai as globalAi } from '@/ai/genkit'; // Renamed to avoid conflict
import { z } from 'genkit';

const GenerateApiResponseInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the desired API response data and format.'),
  userApiKey: z.string().optional().describe('Optional user-provided Google AI API key.')
});
export type GenerateApiResponseInput = z.infer<typeof GenerateApiResponseInputSchema>;

const GenerateApiResponseOutputSchema = z.object({
  apiResponse: z.string().describe('The generated API response in JSON format.'),
});
export type GenerateApiResponseOutput = z.infer<typeof GenerateApiResponseOutputSchema>;

export async function generateApiResponse(input: GenerateApiResponseInput): Promise<GenerateApiResponseOutput> {
  return generateApiResponseFlow(input);
}

// This is the original prompt defined with the global 'ai' instance
const originalPrompt = globalAi.definePrompt({
  name: 'generateApiResponsePrompt',
  input: { schema: GenerateApiResponseInputSchema.omit({ userApiKey: true }) }, // Original prompt doesn't know about userApiKey
  output: { schema: GenerateApiResponseOutputSchema },
  prompt: `You are an API response generator.  You will generate a sample API response in JSON format based on the user-provided prompt. Ensure that the response is valid JSON.\n\nPrompt: {{{prompt}}}`,
});

const generateApiResponseFlow = globalAi.defineFlow(
  {
    name: 'generateApiResponseFlow',
    inputSchema: GenerateApiResponseInputSchema,
    outputSchema: GenerateApiResponseOutputSchema,
  },
  async (input) => {
    if (input.userApiKey) {
      const customGenkit = genkit({ plugins: [googleAI({ apiKey: input.userApiKey })] });
      const response = await customGenkit.generate({
        model: globalAi.getModel('googleai/gemini-2.0-flash'), // Use same model for consistency
        prompt: `You are an API response generator.  You will generate a sample API response in JSON format based on the user-provided prompt. Ensure that the response is valid JSON.\n\nPrompt: ${input.prompt}`,
        output: { schema: GenerateApiResponseOutputSchema },
        config: originalPrompt.config // Use config from original prompt if any (e.g. safetySettings)
      });
      return response.output!;
    } else {
      // Use the original prompt object if no userApiKey is provided
      const { output } = await originalPrompt({ prompt: input.prompt });
      return output!;
    }
  }
);
