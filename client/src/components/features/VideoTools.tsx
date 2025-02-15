import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Volume2, VolumeX, Maximize2, Video } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";

interface PiPWindow {
  video: HTMLVideoElement | null;
  isActive: boolean;
}

export default function VideoTools() {
  const [pipWindow, setPipWindow] = useState<PiPWindow>({
    video: null,
    isActive: false
  });
  const { toast } = useToast();

  const enablePiP = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const videos = document.querySelectorAll('video');
          if (videos.length === 0) {
            throw new Error('No video elements found on this page');
          }

          // Get the largest video on the page (likely the main video)
          const mainVideo = Array.from(videos).reduce((largest, current) => {
            const largestArea = largest.offsetWidth * largest.offsetHeight;
            const currentArea = current.offsetWidth * current.offsetHeight;
            return currentArea > largestArea ? current : largest;
          });

          if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled) {
            mainVideo.requestPictureInPicture();
          }
        }
      });

      toast({
        title: "PiP Enabled",
        description: "Video is now playing in picture-in-picture mode"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not enable picture-in-picture mode",
        variant: "destructive"
      });
    }
  };

  const togglePlayPause = async () => {
    if (!pipWindow.video) return;
    
    if (pipWindow.video.paused) {
      await pipWindow.video.play();
    } else {
      await pipWindow.video.pause();
    }
  };

  const toggleMute = () => {
    if (!pipWindow.video) return;
    pipWindow.video.muted = !pipWindow.video.muted;
  };

  return (
    <Card className="p-4 space-y-4">
      <Button onClick={enablePiP} className="w-full">
        <Video className="mr-2 h-4 w-4" />
        Enable Picture-in-Picture
      </Button>

      {pipWindow.isActive && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button onClick={togglePlayPause} variant="outline" className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Play/Pause
            </Button>
            <Button onClick={toggleMute} variant="outline" className="flex-1">
              <Volume2 className="mr-2 h-4 w-4" />
              Mute/Unmute
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
