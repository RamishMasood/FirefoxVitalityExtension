import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import App from "../App";
import "../index.css";

// Create main container
const container = document.createElement("div");
container.id = "root";
document.body.appendChild(container);

// Set up basic styles
document.documentElement.classList.add("light");
document.body.className = "bg-background min-h-screen antialiased";

// Initialize theme from storage
browser.storage.local.get("theme").then((result: { theme?: "light" | "dark" }) => {
  if (result.theme === "dark") {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }
});

// Mount React app
const root = createRoot(container);
root.render(<App />);

// Export empty object to satisfy module requirements
export default {};