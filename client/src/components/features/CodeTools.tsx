import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Code, Save, Share, Tags } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  timestamp: number;
}

export default function CodeTools() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [newSnippet, setNewSnippet] = useState({
    title: "",
    code: "",
    language: "javascript",
    tags: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    const saved = await storage.get<CodeSnippet[]>(StorageKeys.USER_PREFERENCES + '_snippets') || [];
    setSnippets(saved);
  };

  const saveSnippet = async () => {
    if (!newSnippet.title || !newSnippet.code) {
      toast({
        title: "Error",
        description: "Please provide both title and code",
        variant: "destructive"
      });
      return;
    }

    const snippet: CodeSnippet = {
      id: crypto.randomUUID(),
      title: newSnippet.title,
      code: newSnippet.code,
      language: newSnippet.language,
      tags: newSnippet.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      timestamp: Date.now()
    };

    const updated = [snippet, ...snippets];
    await storage.set(StorageKeys.USER_PREFERENCES + '_snippets', updated);
    setSnippets(updated);
    setNewSnippet({
      title: "",
      code: "",
      language: "javascript",
      tags: ""
    });

    toast({
      title: "Snippet Saved",
      description: "Code snippet has been saved"
    });
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Code copied to clipboard"
    });
  };

  const shareToGist = async (snippet: CodeSnippet) => {
    try {
      // Create anonymous gist
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public: true,
          files: {
            [`snippet.${snippet.language}`]: {
              content: snippet.code
            }
          },
          description: snippet.title
        })
      });

      const data = await response.json();
      await navigator.clipboard.writeText(data.html_url);

      toast({
        title: "Shared",
        description: "Gist URL copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create Gist",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Snippet Title"
            value={newSnippet.title}
            onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
          />
          <Select
            value={newSnippet.language}
            onValueChange={(value) => setNewSnippet(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Tags (comma-separated)"
            value={newSnippet.tags}
            onChange={(e) => setNewSnippet(prev => ({ ...prev, tags: e.target.value }))}
          />
          <Textarea
            placeholder="Paste your code here..."
            value={newSnippet.code}
            onChange={(e) => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
            className="font-mono min-h-[200px]"
          />
          <Button onClick={saveSnippet} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Snippet
          </Button>
        </div>

        {snippets.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Saved Snippets</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {snippets.map((snippet) => (
                <div key={snippet.id} className="p-3 border rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{snippet.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {snippet.language} • {new Date(snippet.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(snippet.code)}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareToGist(snippet)}
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {snippet.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {snippet.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
