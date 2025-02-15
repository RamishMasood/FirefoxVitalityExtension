import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Type, ClipboardCheck, Hash, History, Code, AlignLeft } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClipboardItem {
  text: string;
  timestamp: number;
}

export default function TextTools() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("plain");
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadClipboardHistory();
  }, []);

  const loadClipboardHistory = async () => {
    const history = await storage.get<ClipboardItem[]>(StorageKeys.CLIPBOARD_HISTORY) || [];
    setClipboardHistory(history);
  };

  const saveToClipboardHistory = async (text: string) => {
    const newHistory = [
      { text, timestamp: Date.now() },
      ...clipboardHistory.slice(0, 9)
    ];
    await storage.set(StorageKeys.CLIPBOARD_HISTORY, newHistory);
    setClipboardHistory(newHistory);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const formatText = () => {
    let formatted = text;

    switch (format) {
      case "sentence":
        // Capitalize first letter of each sentence
        formatted = text
          .replace(/\s+/g, " ")
          .replace(/(^\w|\.\s+\w)/g, letter => letter.toUpperCase());
        break;
      case "title":
        // Capitalize first letter of each word
        formatted = text
          .toLowerCase()
          .replace(/\b\w/g, letter => letter.toUpperCase());
        break;
      case "lowercase":
        formatted = text.toLowerCase();
        break;
      case "uppercase":
        formatted = text.toUpperCase();
        break;
      case "html":
        // Basic HTML tags escape
        formatted = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
        break;
      case "markdown":
        // Basic Markdown formatting
        formatted = text
          .replace(/\*\*(.*?)\*\*/g, "**$1**") // Bold
          .replace(/\*(.*?)\*/g, "*$1*")       // Italic
          .replace(/^#\s/gm, "# ")             // Headers
          .replace(/^-\s/gm, "- ");            // Lists
        break;
    }

    setText(formatted);
    toast({
      title: "Text Formatted",
      description: `Text has been formatted as ${format}`
    });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    await saveToClipboardHistory(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const loadFromHistory = (item: ClipboardItem) => {
    setText(item.text);
    toast({
      title: "Loaded",
      description: "Text loaded from history"
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex gap-2">
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plain">Plain Text</SelectItem>
            <SelectItem value="sentence">Sentence Case</SelectItem>
            <SelectItem value="title">Title Case</SelectItem>
            <SelectItem value="lowercase">lowercase</SelectItem>
            <SelectItem value="uppercase">UPPERCASE</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        placeholder="Enter text to format..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[200px] font-mono"
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

      {clipboardHistory.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <History className="mr-2 h-4 w-4" />
            Clipboard History
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {clipboardHistory.map((item, index) => (
              <Button
                key={item.timestamp}
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => loadFromHistory(item)}
              >
                <div className="truncate">
                  {item.text.slice(0, 50)}
                  {item.text.length > 50 ? "..." : ""}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}