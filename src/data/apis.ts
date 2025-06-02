
import type { LucideIcon } from 'lucide-react';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  exampleResponse: string; // JSON string
}

export interface ApiDefinition {
  id: string;
  name: string;
  description:string;
  category: string;
  documentationUrl: string;
  endpoints: ApiEndpoint[];
  Icon?: LucideIcon;
}

export const publicApis: ApiDefinition[] = [];

export const apiCategories: string[] = [];
