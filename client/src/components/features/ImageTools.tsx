import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Image, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageInfo {
  src: string;
  width: number;
  height: number;
  alt: string;
  size?: number;
  type?: string;
  selected?: boolean;
}

export default function ImageTools() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [minSize, setMinSize] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const detectImages = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      const results = await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const imgs = Array.from(document.getElementsByTagName('img'));
          return imgs.map(img => ({
            src: img.src,
            width: img.naturalWidth,
            height: img.naturalHeight,
            alt: img.alt,
            type: img.src.split('.').pop()?.toLowerCase()
          }));
        }
      });

      const detectedImages = results[0].result;
      setImages(detectedImages.map(img => ({ ...img, selected: false })));

      toast({
        title: "Images Detected",
        description: `Found ${detectedImages.length} images`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not detect images on this page",
        variant: "destructive"
      });
    }
  };

  const toggleSelect = (index: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, selected: !img.selected } : img
    ));
  };

  const selectAll = () => {
    setImages(prev => prev.map(img => ({ ...img, selected: true })));
  };

  const downloadSelected = async () => {
    try {
      const selectedImages = images.filter(img => 
        img.selected && 
        (typeFilter === "all" || img.type === typeFilter) &&
        (img.width * img.height >= minSize)
      );

      for (const img of selectedImages) {
        const filename = img.src.split('/').pop() || 'image';
        await browser.downloads.download({
          url: img.src,
          filename: filename
        });
      }

      toast({
        title: "Download Started",
        description: `Downloading ${selectedImages.length} images`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not download images",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <Button onClick={detectImages} className="w-full">
        <Image className="mr-2 h-4 w-4" />
        Detect Images
      </Button>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              placeholder="Min size (pixels)"
              value={minSize}
              onChange={(e) => setMinSize(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {images.map((img, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <Checkbox
                  checked={img.selected}
                  onCheckedChange={() => toggleSelect(index)}
                />
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-8 h-8 object-cover"
                />
                <div className="text-sm">
                  <div className="font-medium">{img.type?.toUpperCase()}</div>
                  <div className="text-muted-foreground">
                    {img.width}x{img.height}px
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={selectAll} variant="outline" className="flex-1">
              Select All
            </Button>
            <Button onClick={downloadSelected} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Selected
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
