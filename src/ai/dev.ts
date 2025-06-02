
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-json-schema.ts';
import '@/ai/flows/generate-api-endpoint.ts'; // Renamed from generate-api-response.ts
import '@/ai/flows/generate-json-from-schema.ts';
