import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateEndpointForm } from "./components/GenerateEndpointForm"; // Renamed
import { GenerateSchemaForm } from "./components/GenerateSchemaForm";
import { GenerateJsonForm } from "./components/GenerateJsonForm";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, PencilRuler, FileJson, FileInput } from "lucide-react"; // Added more icons
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