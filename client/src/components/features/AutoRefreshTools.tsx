import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Clock, Timer } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";

interface TabRefresh {
  tabId: number;
  title: string;
  url: string;
  interval: number;
  isActive: boolean;
  lastRefresh?: number;
}

export default function AutoRefreshTools() {
  const [tabs, setTabs] = useState<TabRefresh[]>([]);
  const [interval, setInterval] = useState(60);
  const { toast } = useToast();

  useEffect(() => {
    loadTabs();
    const checkInterval = setInterval(checkAndRefreshTabs, 1000);
    return () => clearInterval(checkInterval);
  }, []);

  const loadTabs = async () => {
    try {
      const currentTabs = await browser.tabs.query({});
      const storedRefreshes = await storage.get<TabRefresh[]>('tabRefreshes') || [];
      
      const updatedTabs = currentTabs.map(tab => {
        const stored = storedRefreshes.find(r => r.tabId === tab.id);
        return {
          tabId: tab.id!,
          title: tab.title || 'Unnamed Tab',
          url: tab.url || '',
          interval: stored?.interval || interval,
          isActive: stored?.isActive || false,
          lastRefresh: stored?.lastRefresh
        };
      });

      setTabs(updatedTabs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load tabs",
        variant: "destructive"
      });
    }
  };

  const toggleRefresh = async (tabId: number) => {
    const updatedTabs = tabs.map(tab =>
      tab.tabId === tabId
        ? { ...tab, isActive: !tab.isActive, lastRefresh: Date.now() }
        : tab
    );
    
    setTabs(updatedTabs);
    await storage.set('tabRefreshes', updatedTabs);

    toast({
      title: updatedTabs.find(t => t.tabId === tabId)?.isActive 
        ? "Auto-refresh Enabled" 
        : "Auto-refresh Disabled",
      description: "Tab refresh settings updated"
    });
  };

  const updateInterval = async (tabId: number, newInterval: number) => {
    const updatedTabs = tabs.map(tab =>
      tab.tabId === tabId
        ? { ...tab, interval: newInterval }
        : tab
    );
    
    setTabs(updatedTabs);
    await storage.set('tabRefreshes', updatedTabs);
  };

  const checkAndRefreshTabs = async () => {
    const now = Date.now();
    const activeTabs = tabs.filter(tab => tab.isActive);

    for (const tab of activeTabs) {
      if (!tab.lastRefresh || (now - tab.lastRefresh >= tab.interval * 1000)) {
        try {
          await browser.tabs.reload(tab.tabId);
          
          const updatedTabs = tabs.map(t =>
            t.tabId === tab.tabId
              ? { ...t, lastRefresh: now }
              : t
          );
          
          setTabs(updatedTabs);
          await storage.set('tabRefreshes', updatedTabs);
        } catch (error) {
          console.error(`Failed to refresh tab ${tab.tabId}:`, error);
        }
      }
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        {tabs.map((tab) => (
          <div key={tab.tabId} className="space-y-2 p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{tab.title}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {tab.url}
                </div>
              </div>
              <Switch
                checked={tab.isActive}
                onCheckedChange={() => toggleRefresh(tab.tabId)}
              />
            </div>

            {tab.isActive && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={tab.interval}
                  onChange={(e) => updateInterval(tab.tabId, parseInt(e.target.value) || 60)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">seconds</span>
                {tab.lastRefresh && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    Last refresh: {new Date(tab.lastRefresh).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {tabs.length === 0 && (
          <div className="text-center text-muted-foreground">
            No tabs available for auto-refresh
          </div>
        )}
      </div>

      <Button onClick={loadTabs} variant="outline" className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Reload Tabs
      </Button>
    </Card>
  );
}
