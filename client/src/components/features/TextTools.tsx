import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Type, ClipboardCheck, Hash } from "lucide-react";

export default function TextTools() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const formatText = () => {
    // Basic formatting: trim extra spaces, capitalize sentences
    const formatted = text
      .replace(/\s+/g, " ")
      .replace(/(^\w|\.\s+\w)/g, letter => letter.toUpperCase());
    setText(formatted);
    
    toast({
      title: "Text Formatted",
      description: "Text has been formatted successfully"
    });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <Textarea
        placeholder="Enter text to format..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[200px]"
      />
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="flex items-center">
            <Hash className="mr-1 h-4 w-4" />
            {wordCount} words, {charCount} characters
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={formatText} variant="secondary">
            <Type className="mr-2 h-4 w-4" />
            Format
          </Button>
          <Button onClick={copyToClipboard}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>
    </Card>
  );
}
