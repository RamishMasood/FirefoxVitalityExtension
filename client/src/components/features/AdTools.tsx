import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Target, Settings } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";

interface AdPreferences {
  highlightAds: boolean;
  highlightColor: string;
}

export default function AdTools() {
  const [preferences, setPreferences] = useState<AdPreferences>({
    highlightAds: false,
    highlightColor: "#ffeb3b"
  });
  const { toast } = useToast();

  const detectAds = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: (color: string) => {
          // Common ad selectors
          const adSelectors = [
            '[class*="ad-"]',
            '[class*="ads-"]',
            '[class*="advertisement"]',
            '[id*="ad-"]',
            '[id*="ads-"]',
            'iframe[src*="ad"]',
            'iframe[src*="ads"]',
            'div[aria-label*="Advertisement"]'
          ];

          // Find and highlight potential ad elements
          const elements = document.querySelectorAll(adSelectors.join(','));
          elements.forEach(element => {
            const originalStyle = element.getAttribute('data-original-style') || '';
            element.setAttribute('data-original-style', element.getAttribute('style') || '');
            element.setAttribute('style', `${originalStyle}; border: 2px solid ${color}; background-color: ${color}40 !important;`);
          });

          return elements.length;
        },
        args: [preferences.highlightColor]
      });

      toast({
        title: "Ads Detected",
        description: "Potential ad elements have been highlighted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not detect ads on this page",
        variant: "destructive"
      });
    }
  };

  const toggleHighlight = async (enabled: boolean) => {
    const newPreferences = { ...preferences, highlightAds: enabled };
    setPreferences(newPreferences);
    await storage.set(StorageKeys.USER_PREFERENCES + '_adPreferences', newPreferences);

    if (!enabled) {
      // Remove highlights
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const elements = document.querySelectorAll('[data-original-style]');
          elements.forEach(element => {
            const originalStyle = element.getAttribute('data-original-style') || '';
            element.setAttribute('style', originalStyle);
            element.removeAttribute('data-original-style');
          });
        }
      });
    } else {
      detectAds();
    }

    toast({
      title: enabled ? "Enabled" : "Disabled",
      description: `Ad highlighting has been ${enabled ? "enabled" : "disabled"}`
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium">Ad Highlighter</h4>
          <p className="text-sm text-muted-foreground">
            Highlight potential advertisement elements
          </p>
        </div>
        <Switch
          checked={preferences.highlightAds}
          onCheckedChange={toggleHighlight}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={preferences.highlightColor}
            onChange={(e) => setPreferences(prev => ({ ...prev, highlightColor: e.target.value }))}
            className="w-8 h-8 rounded border p-0"
          />
          <span className="text-sm text-muted-foreground">
            Highlight Color
          </span>
        </div>

        <Button onClick={detectAds} className="w-full">
          <Target className="mr-2 h-4 w-4" />
          Detect Ads
        </Button>
      </div>
    </Card>
  );
}
