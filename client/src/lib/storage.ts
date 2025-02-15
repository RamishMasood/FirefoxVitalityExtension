export interface StorageItem {
  id: string;
  timestamp: number;
  data: any;
}

export const storage = {
  async set(key: string, value: any): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  },

  async get<T>(key: string): Promise<T | null> {
    const result = await browser.storage.local.get(key);
    return result[key] || null;
  },

  async remove(key: string): Promise<void> {
    await browser.storage.local.remove(key);
  },

  async clear(): Promise<void> {
    await browser.storage.local.clear();
  }
};

export const createStorageItem = (data: any): StorageItem => ({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  data
});
