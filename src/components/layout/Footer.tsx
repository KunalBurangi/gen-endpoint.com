"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { Button } from '@/components/ui/button';
import { Heart, Zap, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useChaos } from '@/context/ChaosContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Footer() {
  const { chaosMode, toggleChaosMode } = useChaos();

  useEffect(() => {
    // Ad script injection
    const container = document.getElementById('ad-container-left');
    if (container && !container.querySelector('script[src*="smoggy-construction"]')) {
      const script = document.createElement('script');
      script.src = "//smoggy-construction.com/b.XdVesIdfGvl/0AY/WCcj/Ie/mb9VuWZSUGlnk/P/T/Y/0-MYzBYdwiM/jYAxtUNwj_QZzrNHjuAeyVMDQj";
      script.async = true;
      script.referrerPolicy = 'no-referrer-when-downgrade';
      container.appendChild(script);
    }
  }, []);

  return (
    <footer className="bg-card border-t text-center py-4 mt-4">
      <div className="container mx-auto px-4">
        <AdPlaceholder />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Left Side: Ad Script */}
          <div className="hidden md:block text-left">
            <div id="ad-container-left" className="w-[300px] h-[250px] overflow-hidden relative">
              {/* Script injected via useEffect */}
            </div>
          </div>

          {/* Center: Existing Footer Content */}
          <div className="mt-2 space-y-1 flex flex-col items-center">
            {/* Chaos Mode Toggle */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="chaos-mode" className="flex items-center gap-2 cursor-pointer">
                  <Zap className={`h-4 w-4 ${chaosMode ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">Chaos Mode</span>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Simulates network instability by randomly introducing delays (100-2000ms) and errors (500 Internal Server Error) to API requests.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="chaos-mode"
                checked={chaosMode}
                onCheckedChange={toggleChaosMode}
              />
              {chaosMode && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  Active
                </span>
              )}
            </div>
            {chaosMode && (
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Chaos Mode is enabled. API requests may experience random delays or errors for testing resilience.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Gen-Endpoint. All rights reserved.
            </p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Heart className="h-4 w-4 mr-1.5 text-red-500 fill-red-500" />
              <span>Made with love in India-V3</span>
            </div>
            <Button variant="link" asChild size="sm" className="text-muted-foreground hover:text-primary">
              <Link href="/about">
                About Us
              </Link>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 mt-2">
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                  <span>Sponsor Project</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Support Gen-Endpoint</DialogTitle>
                  <DialogDescription>
                    Choose a method to support the project. Your contribution helps keep the servers running! ❤️
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 space-y-6">

                  {/* UPI Section */}
                  <div className="flex flex-col items-center space-y-2 w-full">
                    <span className="text-sm font-medium text-muted-foreground">Via UPI (India)</span>
                    <div className="bg-white p-2 rounded-lg border shadow-sm">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=kunal.burangi96@okicici&pn=Kunal%20Burangi&cu=INR"
                        alt="UPI QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md">
                      <span className="font-mono">kunal.burangi96@okicici</span>
                    </div>
                  </div>

                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* PayPal Section */}
                  <div className="flex flex-col items-center space-y-2 w-full">
                    <span className="text-sm font-medium text-muted-foreground">Via PayPal (International)</span>
                    <Button className="w-full gap-2" asChild>
                      <Link href="https://paypal.me/KunalBurangi" target="_blank" rel="noopener noreferrer">
                        <span>Donate via PayPal</span>
                      </Link>
                    </Button>
                  </div>

                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Right Side: Empty for balance */}
          <div className="hidden md:block"></div>
        </div>
      </div>
    </footer>
  );
}
