import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, QrCode } from "lucide-react";
import { storage, createStorageItem, StorageKeys } from "@/lib/storage";
import QRCode from "qrcode";

interface URLHistory {
  original: string;
  shortened: string;
  qrCode?: string;
}

export default function URLTools() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState<string>("");
  const { toast } = useToast();

  const shortenUrl = async () => {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const shortened = await response.text();
      setShortUrl(shortened);

      // Generate QR code
      const qrDataURL = await QRCode.toDataURL(shortened);
      setQrCode(qrDataURL);

      // Save to history
      const history = await storage.get<URLHistory[]>(StorageKeys.URL_HISTORY) || [];
      await storage.set(StorageKeys.URL_HISTORY, [
        { original: url, shortened, qrCode: qrDataURL },
        ...history.slice(0, 9)
      ]);

      toast({
        title: "URL Shortened",
        description: "URL has been shortened and QR code generated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process URL",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "QR code has been downloaded"
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Input value={shortUrl} readOnly />
            <Button onClick={() => copyToClipboard(shortUrl)} variant="secondary" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy Short URL
            </Button>
          </div>

          {qrCode && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <Button onClick={downloadQR} variant="outline" className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}