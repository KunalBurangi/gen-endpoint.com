import {genkit} from 'genkit';

// This 'ai' instance is used for defining flow structures, prompts, etc.
// It should not initialize plugins that require API keys at module load time.
// The actual googleAI plugin with API key will be initialized per-request in the specific flow.
export const ai = genkit({
  plugins: [], // Remove googleAI() from here
  // The model will be specified in the individual generate() calls within each flow.
});
