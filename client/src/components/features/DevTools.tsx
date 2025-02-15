import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Code2, Palette, FileJson } from "lucide-react";

declare global {
  interface Window {
    EyeDropper: new () => EyeDropper;
  }
}

export default function DevTools() {
  const [json, setJson] = useState("");
  const { toast } = useToast();

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(json);
      setJson(JSON.stringify(parsed, null, 2));
      toast({
        title: "JSON Formatted",
        description: "JSON has been formatted successfully"
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON",
        variant: "destructive"
      });
    }
  };

  const pickColor = async () => {
    try {
      if (!window.EyeDropper) {
        throw new Error("EyeDropper API not supported");
      }

      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      await navigator.clipboard.writeText(result.sRGBHex);
      toast({
        title: "Color Picked",
        description: `Color ${result.sRGBHex} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Color picker not supported in this browser",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Enter JSON to format..."
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="font-mono min-h-[200px]"
        />

        <div className="flex gap-2">
          <Button onClick={formatJSON} className="w-full">
            <FileJson className="mr-2 h-4 w-4" />
            Format JSON
          </Button>
          <Button onClick={pickColor} variant="secondary" className="w-full">
            <Palette className="mr-2 h-4 w-4" />
            Pick Color
          </Button>
        </div>
      </div>
    </Card>
  );
}