import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import URLTools from "./components/features/URLTools";
import TextTools from "./components/features/TextTools";
import DevTools from "./components/features/DevTools";
import BookmarkTools from "./components/features/BookmarkTools";
import PrivacyTools from "./components/features/PrivacyTools";
import VideoTools from "./components/features/VideoTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    browser.storage.local.get("theme").then((result: { theme?: "light" | "dark" }) => {
      if (result.theme) {
        setTheme(result.theme);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    browser.storage.local.set({ theme: newTheme });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={theme}>
        <div className="w-[400px] min-h-[500px] p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">OmniTools</h1>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </div>

          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="dev">Dev</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <URLTools />
            </TabsContent>
            <TabsContent value="text">
              <TextTools />
            </TabsContent>
            <TabsContent value="dev">
              <DevTools />
            </TabsContent>
            <TabsContent value="bookmarks">
              <BookmarkTools />
            </TabsContent>
            <TabsContent value="privacy">
              <PrivacyTools />
            </TabsContent>
            <TabsContent value="video">
              <VideoTools />
            </TabsContent>
          </Tabs>
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;