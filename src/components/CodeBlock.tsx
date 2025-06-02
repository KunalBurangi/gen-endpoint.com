
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

  let formattedCode = code;
  if (language === "json") {
    try {
      // Attempt to parse and re-stringify to ensure consistent formatting if it's valid JSON
      if (typeof code === 'string' && (code.trim().startsWith("{") || code.trim().startsWith("["))) {
        const parsedJson = JSON.parse(code);
        formattedCode = JSON.stringify(parsedJson, null, 2);
      } else {
        // If it's not a JSON object/array string, or already formatted, keep as is.
        formattedCode = code;
      }
    } catch (error) {
      // If parsing fails, it's likely not valid JSON or a simple string. Use the original.
      // console.warn("CodeBlock received non-JSON or malformed JSON string for language 'json':", code.substring(0,100));
      formattedCode = code; 
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedCode);
      toast({ title: "Copied!", description: "Code copied to clipboard." });
    } catch (err) {
      console.error("Failed to copy code: ", err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy code to clipboard." });
    }
  };
    
  return (
    <div className={`relative rounded-md bg-muted/50 p-4 my-2 border ${className}`}>
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
