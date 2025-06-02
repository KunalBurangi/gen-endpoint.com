
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Trash2, Save } from "lucide-react";

const API_KEY_STORAGE_KEY = "userGoogleAiApiKey";

export function ApiKeyManager() {
  const [apiKey, setApiKey] = useState("");
  const [storedKeyExists, setStoredKeyExists] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setStoredKeyExists(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      setStoredKeyExists(true);
      toast({ title: "API Key Saved", description: "Your Google AI API key has been saved locally." });
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      setStoredKeyExists(false);
      toast({ title: "API Key Cleared", description: "Your locally stored API key has been removed." });
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey("");
    setStoredKeyExists(false);
    toast({ title: "API Key Cleared", description: "Your locally stored API key has been removed." });
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card mb-6">
      <Label htmlFor="apiKeyInput" className="flex items-center text-sm font-medium">
        <KeyRound className="h-4 w-4 mr-2 text-primary" />
        Your Google AI API Key (Optional)
      </Label>
      <p className="text-xs text-muted-foreground">
        If provided, your own API key will be used for AI generation, utilizing your personal quota.
        The key is stored only in your browser&apos;s local storage.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="apiKeyInput"
          type="password"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSaveKey} variant="default" className="sm:w-auto">
          <Save className="mr-2 h-4 w-4" /> Save Key
        </Button>
        {storedKeyExists && (
          <Button onClick={handleClearKey} variant="outline" className="sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" /> Clear Key
          </Button>
        )}
      </div>
      {storedKeyExists && !apiKey.trim() && (
         <p className="text-xs text-green-600 dark:text-green-400">An API key is currently stored. Enter a new key and save to update, or clear.</p>
      )}
    </div>
  );
}

export function getUserApiKey(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }
  return null;
}
