import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Tag, Save, Clock, X } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";

interface BookmarkItem {
  id: string;
  url: string;
  title: string;
  tags: string[];
  readLater: boolean;
  timestamp: number;
}

export default function BookmarkTools() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const stored = await storage.get<BookmarkItem[]>(StorageKeys.BOOKMARKS);
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
          readLater: false,
          timestamp: Date.now()
        };

        const updated = [newBookmark, ...bookmarks];
        await storage.set(StorageKeys.BOOKMARKS, updated);
        setBookmarks(updated);
        setSelectedBookmark(newBookmark.id);

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

  const addTag = async (bookmarkId: string) => {
    if (!newTag.trim()) return;

    const updated = bookmarks.map(bookmark => {
      if (bookmark.id === bookmarkId && !bookmark.tags.includes(newTag)) {
        return {
          ...bookmark,
          tags: [...bookmark.tags, newTag.trim()]
        };
      }
      return bookmark;
    });

    await storage.set(StorageKeys.BOOKMARKS, updated);
    setBookmarks(updated);
    setNewTag("");
  };

  const removeTag = async (bookmarkId: string, tagToRemove: string) => {
    const updated = bookmarks.map(bookmark => {
      if (bookmark.id === bookmarkId) {
        return {
          ...bookmark,
          tags: bookmark.tags.filter(tag => tag !== tagToRemove)
        };
      }
      return bookmark;
    });

    await storage.set(StorageKeys.BOOKMARKS, updated);
    setBookmarks(updated);
  };

  const toggleReadLater = async (bookmarkId: string) => {
    const updated = bookmarks.map(bookmark => {
      if (bookmark.id === bookmarkId) {
        return {
          ...bookmark,
          readLater: !bookmark.readLater
        };
      }
      return bookmark;
    });

    await storage.set(StorageKeys.BOOKMARKS, updated);
    setBookmarks(updated);
  };

  return (
    <Card className="p-4 space-y-4">
      <Button onClick={saveCurrentPage} className="w-full">
        <Bookmark className="mr-2 h-4 w-4" />
        Save Current Page
      </Button>

      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="space-y-2 p-3 border rounded-lg">
            <div className="flex justify-between items-start">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
              >
                {bookmark.title}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleReadLater(bookmark.id)}
                className={bookmark.readLater ? "text-primary" : "text-muted-foreground"}
              >
                <Clock className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(bookmark.id, tag)}
                  />
                </Badge>
              ))}
            </div>

            {selectedBookmark === bookmark.id && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag(bookmark.id)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => addTag(bookmark.id)}
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}