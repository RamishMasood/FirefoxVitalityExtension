import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Rss, BookOpen, Download, Moon } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";

interface FeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface Feed {
  id: string;
  url: string;
  title: string;
  items: FeedItem[];
  lastUpdate: number;
}

interface SavedArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  timestamp: number;
}

export default function RSSTools() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFeeds();
    loadArticles();
  }, []);

  const loadFeeds = async () => {
    const saved = await storage.get<Feed[]>(StorageKeys.USER_PREFERENCES + '_feeds') || [];
    setFeeds(saved);
  };

  const loadArticles = async () => {
    const saved = await storage.get<SavedArticle[]>(StorageKeys.USER_PREFERENCES + '_articles') || [];
    setArticles(saved);
  };

  const addFeed = async () => {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(newFeedUrl)}`);
      const data = await response.json();

      const feed: Feed = {
        id: crypto.randomUUID(),
        url: newFeedUrl,
        title: data.feed.title,
        items: data.items.map((item: any) => ({
          id: crypto.randomUUID(),
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate
        })),
        lastUpdate: Date.now()
      };

      const updated = [feed, ...feeds];
      await storage.set(StorageKeys.USER_PREFERENCES + '_feeds', updated);
      setFeeds(updated);
      setNewFeedUrl("");

      toast({
        title: "Feed Added",
        description: "RSS feed has been added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add RSS feed",
        variant: "destructive"
      });
    }
  };

  const refreshFeeds = async () => {
    try {
      const updatedFeeds = await Promise.all(
        feeds.map(async (feed) => {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
          const data = await response.json();

          return {
            ...feed,
            items: data.items.map((item: any) => ({
              id: crypto.randomUUID(),
              title: item.title,
              link: item.link,
              description: item.description,
              pubDate: item.pubDate
            })),
            lastUpdate: Date.now()
          };
        })
      );

      await storage.set(StorageKeys.USER_PREFERENCES + '_feeds', updatedFeeds);
      setFeeds(updatedFeeds);

      toast({
        title: "Feeds Updated",
        description: "All feeds have been refreshed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not refresh feeds",
        variant: "destructive"
      });
    }
  };

  const saveArticle = async (feedItem: FeedItem) => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      const result = await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const article = document.querySelector('article');
          return article ? article.innerHTML : document.body.innerHTML;
        }
      });

      const savedArticle: SavedArticle = {
        id: crypto.randomUUID(),
        title: feedItem.title,
        content: result[0].result,
        url: feedItem.link,
        timestamp: Date.now()
      };

      const updated = [savedArticle, ...articles];
      await storage.set(StorageKeys.USER_PREFERENCES + '_articles', updated);
      setArticles(updated);

      toast({
        title: "Article Saved",
        description: "Article has been saved for offline reading"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save article",
        variant: "destructive"
      });
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    await browser.scripting.executeScript({
      target: { tabId: (await browser.tabs.query({ active: true, currentWindow: true }))[0].id! },
      func: (dark: boolean) => {
        document.documentElement.style.filter = dark ? 'invert(1) hue-rotate(180deg)' : '';
        document.body.style.backgroundColor = dark ? '#ffffff' : '';
      },
      args: [newDarkMode]
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter RSS feed URL"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
          />
          <Button onClick={addFeed}>
            <Rss className="mr-2 h-4 w-4" />
            Add Feed
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Dark Reader</h4>
            <p className="text-sm text-muted-foreground">
              Enable dark mode for articles
            </p>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={toggleDarkMode}
          />
        </div>

        {feeds.map((feed) => (
          <div key={feed.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{feed.title}</h3>
              <span className="text-sm text-muted-foreground">
                Updated: {new Date(feed.lastUpdate).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-2">
              {feed.items.map((item) => (
                <div key={item.id} className="p-2 border rounded">
                  <div className="flex justify-between items-start">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </a>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveArticle(item)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(item.link, '_blank')}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(item.pubDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {feeds.length > 0 && (
          <Button onClick={refreshFeeds} variant="outline" className="w-full">
            <Rss className="mr-2 h-4 w-4" />
            Refresh All Feeds
          </Button>
        )}
      </div>
    </Card>
  );
}
