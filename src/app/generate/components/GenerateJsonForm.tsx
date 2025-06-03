
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
import { Loader2 } from "lucide-react";
import { generateJsonFromSchema, type GenerateJsonFromSchemaInput } from "@/ai/flows/generate-json-from-schema";
import { getUserApiKey } from "./ApiKeyManager";

const isValidJsonString = (str: string) => {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null && ('type' in parsed || 'properties' in parsed || '$schema' in parsed);
  } catch (e) {
    return false;
  }
};

const FormSchema = z.object({
  jsonSchema: z.string().min(10, { message: "JSON Schema must not be empty." })
    .refine(isValidJsonString, { message: "Invalid JSON Schema format. Ensure it's a valid JSON object representing a schema." }),
});

type FormData = z.infer<typeof FormSchema>;

export function GenerateJsonForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [jsonExample, setJsonExample] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      jsonSchema: "",
    },
  });

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
    setJsonExample(null);

    const inputData: GenerateJsonFromSchemaInput = {
      jsonSchema: data.jsonSchema,
      userApiKey: userApiKey,
    };

    try {
      const result = await generateJsonFromSchema(inputData);
      setJsonExample(result.jsonExample);
      toast({ title: "Success", description: "Example JSON generated." });
    } catch (error) {
      console.error("Error generating example JSON:", error);
      let title = "Error";
      let description = "An unexpected error occurred while generating example JSON.";

      if (typeof error === 'object' && error !== null) {
        const errorMessage = (error as any).message || String(error);

        if (errorMessage.includes("User API key is required")) {
          description = "A Google AI API key is required. Please provide one in the API Key Manager section above.";
          title = "API Key Required";
        } else if (errorMessage.includes("API key not valid")) {
          description = "API key not valid. Please check your key in the API Key Manager section.";
          title = "Invalid API Key";
        } else if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("model is overloaded") || errorMessage.toLowerCase().includes("service unavailable")) {
          description = "The AI model is currently overloaded or unavailable. Please try again in a few moments.";
          title = "Service Unavailable";
        } else if (errorMessage.includes("AI response could not be parsed")) {
          description = "The AI returned a response that couldn't be understood. Please try rephrasing your input or try again later.";
          title = "AI Response Error";
        } else if (errorMessage) {
          description = errorMessage;
        }
      } else if (typeof error === 'string') {
        description = error;
      }
      
      toast({ variant: "destructive", title: title, description: description });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="jsonSchema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paste your JSON Schema:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{ "type": "object", "properties": { "name": { "type": "string" }, "age": { "type": "integer" } }, "required": ["name", "age"] }'
                    rows={8}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {jsonExample && (
            <div>
              <h3 className="text-sm font-medium mb-1">Generated Example JSON:</h3>
              <CodeBlock code={jsonExample} language="json" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate JSON Example
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}


    