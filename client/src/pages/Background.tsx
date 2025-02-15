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
        // Handle URL shortening
      }
      break;
    case "SAVE_BOOKMARK":
      if (message.url && message.title) {
        // Handle bookmark saving
      }
      break;
    default:
      break;
  }
});

// Keep service worker alive
const keepAlive = () => setTimeout(keepAlive, 25000);
keepAlive();