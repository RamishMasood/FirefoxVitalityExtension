import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import App from "./App";
import "./index.css";

// Mock browser API for development environment
if (process.env.NODE_ENV === 'development' && !window.browser) {
  (window as any).browser = {
    storage: {
      local: {
        get: async () => ({}),
        set: async () => {},
      }
    },
    runtime: {
      sendMessage: async () => {},
      onMessage: {
        addListener: () => {},
      },
    },
    tabs: {
      query: async () => ([]),
    },
    contextMenus: {
      create: () => {},
      onClicked: {
        addListener: () => {},
      },
    },
  };
}

createRoot(document.getElementById("root")!).render(<App />);