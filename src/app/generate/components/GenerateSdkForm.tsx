"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeBlock } from "@/components/CodeBlock";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Code2, FileCode } from "lucide-react";
import { generateClientSdk, type GenerateClientSdkInput, type GenerateClientSdkOutput } from "@/ai/flows/generate-client-sdk";
import { getUserApiKey } from "./ApiKeyManager";
import { publicApis } from "@/data/apis";

const FormSchema = z.object({
    apiId: z.string().min(1, { message: "Please select an API." }),
    language: z.enum(['typescript', 'python'], {
        required_error: "Please select a programming language.",
    }),
});

type FormData = z.infer<typeof FormSchema>;

export function GenerateSdkForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<GenerateClientSdkOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            apiId: "",
            language: "typescript",
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
        setGeneratedOutput(null);

        // Find the selected API
        const selectedApi = publicApis.find(api => api.id === data.apiId);
        if (!selectedApi) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Selected API not found.",
            });
            setIsLoading(false);
            return;
        }

        // Convert API definition to JSON string
        const apiDefinition = JSON.stringify({
            name: selectedApi.name,
            description: selectedApi.description,
            endpoints: selectedApi.endpoints,
        }, null, 2);

        const inputData: GenerateClientSdkInput = {
            apiDefinition,
            language: data.language,
            userApiKey: userApiKey,
        };

        try {
            const result = await generateClientSdk(inputData);
            setGeneratedOutput(result);
            toast({ title: "Success", description: "Client SDK generated successfully." });
        } catch (error) {
            console.error("Error generating SDK:", error);
            let title = "Error";
            let description = "An unexpected error occurred while generating the SDK.";

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

    const selectedApiName = publicApis.find(api => api.id === form.watch("apiId"))?.name || "";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="apiId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select API</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose an API" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {publicApis.map(api => (
                                                <SelectItem key={api.id} value={api.id}>{api.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select the API you want to generate a client SDK for.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Programming Language</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="typescript">TypeScript</SelectItem>
                                            <SelectItem value="python">Python</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose the programming language for the SDK.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {generatedOutput && (
                        <div className="space-y-6 pt-4 mt-4 border-t">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center text-primary">
                                    <Code2 className="h-5 w-5 mr-2" />
                                    Generated {form.watch("language") === 'typescript' ? 'TypeScript' : 'Python'} SDK
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    SDK for: <strong>{selectedApiName}</strong>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-md font-semibold mb-1 flex items-center">
                                    <FileCode className="h-4 w-4 mr-2 text-accent" />
                                    SDK Code ({generatedOutput.className}):
                                </h4>
                                <CodeBlock
                                    code={generatedOutput.sdkCode}
                                    language={form.watch("language") === 'typescript' ? 'typescript' : 'python'}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Copy this code into your project to use the SDK.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-md font-semibold mb-1 flex items-center">
                                    <FileCode className="h-4 w-4 mr-2 text-accent" />
                                    Usage Example:
                                </h4>
                                <CodeBlock
                                    code={generatedOutput.usage}
                                    language={form.watch("language") === 'typescript' ? 'typescript' : 'python'}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Example showing how to initialize and use the SDK.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Code2 className="mr-2 h-4 w-4" />
                        Generate SDK
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
