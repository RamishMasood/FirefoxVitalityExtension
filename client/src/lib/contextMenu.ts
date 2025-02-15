import type { Menus, Tabs } from "webextension-polyfill";

export const createContextMenu = () => {
  browser.contextMenus.create({
    id: "omnitools",
    title: "OmniTools",
    contexts: ["all"]
  });

  browser.contextMenus.create({
    id: "shorten-url",
    parentId: "omnitools",
    title: "Shorten URL",
    contexts: ["link"]
  });

  browser.contextMenus.create({
    id: "save-bookmark",
    parentId: "omnitools",
    title: "Save Bookmark",
    contexts: ["page"]
  });

  browser.contextMenus.onClicked.addListener((
    info: Menus.OnClickData,
    tab?: Tabs.Tab
  ) => {
    switch (info.menuItemId) {
      case "shorten-url":
        browser.runtime.sendMessage({
          type: "SHORTEN_URL",
          url: info.linkUrl
        });
        break;
      case "save-bookmark":
        browser.runtime.sendMessage({
          type: "SAVE_BOOKMARK",
          url: tab?.url,
          title: tab?.title
        });
        break;
    }
  });
};