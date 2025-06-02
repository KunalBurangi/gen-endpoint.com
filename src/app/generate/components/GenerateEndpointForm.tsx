
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CodeBlock } from "@/components/CodeBlock";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Network, Settings, FileCode, Package } from "lucide-react"; // Changed PackageOutput to Package
import { generateApiEndpoint, type GenerateApiEndpointInput, type GenerateApiEndpointOutput } from "@/ai/flows/generate-api-endpoint";
import { getUserApiKey } from "./ApiKeyManager";
import { Badge } from "@/components/ui/badge";

const FormSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }),
});

type FormData = z.infer<typeof FormSchema>;

export function GenerateEndpointForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<GenerateApiEndpointOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedOutput(null);
    const userApiKey = getUserApiKey();
    const inputData: GenerateApiEndpointInput = { 
      prompt: data.prompt,
    };
    if (userApiKey) {
      inputData.userApiKey = userApiKey;
    }

    try {
      const result = await generateApiEndpoint(inputData);
      setGeneratedOutput(result);
      toast({ title: "Success", description: "API Endpoint details generated." });
    } catch (error) {
      console.error("Error generating API endpoint:", error);
      let description = "Failed to generate API endpoint details.";
      if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
          description = "API key not valid. Please check your key in the API Key Manager section.";
        } else if (error.message.includes("json")) {
            description = "The AI returned an invalid format. Please try again or rephrase your prompt.";
        }
      }
      toast({ variant: "destructive", title: "Error", description });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe the API endpoint you want to create:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., An API that returns a list of 5 random cat names. It should be a GET request at /api/cats/random."
                    rows={5}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {generatedOutput && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center">
                    <Network className="h-4 w-4 mr-2 text-accent" />
                    Suggested Path & Method:
                </h3>
                <div className="flex items-center gap-2">
                    <Badge variant={
                        generatedOutput.httpMethod === 'GET' ? 'default' :
                        generatedOutput.httpMethod === 'POST' ? 'secondary' : // Should be different colors
                        generatedOutput.httpMethod === 'PUT' ? 'outline' : // Customize as needed
                        generatedOutput.httpMethod === 'DELETE' ? 'destructive' : 'default' // Fallback
                    }
                    className={
                        generatedOutput.httpMethod === 'GET' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        generatedOutput.httpMethod === 'POST' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        generatedOutput.httpMethod === 'PUT' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                        generatedOutput.httpMethod === 'DELETE' ? 'bg-red-600 hover:bg-red-700 text-white' :
                        'bg-gray-500 hover:bg-gray-600 text-white'
                      }
                    >
                        {generatedOutput.httpMethod}
                    </Badge>
                    <p className="text-sm font-mono bg-muted p-2 rounded-md">{generatedOutput.suggestedPath}</p>
                </div>

              </div>

              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center">
                    <FileCode className="h-4 w-4 mr-2 text-accent" />
                    Generated Handler Code (for route.ts):
                </h3>
                <CodeBlock code={generatedOutput.handlerFunctionCode} language="typescript" />
                <p className="text-xs text-muted-foreground mt-1">
                  To use this, create a <code className="text-xs bg-muted px-1 py-0.5 rounded">{generatedOutput.suggestedPath}/route.ts</code> file and paste this code.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-accent" /> {/* Changed PackageOutput to Package */}
                    Example JSON Response:
                </h3>
                <CodeBlock code={generatedOutput.exampleResponse} language="json" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Settings className="mr-2 h-4 w-4" />
            Generate API Endpoint
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
