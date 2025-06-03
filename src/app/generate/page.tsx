
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateEndpointForm } from "./components/GenerateEndpointForm"; // Renamed
import { GenerateSchemaForm } from "./components/GenerateSchemaForm";
import { GenerateJsonForm } from "./components/GenerateJsonForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bot, PencilRuler, FileJson, FileInput, HelpCircle, KeyRound } from "lucide-react"; // Added HelpCircle, KeyRound
import { ApiKeyManager } from "./components/ApiKeyManager";

export default function GeneratePage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bot className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold font-headline text-primary">AI-Powered API Tools</CardTitle>
              <CardDescription className="text-lg mt-1">
                Generate API endpoint code, JSON schemas, and example JSON using AI.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <ApiKeyManager />

      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-6 w-6 text-primary" />
            How to Get a Google AI API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            To use the AI-powered generation features on this page, you'll need a Google AI API key.
            You can obtain one for free from Google AI Studio (formerly MakerSuite), which typically
            includes a generous free tier suitable for development and testing.
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1.5 text-muted-foreground pl-2">
            <li>
              Navigate to the{" "}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary underline hover:text-primary/80 font-medium"
              >
                Google AI Studio API Key page
              </a>.
            </li>
            <li>Sign in with your Google account if prompted.</li>
            <li>
              Click on "<strong>Create API key</strong>". You might be asked to create a new project or select an existing one.
            </li>
            <li>Once your API key is generated, copy it.</li>
            <li>
              Return to this page, paste your key into the "Your Google AI API Key" input field above, and click "<strong>Save Key</strong>".
              The key is stored only in your browser's local storage.
            </li>
          </ol>
          <p className="text-xs text-muted-foreground pt-2">
            Please refer to Google's official documentation for the most up-to-date information on API key generation, usage limits, and terms of service.
            Using your own key helps ensure you are aware of your usage under Google's free tier or any applicable billing.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="generate-endpoint" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
          <TabsTrigger value="generate-endpoint">
            <PencilRuler className="h-4 w-4 mr-2" />
            Endpoint from Prompt
          </TabsTrigger>
          <TabsTrigger value="generate-schema">
            <FileJson className="h-4 w-4 mr-2" />
            Schema from JSON
          </TabsTrigger>
          <TabsTrigger value="generate-json">
            <FileInput className="h-4 w-4 mr-2" />
            JSON from Schema
            </TabsTrigger>
        </TabsList>

        <TabsContent value="generate-endpoint">
          <Card>
            <CardHeader>
              <CardTitle>Generate API Endpoint from Prompt</CardTitle>
              <CardDescription>
                Describe the API endpoint you need (its behavior, data, path, method), and AI will generate the Next.js handler code and an example response.
              </CardDescription>
            </CardHeader>
            <GenerateEndpointForm />
          </Card>
        </TabsContent>

        <TabsContent value="generate-schema">
          <Card>
            <CardHeader>
              <CardTitle>Generate JSON Schema from Example JSON</CardTitle>
              <CardDescription>
                Provide an example JSON response, and AI will create a JSON schema representing its structure.
              </CardDescription>
            </CardHeader>
            <GenerateSchemaForm />
          </Card>
        </TabsContent>

        <TabsContent value="generate-json">
          <Card>
            <CardHeader>
              <CardTitle>Generate Example JSON from JSON Schema</CardTitle>
              <CardDescription>
                Input a JSON schema, and AI will generate a valid example JSON object matching that schema.
              </CardDescription>
            </CardHeader>
            <GenerateJsonForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
