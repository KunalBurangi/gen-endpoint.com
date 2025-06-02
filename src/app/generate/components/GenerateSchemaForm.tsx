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
    setIsLoading(true);
    setJsonSchema(null);
    try {
      const result = await generateJsonSchema(data as GenerateJsonSchemaInput);
      setJsonSchema(result.jsonSchema);
      toast({ title: "Success", description: "JSON Schema generated." });
    } catch (error) {
      console.error("Error generating JSON schema:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate JSON schema." });
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
