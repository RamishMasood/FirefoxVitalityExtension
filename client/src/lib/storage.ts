import browser from 'webextension-polyfill';
import crypto from 'crypto';

export interface StorageItem<T> {
  id: string;
  timestamp: number;
  data: T;
}

export const storage = {
  async set(key: string, value: any): Promise<void> {
    try {
      await browser.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await browser.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await browser.storage.local.remove(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await browser.storage.local.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Helper method to get all storage data
  async getAll(): Promise<{ [key: string]: any }> {
    try {
      return await browser.storage.local.get(null);
    } catch (error) {
      console.error('Error getting all data:', error);
      throw error;
    }
  }
};

export const createStorageItem = <T>(data: T): StorageItem<T> => ({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  data
});

// Storage keys used throughout the application
export const StorageKeys = {
  THEME: 'theme',
  BOOKMARKS: 'bookmarks',
  URL_HISTORY: 'url-history',
  CLIPBOARD_HISTORY: 'clipboard-history',
  USER_PREFERENCES: 'user-preferences'
} as const;