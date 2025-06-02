"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "json", className }: CodeBlockProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Copied!", description: "Code copied to clipboard." });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to copy", description: "Could not copy code to clipboard." });
      console.error("Failed to copy: ", err);
    }
  };
  
  let formattedCode = code;
  if (language === "json") {
    try {
      const parsedJson = JSON.parse(code);
      formattedCode = JSON.stringify(parsedJson, null, 2);
    } catch (error) {
      // If parsing fails, use the original code string
      // This might happen if the code is not valid JSON
      console.warn("CodeBlock received non-JSON string for language 'json':", code.substring(0,100));
    }
  }


  return (
    <div className={`relative rounded-md bg-muted/50 p-4 my-4 border ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
        <code className={`language-${language}`}>{formattedCode}</code>
      </pre>
    </div>
  );
}
