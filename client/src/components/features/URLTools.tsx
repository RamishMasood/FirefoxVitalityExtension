import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, QrCode } from "lucide-react";
import { storage, createStorageItem } from "@/lib/storage";

export default function URLTools() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const { toast } = useToast();

  const shortenUrl = async () => {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const shortened = await response.text();
      setShortUrl(shortened);
      
      // Save to history
      const history = await storage.get<any[]>("url-history") || [];
      await storage.set("url-history", [
        createStorageItem({ original: url, shortened }),
        ...history.slice(0, 9)
      ]);

      toast({
        title: "URL Shortened",
        description: "URL has been shortened successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shorten URL",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied",
      description: "URL copied to clipboard"
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Enter URL to shorten"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={shortenUrl} className="w-full">
            <Link2 className="mr-2 h-4 w-4" />
            Shorten URL
          </Button>
        </div>
      </div>

      {shortUrl && (
        <div className="space-y-2">
          <Input value={shortUrl} readOnly />
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="secondary">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
