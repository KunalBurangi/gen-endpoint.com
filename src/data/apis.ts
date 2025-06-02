import type { LucideIcon } from 'lucide-react';
import { Database, Brain, Image as ImageIcon, Landmark, Globe, Shapes, BookOpen, Cloud, CalendarDays, MapPin, Music, Users, ShoppingCart, Film } from 'lucide-react';

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

export const publicApis: ApiDefinition[] = [
  {
    id: 'json-placeholder',
    name: 'JSONPlaceholder',
    description: 'Fake Online REST API for Testing and Prototyping.',
    category: 'Data',
    documentationUrl: 'https://jsonplaceholder.typicode.com/',
    Icon: Database,
    endpoints: [
      { method: 'GET', path: '/posts', description: 'Get all posts', exampleResponse: '[{"userId": 1, "id": 1, "title": "sunt aut facere...", "body": "quia et suscipit..."}]' },
      { method: 'GET', path: '/posts/1', description: 'Get a single post', exampleResponse: '{"userId": 1, "id": 1, "title": "sunt aut facere...", "body": "quia et suscipit..."}' },
      { method: 'POST', path: '/posts', description: 'Create a new post', exampleResponse: '{"id": 101, "title": "foo", "body": "bar", "userId": 1}' },
    ],
  },
  {
    id: 'open-meteo',
    name: 'Open-Meteo',
    description: 'Free Weather API with Global Coverage.',
    category: 'Weather',
    documentationUrl: 'https://open-meteo.com/en/docs',
    Icon: Cloud,
    endpoints: [
      { method: 'GET', path: '/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true', description: 'Get current weather for a location', exampleResponse: '{"latitude":52.52,"longitude":13.41,"generationtime_ms":0.21,"utc_offset_seconds":0,"timezone":"GMT","timezone_abbreviation":"GMT","elevation":38.0,"current_weather":{"temperature":15.3,"windspeed":10.2,"winddirection":240.0,"weathercode":3,"is_day":1,"time":"2023-10-26T14:00"}}' },
    ],
  },
  {
    id: 'public-apis-project',
    name: 'Public APIs Project',
    description: 'A collective list of free APIs for use in software and web development.',
    category: 'Aggregator',
    documentationUrl: 'https://github.com/public-apis/public-apis',
    Icon: BookOpen,
    endpoints: [
      { method: 'GET', path: '/entries', description: 'List all APIs', exampleResponse: '{"count":1427,"entries":[{"API":"AdoptAPet","Description":"Resource to help get pets adopted","Auth":"apiKey","HTTPS":true,"Cors":"yes","Link":"https://www.adoptapet.com/public/apis/pet_list.html","Category":"Animals"},{...}]}' },
      { method: 'GET', path: '/random', description: 'Get a random API entry', exampleResponse: '{"count":1,"entries":[{"API":"RandomDog","Description":"Random pictures of dogs","Auth":"","HTTPS":true,"Cors":"yes","Link":"https://random.dog/woof.json","Category":"Animals"}]}' },
    ],
  },
  {
    id: 'cat-facts',
    name: 'Cat Facts API',
    description: 'Daily cat facts, straight from the litter box.',
    category: 'Animals',
    documentationUrl: 'https://catfact.ninja/docs',
    Icon: ImageIcon, // Using ImageIcon as a placeholder for animal related
    endpoints: [
      { method: 'GET', path: '/fact', description: 'Get a random cat fact', exampleResponse: '{"fact":"A cat can spend five or more hours a day grooming himself.","length":59}' },
      { method: 'GET', path: '/facts?limit=3', description: 'Get multiple cat facts', exampleResponse: '{"current_page":1,"data":[{"fact":"Cats step with both left legs, then both right legs when they walk or run.","length":71},{...}]}' },
    ],
  },
  {
    id: 'coingecko',
    name: 'CoinGecko API',
    description: 'Free cryptocurrency data API.',
    category: 'Finance',
    documentationUrl: 'https://www.coingecko.com/en/api/documentation',
    Icon: Landmark,
    endpoints: [
      { method: 'GET', path: '/simple/price?ids=bitcoin&vs_currencies=usd', description: 'Get current price of Bitcoin in USD', exampleResponse: '{"bitcoin":{"usd":20000.00}}' },
      { method: 'GET', path: '/coins/list', description: 'List all supported coins', exampleResponse: '[{"id":"bitcoin","symbol":"btc","name":"Bitcoin"},{...}]' },
    ],
  },
  {
    id: 'universities-hipolabs',
    name: 'Universities List API',
    description: 'API to find universities in a specific country.',
    category: 'Education',
    documentationUrl: 'http://universities.hipolabs.com/',
    Icon: BookOpen,
    endpoints: [
      { method: 'GET', path: '/search?country=United+States', description: 'Search universities in the United States', exampleResponse: '[{"name": "Marywood University", "domains": ["marywood.edu"], "web_pages": ["http://www.marywood.edu"], "country": "United States", "alpha_two_code": "US", "state-province": null}, {...}]' },
    ],
  },
];

export const apiCategories = Array.from(new Set(publicApis.map(api => api.category))).sort();
