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

const isValidJsonString = (str: string) => {
  try {
    const parsed = JSON.parse(str);
    // Basic check for schema structure
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
    setIsLoading(true);
    setJsonExample(null);
    try {
      const result = await generateJsonFromSchema(data as GenerateJsonFromSchemaInput);
      setJsonExample(result.jsonExample);
      toast({ title: "Success", description: "Example JSON generated." });
    } catch (error) {
      console.error("Error generating example JSON:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate example JSON." });
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
