
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeBlock } from "@/components/CodeBlock";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Network, Settings, FileCode, Package, PlayCircle, Zap } from "lucide-react";
import { generateApiEndpoint, type GenerateApiEndpointInput, type GenerateApiEndpointOutput } from "@/ai/flows/generate-api-endpoint";
import type { ApiEndpoint } from '@/data/apis';
import { InteractiveEndpoint } from "@/app/apis/[id]/components/InteractiveEndpoint";
import { getUserApiKey } from "./ApiKeyManager";
import { Badge } from "@/components/ui/badge";

const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

const FormSchema = z.object({
  httpMethod: z.enum(httpMethods, {
    required_error: "You need to select an HTTP method.",
  }),
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }),
  limit: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  requestBodyExample: z.string().optional().refine((val, ctx) => {
    if (['POST', 'PUT', 'PATCH'].includes(ctx.path[0]?.httpMethod) && val && val.trim() !== "") {
      try {
        JSON.parse(val);
      } catch (e) {
        return false;
      }
    }
    return true;
  }, { message: "If provided for POST/PUT/PATCH, example request body must be valid JSON."}),
});

type FormData = z.infer<typeof FormSchema>;

export function GenerateEndpointForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<GenerateApiEndpointOutput | null>(null);
  const [constructedAiPrompt, setConstructedAiPrompt] = useState<string>(""); // Store the detailed prompt sent to AI
  const [dynamicCurlCommand, setDynamicCurlCommand] = useState<string>(
    '# curl command will appear here once endpoint details are generated.'
  );
  const [displayedRuntimeUrl, setDisplayedRuntimeUrl] = useState<string>("YOUR_APP_ORIGIN/api/runtime/... (will populate when endpoint is generated)");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      httpMethod: "GET",
      prompt: "",
      limit: undefined,
      requestBodyExample: "",
    },
  });

  const watchedHttpMethod = form.watch("httpMethod");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const userApiKey = getUserApiKey();

    if (!userApiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "A Google AI API key is required. Please provide one in the API Key Manager section above.",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedOutput(null);

    let detailedPrompt = `The user wants to create a ${data.httpMethod} API endpoint.`;
    detailedPrompt += `\nMain goal or description: "${data.prompt}"`;

    if (data.limit) {
      detailedPrompt += `\nIt should ideally support a 'limit' query parameter. For example, a limit of ${data.limit}.`;
    }

    if (['POST', 'PUT', 'PATCH'].includes(data.httpMethod) && data.requestBodyExample && data.requestBodyExample.trim() !== "") {
      detailedPrompt += `\nFor the request body, the user provided this example JSON: \n${data.requestBodyExample.trim()}\nThe generated handler code should expect a body similar to this, and the 'exampleRequestBody' output field from the AI should reflect or closely match this user-provided example.`;
    } else if (['POST', 'PUT', 'PATCH'].includes(data.httpMethod)) {
      detailedPrompt += `\nThe user did not provide an example request body for this ${data.httpMethod} request. If a request body is typically needed for the described functionality, please generate a suitable 'exampleRequestBody' and ensure the handler code expects it.`;
    }

    detailedPrompt += `\n\nBased on all this information, please perform the following:
1. Suggest a full URL path for this endpoint (it must start with '/api/').
2. Generate the complete Next.js App Router handler function code (for a 'route.ts' file). This code should be functional, including necessary imports (like 'NextResponse') and the 'export async function ${data.httpMethod}(request) { ... }' structure. If data storage or complex logic is implied, generate a self-contained mock or simple in-memory example within the handler.
3. Provide an 'exampleRequestBody' as a JSON string. If the user supplied an example request body, this output field should be identical or very similar to it. If the method is GET/DELETE, or if no body is appropriate, this can be an empty string or omitted.
4. Provide an 'exampleResponse' as a JSON string, representing what the generated handler code would produce.

Ensure your entire output is a single JSON object matching the required output schema. Do NOT include any markdown formatting like \`\`\`json ... \`\`\` around the JSON object.`;
    
    setConstructedAiPrompt(detailedPrompt);

    const inputData: GenerateApiEndpointInput = {
      prompt: detailedPrompt,
      userApiKey: userApiKey,
    };

    try {
      const result = await generateApiEndpoint(inputData);
      // If user provided a request body, and AI respected it, great.
      // If AI generated one and user didn't, use AI's.
      // If user provided one, but AI's is different (e.g. empty), prefer user's for display IF valid.
      let finalResult = {...result};
      if (['POST', 'PUT', 'PATCH'].includes(data.httpMethod) && data.requestBodyExample && data.requestBodyExample.trim() !== "") {
         try {
            JSON.parse(data.requestBodyExample.trim()); // check if user's is valid JSON
            finalResult.exampleRequestBody = data.requestBodyExample.trim();
         } catch (e) {
            // user's example was not valid JSON, stick with AI's
         }
      }
      setGeneratedOutput(finalResult);
      toast({ title: "Success", description: "API Endpoint details generated." });
    } catch (error) {
      console.error("Error generating API endpoint:", error);
      let description = "Failed to generate API endpoint details.";
      if (error instanceof Error) {
        if (error.message.includes("User API key is required")) {
          description = "A Google AI API key is required. Please provide one in the API Key Manager section above.";
        } else if (error.message.includes("API key not valid")) {
          description = "API key not valid. Please check your key in the API Key Manager section.";
        } else if (error.message.includes("503") || error.message.toLowerCase().includes("model is overloaded") || error.message.toLowerCase().includes("service unavailable")) {
          description = "The AI model is currently overloaded or unavailable. Please try again in a few moments.";
        } else if (error.message.includes("AI response could not be parsed") || error.message.includes("AI generated data that was not valid JSON") || error.message.includes("AI response was empty or could not be parsed to the GenerateApiEndpointOutputSchema") || error.message.includes("AI message")) {
            description = "The AI returned data that couldn't be processed as valid JSON or was empty. Try rephrasing your query or ensure the AI can generate valid JSON for your prompt.";
        }
      }
      toast({ variant: "destructive", title: "Error", description });
    } finally {
      setIsLoading(false);
    }
  };

  let simulatedEndpoint: ApiEndpoint | null = null;
  if (generatedOutput) {
    const method = generatedOutput.httpMethod.toUpperCase() as ApiEndpoint['method'];
    let exampleRequestBodyForSimulation = generatedOutput.exampleRequestBody;

    // Prefer user-provided request body for simulation if it was given for relevant methods
    if (['POST', 'PUT', 'PATCH'].includes(method) && form.getValues('requestBodyExample') && form.getValues('requestBodyExample').trim() !== "") {
        try {
            const parsedUserJson = JSON.parse(form.getValues('requestBodyExample').trim());
            exampleRequestBodyForSimulation = JSON.stringify(parsedUserJson, null, 2);
        } catch (e) {
            console.warn("User-provided requestBodyExample is not valid JSON, using AI's for simulation.");
        }
    } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        // If AI didn't provide one, but user also didn't, create a generic one for simulation
        if (!exampleRequestBodyForSimulation || exampleRequestBodyForSimulation.trim() === "" || exampleRequestBodyForSimulation.trim() === "{}") {
             exampleRequestBodyForSimulation = '{\n  "key": "value",\n  "note": "No specific request body provided by user or AI. Modify this sample body as needed for simulation."\n}';
        }
    }


    simulatedEndpoint = {
      method: method,
      path: generatedOutput.suggestedPath,
      description: "This is a simulation for the AI-generated endpoint. This endpoint is not live until you create its route file.",
      exampleRequest: exampleRequestBodyForSimulation,
      exampleResponse: generatedOutput.exampleResponse,
    };
  }
  
  useEffect(() => {
    if (generatedOutput && generatedOutput.suggestedPath && constructedAiPrompt && typeof window !== "undefined") {
      const slug = generatedOutput.suggestedPath.startsWith('/api/')
        ? generatedOutput.suggestedPath.substring(5)
        : generatedOutput.suggestedPath.startsWith('/')
        ? generatedOutput.suggestedPath.substring(1)
        : generatedOutput.suggestedPath;

      if (slug) {
        const origin = window.location.origin;
        const userApiKey = getUserApiKey();
        const apiKeyHeader = userApiKey ? `-H "X-Goog-Api-Key: ${userApiKey}"` : `-H "X-Goog-Api-Key: YOUR_GOOGLE_AI_KEY"`;
        const contentTypeHeader = `-H "Content-Type: application/json"`;
        const method = generatedOutput.httpMethod.toUpperCase();
        
        let runtimeUrl = `${origin}/api/runtime/${slug}`;
        let command = "";
        
        const formData = form.getValues();

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          let bodyPayload: any = { user_query: constructedAiPrompt }; // Use the detailed constructed prompt
          if (formData.requestBodyExample && formData.requestBodyExample.trim() !== "") {
            try {
              const userExampleParsed = JSON.parse(formData.requestBodyExample.trim());
              // Merge user's example data, but user_query takes precedence if there's a conflict (unlikely)
              bodyPayload = { ...userExampleParsed, ...bodyPayload }; 
            } catch (e) {
              console.warn("Could not parse user's requestBodyExample for runtime curl command.");
            }
          }
          const curlData = `-d '${JSON.stringify(bodyPayload, null, 2)}'`;
          command = `curl -X ${method} "${runtimeUrl}" ${apiKeyHeader} ${contentTypeHeader} ${curlData}`;
          setDisplayedRuntimeUrl(runtimeUrl);
        } else { // GET, DELETE
          runtimeUrl += `?user_query=${encodeURIComponent(constructedAiPrompt)}`;
          command = `curl -X ${method} "${runtimeUrl}" ${apiKeyHeader}`;
          setDisplayedRuntimeUrl(runtimeUrl);
        }
        
        setDynamicCurlCommand(command);
      }
    } else if (!generatedOutput) {
        setDynamicCurlCommand('# curl command will appear here once endpoint details are generated.');
        setDisplayedRuntimeUrl('YOUR_APP_ORIGIN/api/runtime/... (will populate when endpoint is generated)');
    }
  }, [generatedOutput, constructedAiPrompt, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="httpMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select HTTP method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {httpMethods.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optional: Desired Limit (for lists)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe the API endpoint's purpose:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Returns a list of random cat names. Or, creates a new user profile."
                    rows={4}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {['POST', 'PUT', 'PATCH'].includes(watchedHttpMethod) && (
            <FormField
              control={form.control}
              name="requestBodyExample"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optional: Example Request Body (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='e.g., { "name": "Fluffy", "breed": "Persian" }'
                      rows={5}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {generatedOutput && (
            <div className="space-y-6 pt-4 mt-4 border-t">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center text-primary">
                    <Network className="h-5 w-5 mr-2" />
                    Generated Endpoint Details
                </h3>
                 <div className="space-y-1 mb-3">
                    <div className="text-sm font-medium">HTTP Method:
                        <Badge variant={
                            generatedOutput.httpMethod.toUpperCase() === 'GET' ? 'default' :
                            generatedOutput.httpMethod.toUpperCase() === 'POST' ? 'secondary' :
                            generatedOutput.httpMethod.toUpperCase() === 'PUT' ? 'outline' :
                            generatedOutput.httpMethod.toUpperCase() === 'DELETE' ? 'destructive' : 'default'
                        }
                        className={`ml-2 ${
                            generatedOutput.httpMethod.toUpperCase() === 'GET' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                            generatedOutput.httpMethod.toUpperCase() === 'POST' ? 'bg-green-600 hover:bg-green-700 text-white' :
                            generatedOutput.httpMethod.toUpperCase() === 'PUT' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                            generatedOutput.httpMethod.toUpperCase() === 'DELETE' ? 'bg-red-600 hover:bg-red-700 text-white' :
                            'bg-gray-500 hover:bg-gray-600 text-white'
                          }`}
                        >
                            {generatedOutput.httpMethod.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="text-sm font-medium">Suggested Path: <code className="text-sm bg-muted p-1 rounded-md ml-1">{generatedOutput.suggestedPath}</code></div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-1 flex items-center">
                    <FileCode className="h-4 w-4 mr-2 text-accent" />
                    Generated Handler Code (for route.ts):
                </h4>
                <CodeBlock code={generatedOutput.handlerFunctionCode} language="typescript" />
                <p className="text-xs text-muted-foreground mt-1">
                  To make this endpoint live, create a <code className="text-xs bg-muted px-1 py-0.5 rounded">{`src/app${generatedOutput.suggestedPath}/route.ts`}</code> file (creating parent directories if needed) and paste this code.
                </p>
              </div>

              {generatedOutput.exampleRequestBody && generatedOutput.exampleRequestBody.trim() !== "" && (
                <div>
                  <h4 className="text-md font-semibold mb-1 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-accent" />
                      Example JSON Request Body (for generated code):
                  </h4>
                  <CodeBlock code={generatedOutput.exampleRequestBody} language="json" />
                </div>
              )}

              <div>
                <h4 className="text-md font-semibold mb-1 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-accent" />
                    Example JSON Response (from generated code):
                </h4>
                <CodeBlock code={generatedOutput.exampleResponse} language="json" />
              </div>

              {simulatedEndpoint && (
                <Card className="mt-6 bg-background/50 border-dashed border-primary/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <PlayCircle className="h-5 w-5 mr-2 text-primary" />
                      Simulate Generated Code
                    </CardTitle>
                    <CardDescription className="text-xs">
                      This uses the AI-generated example response and potentially an example request body (user-provided if available) to simulate the behavior of the generated handler code. This endpoint is not live until you create the route file.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InteractiveEndpoint endpoint={simulatedEndpoint} isSimulationOnly={true} />
                  </CardContent>
                </Card>
              )}

              {generatedOutput.suggestedPath && constructedAiPrompt && (
                <Card className="mt-6 border-accent/50 bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-accent">
                      <Zap className="h-5 w-5 mr-2" />
                      Experimental: Live AI Runtime Endpoint
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Test fetching dynamic, AI-generated data based on your combined inputs using a special runtime endpoint. This endpoint doesn&apos;t use the handler code above but generates data live using AI, considering the HTTP method and an optional request body.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium">Runtime Endpoint URL ({generatedOutput.httpMethod.toUpperCase()}):</p>
                    <code className="text-sm bg-muted p-1 rounded-md block break-all">
                       {displayedRuntimeUrl}
                    </code>
                    <p className="text-sm mt-2 font-medium">Instructions for Postman/curl:</p>
                    <ol className="list-decimal list-inside text-xs space-y-1 text-muted-foreground">
                      <li>Make a {generatedOutput.httpMethod.toUpperCase()} request to the URL above.</li>
                      <li>You <strong>MUST</strong> include your Google AI API Key as a request header: <code className="text-xs bg-muted px-1 py-0.5 rounded">X-Goog-Api-Key: YOUR_API_KEY</code>.</li>
                      {['POST', 'PUT', 'PATCH'].includes(generatedOutput.httpMethod.toUpperCase()) ? (
                        <li>For {generatedOutput.httpMethod.toUpperCase()} requests, include a JSON body. This body <strong>MUST</strong> contain a <code className="text-xs bg-muted px-1 py-0.5 rounded">user_query</code> field with the detailed constructed prompt text. If you provided an "Example Request Body" in the form, its content will also be included in the example `curl` command's body, merged with `user_query`.</li>
                      ) : (
                        <li>The <code className="text-xs bg-muted px-1 py-0.5 rounded">user_query</code> parameter in the URL should be the detailed constructed prompt (it&apos;s URL-encoded in the example URL).</li>
                      )}
                    </ol>
                    <p className="text-sm mt-2 font-medium">Example <code className="text-xs bg-muted px-1 py-0.5 rounded">curl</code> command:</p>
                    <CodeBlock code={dynamicCurlCommand} language="bash" />
                     <p className="text-xs text-muted-foreground mt-1">
                      Note: Replace <code className="text-xs bg-muted px-1 py-0.5 rounded">YOUR_API_KEY</code> with your actual key if you haven&apos;t saved it in the API Key Manager, or if it&apos;s not detected.
                      For POST/PUT/PATCH, ensure your JSON body includes the `user_query` field (containing the detailed prompt) and any other example data as shown in the `curl` command.
                    </p>
                  </CardContent>
                </Card>
              )}

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

