import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Cookie, Shield, Clock } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";

interface CleanupSchedule {
  enabled: boolean;
  interval: number; // in minutes
  lastRun?: number;
}

export default function PrivacyTools() {
  const [schedule, setSchedule] = useState<CleanupSchedule>({
    enabled: false,
    interval: 60
  });
  const { toast } = useToast();

  const clearBrowsingData = async () => {
    try {
      await browser.browsingData.remove({
        since: 0
      }, {
        cache: true,
        cookies: true,
        downloads: true,
        formData: true,
        history: true,
        passwords: true
      });

      toast({
        title: "Cleared",
        description: "Browsing data has been cleared"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear browsing data",
        variant: "destructive"
      });
    }
  };

  const toggleSchedule = async (enabled: boolean) => {
    const newSchedule = { ...schedule, enabled };
    setSchedule(newSchedule);
    await storage.set(StorageKeys.USER_PREFERENCES, {
      cleanupSchedule: newSchedule
    });

    if (enabled) {
      // Set up cleanup interval
      browser.alarms.create("cleanup", {
        periodInMinutes: schedule.interval
      });
    } else {
      browser.alarms.clear("cleanup");
    }

    toast({
      title: enabled ? "Enabled" : "Disabled",
      description: `Auto cleanup has been ${enabled ? "enabled" : "disabled"}`
    });
  };

  const updateInterval = async (minutes: number) => {
    const newSchedule = { ...schedule, interval: minutes };
    setSchedule(newSchedule);
    await storage.set(StorageKeys.USER_PREFERENCES, {
      cleanupSchedule: newSchedule
    });

    if (schedule.enabled) {
      browser.alarms.create("cleanup", {
        periodInMinutes: minutes
      });
    }

    toast({
      title: "Updated",
      description: "Cleanup interval has been updated"
    });
  };

  const clearCookies = async () => {
    try {
      await browser.cookies.removeAll({});
      toast({
        title: "Cleared",
        description: "All cookies have been removed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cookies",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Auto Cleanup</h4>
            <p className="text-sm text-muted-foreground">
              Automatically clear browsing data
            </p>
          </div>
          <Switch
            checked={schedule.enabled}
            onCheckedChange={toggleSchedule}
          />
        </div>

        {schedule.enabled && (
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={schedule.interval}
              onChange={(e) => updateInterval(parseInt(e.target.value))}
              placeholder="Interval in minutes"
            />
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={clearBrowsingData}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Browsing Data
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={clearCookies}
          >
            <Cookie className="mr-2 h-4 w-4" />
            Clear All Cookies
          </Button>
        </div>
      </div>
    </Card>
  );
}
