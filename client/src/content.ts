import browser from 'webextension-polyfill';
import type { Runtime } from 'webextension-polyfill';

interface ExtensionMessage {
  type: string;
  shortUrl?: string;
  color?: string;
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender: Runtime.MessageSender,
  _sendResponse: (response?: any) => void
) => {
  switch (message.type) {
    case "URL_SHORTENED":
      // Handle shortened URL
      console.log("URL shortened:", message.shortUrl);
      break;
    case "HIGHLIGHT_ADS":
      // Handle ad highlighting
      if (message.color) {
        highlightAds(message.color);
      }
      break;
    default:
      break;
  }
});

// Function to highlight potential ads
function highlightAds(color: string) {
  const adSelectors = [
    '[class*="ad-"]',
    '[class*="ads-"]',
    '[class*="advertisement"]',
    '[id*="ad-"]',
    '[id*="ads-"]',
    'iframe[src*="ad"]',
    'iframe[src*="ads"]',
    'div[aria-label*="Advertisement"]'
  ];

  const elements = document.querySelectorAll(adSelectors.join(','));
  elements.forEach(element => {
    const originalStyle = element.getAttribute('data-original-style') || '';
    element.setAttribute('data-original-style', element.getAttribute('style') || '');
    element.setAttribute('style', `${originalStyle}; border: 2px solid ${color}; background-color: ${color}40 !important;`);
  });
}

// Initialize content script
console.log('OmniTools content script initialized');