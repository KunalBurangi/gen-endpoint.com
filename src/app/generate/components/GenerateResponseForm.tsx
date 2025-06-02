
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
import { generateApiResponse, type GenerateApiResponseInput } from "@/ai/flows/generate-api-response";
import { getUserApiKey } from "./ApiKeyManager";

const FormSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }),
});

type FormData = z.infer<typeof FormSchema>;

export function GenerateResponseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setApiResponse(null);
    const userApiKey = getUserApiKey();
    const inputData: GenerateApiResponseInput = { 
      prompt: data.prompt,
    };
    if (userApiKey) {
      inputData.userApiKey = userApiKey;
    }

    try {
      const result = await generateApiResponse(inputData);
      setApiResponse(result.apiResponse);
      toast({ title: "Success", description: "API response generated." });
    } catch (error) {
      console.error("Error generating API response:", error);
      let description = "Failed to generate API response.";
      if (error instanceof Error && error.message.includes("API key not valid")) {
        description = "API key not valid. Please check your key in the API Key Manager section.";
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
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe your desired API response:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., A list of 3 products, each with an id, name, price, and category. Price should be a number, name a string."
                    rows={5}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {apiResponse && (
            <div>
              <h3 className="text-sm font-medium mb-1">Generated API Response:</h3>
              <CodeBlock code={apiResponse} language="json" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Response
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
