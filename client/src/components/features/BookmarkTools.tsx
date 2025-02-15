import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Tag, Save } from "lucide-react";
import { storage } from "@/lib/storage";

interface BookmarkItem {
  id: string;
  url: string;
  title: string;
  tags: string[];
  timestamp: number;
}

export default function BookmarkTools() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const stored = await storage.get<BookmarkItem[]>("bookmarks");
    if (stored) {
      setBookmarks(stored);
    }
  };

  const saveCurrentPage = async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (currentTab.url && currentTab.title) {
        const newBookmark: BookmarkItem = {
          id: crypto.randomUUID(),
          url: currentTab.url,
          title: currentTab.title,
          tags: [],
          timestamp: Date.now()
        };

        const updated = [newBookmark, ...bookmarks];
        await storage.set("bookmarks", updated);
        setBookmarks(updated);

        toast({
          title: "Bookmark Saved",
          description: "Current page has been bookmarked"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bookmark",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <Button onClick={saveCurrentPage} className="w-full">
        <Bookmark className="mr-2 h-4 w-4" />
        Save Current Page
      </Button>

      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="space-y-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline"
            >
              {bookmark.title}
            </a>
            
            <div className="flex gap-2">
              {bookmark.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
