import { createContextMenu } from "../lib/contextMenu";
import type { Runtime } from "webextension-polyfill";

// Initialize context menu
createContextMenu();

// Listen for messages from popup
browser.runtime.onMessage.addListener((
  message: { type: string; url?: string; title?: string },
  sender: Runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  switch (message.type) {
    case "SHORTEN_URL":
      if (message.url) {
        // URL shortening logic
        browser.tabs.sendMessage(sender.tab!.id!, {
          type: "URL_SHORTENED",
          shortUrl: `https://short.url/${btoa(message.url).slice(0, 8)}`
        });
      }
      break;
    case "SAVE_BOOKMARK":
      if (message.url && message.title) {
        browser.bookmarks.create({
          title: message.title,
          url: message.url
        });
      }
      break;
    case "AUTO_REFRESH":
      // Handle auto-refresh requests
      if (message.url) {
        const tabId = sender.tab!.id!;
        browser.alarms.create(`refresh_${tabId}`, {
          periodInMinutes: 1
        });
      }
      break;
    default:
      break;
  }
});

// Handle alarms for auto-refresh
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('refresh_')) {
    const tabId = parseInt(alarm.name.split('_')[1]);
    browser.tabs.reload(tabId);
  }
});

// Keep service worker alive
const keepAlive = () => setTimeout(keepAlive, 25000);
keepAlive();