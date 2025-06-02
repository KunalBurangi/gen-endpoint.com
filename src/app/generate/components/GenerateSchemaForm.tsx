
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
import { generateJsonSchema, type GenerateJsonSchemaInput } from "@/ai/flows/generate-json-schema";
import { getUserApiKey } from "./ApiKeyManager";

const isValidJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const FormSchema = z.object({
  exampleJson: z.string().min(2, { message: "Example JSON must not be empty." })
    .refine(isValidJsonString, { message: "Invalid JSON format." }),
});

type FormData = z.infer<typeof FormSchema>;

export function GenerateSchemaForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [jsonSchema, setJsonSchema] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      exampleJson: "",
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
    setJsonSchema(null);

    const inputData: GenerateJsonSchemaInput = {
      exampleJson: data.exampleJson,
      userApiKey: userApiKey, 
    };

    try {
      const result = await generateJsonSchema(inputData);
      setJsonSchema(result.jsonSchema);
      toast({ title: "Success", description: "JSON Schema generated." });
    } catch (error) {
      console.error("Error generating JSON schema:", error);
      let description = "Failed to generate JSON schema.";
      if (error instanceof Error) {
        if (error.message.includes("User API key is required")) {
          description = "A Google AI API key is required. Please provide one in the API Key Manager section above.";
        } else if (error.message.includes("API key not valid")) {
          description = "API key not valid. Please check your key in the API Key Manager section.";
        } else if (error.message.includes("503") || error.message.toLowerCase().includes("model is overloaded") || error.message.toLowerCase().includes("service unavailable")) {
          description = "The AI model is currently overloaded or unavailable. Please try again in a few moments.";
        } else if (error.message.includes("AI response could not be parsed")) {
          description = "The AI returned a response that couldn't be understood. Please try rephrasing your input or try again later.";
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
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="exampleJson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paste your example JSON response:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{ "name": "John Doe", "age": 30, "isStudent": false }'
                    rows={8}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {jsonSchema && (
            <div>
              <h3 className="text-sm font-medium mb-1">Generated JSON Schema:</h3>
              <CodeBlock code={jsonSchema} language="json" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Schema
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

