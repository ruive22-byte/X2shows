export interface CacheItem<T> {
  key: string;
  data: T;
  timestamp: number;
}

export class TmdbIndexedDb {
  private static DB_NAME = 'FakeflixCacheDB';
  private static DB_VERSION = 1;
  private static STORE_NAME = 'tmdb_shows_cache';
  private static DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days TTL

  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves item from IndexedDB if present and not expired
   */
  public static async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const result: CacheItem<T> | undefined = request.result;
          if (!result) return resolve(null);

          const isExpired = Date.now() - result.timestamp > this.DEFAULT_TTL_MS;
          if (isExpired) {
            this.delete(key);
            return resolve(null);
          }

          resolve(result.data);
        };

        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Saves payload into IndexedDB
   */
  public static async set<T>(key: string, data: T): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const record: CacheItem<T> = {
          key,
          data,
          timestamp: Date.now(),
        };

        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // Gracefully continue if IndexedDB storage fails or quota is exceeded
    }
  }

  /**
   * Removes item from IndexedDB store
   */
  public static async delete(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      tx.objectStore(this.STORE_NAME).delete(key);
    } catch {
      // Silent error handling
    }
  }
}
