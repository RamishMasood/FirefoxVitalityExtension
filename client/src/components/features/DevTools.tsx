import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Code2, Palette, FileJson, Type, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

declare global {
  interface Window {
    EyeDropper: new () => EyeDropper;
  }
}

export default function DevTools() {
  const [json, setJson] = useState("");
  const [css, setCss] = useState("");
  const [regex, setRegex] = useState("");
  const [testText, setTestText] = useState("");
  const [regexFlags, setRegexFlags] = useState("g");
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

  const testRegex = () => {
    try {
      const pattern = new RegExp(regex, regexFlags);
      const matches = [...testText.matchAll(pattern)];

      // Highlight matches in the test text
      let highlightedText = testText;
      matches.reverse().forEach(match => {
        const start = match.index!;
        const end = start + match[0].length;
        highlightedText = 
          highlightedText.slice(0, start) +
          `<mark>${highlightedText.slice(start, end)}</mark>` +
          highlightedText.slice(end);
      });

      setTestText(highlightedText);

      toast({
        title: "Regex Tested",
        description: `Found ${matches.length} matches`
      });
    } catch (error) {
      toast({
        title: "Invalid Regex",
        description: "Please enter a valid regular expression",
        variant: "destructive"
      });
    }
  };

  const getFontInfo = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const selection = window.getSelection();
          if (!selection?.anchorNode) return null;

          const element = selection.anchorNode.parentElement;
          if (!element) return null;

          const styles = window.getComputedStyle(element);
          return {
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            color: styles.color
          };
        }
      });

      toast({
        title: "Font Info Copied",
        description: "Font information has been copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not get font information",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <Tabs defaultValue="json">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="regex">Regex</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="font">Font</TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="space-y-4">
          <Textarea
            placeholder="Enter JSON to format..."
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="font-mono min-h-[200px]"
          />
          <Button onClick={formatJSON} className="w-full">
            <FileJson className="mr-2 h-4 w-4" />
            Format JSON
          </Button>
        </TabsContent>

        <TabsContent value="regex" className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter regex pattern..."
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
            />
            <Input
              placeholder="Flags (e.g., g, i, m)"
              value={regexFlags}
              onChange={(e) => setRegexFlags(e.target.value)}
            />
            <Textarea
              placeholder="Enter text to test..."
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="min-h-[150px]"
            />
            <Button onClick={testRegex} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Test Regex
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="css" className="space-y-4">
          <Textarea
            placeholder="Enter CSS to preview..."
            value={css}
            onChange={(e) => setCss(e.target.value)}
            className="font-mono min-h-[200px]"
          />
          <div className="flex gap-2">
            <Button onClick={pickColor} variant="secondary" className="w-full">
              <Palette className="mr-2 h-4 w-4" />
              Pick Color
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="font" className="space-y-4">
          <Button onClick={getFontInfo} className="w-full">
            <Type className="mr-2 h-4 w-4" />
            Get Font Info
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
}