import { CatalogItem } from '../../types/catalog';

const DB_NAME = 'AnimatedCatalogDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'items';
const STORE_METADATA = 'metadata';

class CatalogStorage {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private getDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event: any) => {
            const db = event.target.result as IDBDatabase;
            if (!db.objectStoreNames.contains(STORE_ITEMS)) {
              db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_METADATA)) {
              db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
            }
          };

          request.onsuccess = (event: any) => {
            resolve(event.target.result as IDBDatabase);
          };

          request.onerror = (err) => {
            console.warn('[CatalogStorage] IndexedDB open error:', err);
            resolve(null);
          };
        } catch (e) {
          console.warn('[CatalogStorage] IndexedDB initialization failed:', e);
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  async saveItems(items: CatalogItem[]): Promise<void> {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_ITEMS, 'readwrite');
        const store = tx.objectStore(STORE_ITEMS);

        items.forEach((item) => {
          if (item.id) {
            store.put(item);
          }
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) {
        console.warn('[CatalogStorage] Failed to save items:', e);
        resolve();
      }
    });
  }

  async getItems(): Promise<CatalogItem[]> {
    const db = await this.getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_ITEMS, 'readonly');
        const store = tx.objectStore(STORE_ITEMS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      } catch (e) {
        console.warn('[CatalogStorage] Failed to get items:', e);
        resolve([]);
      }
    });
  }

  async saveMetadata(id: string | number, data: any): Promise<void> {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_METADATA, 'readwrite');
        const store = tx.objectStore(STORE_METADATA);
        store.put({ key: String(id), data, timestamp: Date.now() });

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) {
        console.warn('[CatalogStorage] Failed to save metadata:', e);
        resolve();
      }
    });
  }

  async getMetadata(id: string | number): Promise<any | null> {
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_METADATA, 'readonly');
        const store = tx.objectStore(STORE_METADATA);
        const request = store.get(String(id));

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      } catch (e) {
        console.warn('[CatalogStorage] Failed to get metadata:', e);
        resolve(null);
      }
    });
  }

  async getItemsWithRevalidate(
    revalidateFn?: (cached: CatalogItem[]) => Promise<CatalogItem[] | void>
  ): Promise<CatalogItem[]> {
    const cached = await this.getItems();
    
    if (revalidateFn && typeof revalidateFn === 'function') {
      // Fire background revalidation asynchronously without blocking return
      setTimeout(async () => {
        try {
          const fresh = await revalidateFn(cached);
          if (fresh && Array.isArray(fresh) && fresh.length > 0) {
            await this.saveItems(fresh);
          }
        } catch (e) {
          console.warn('[CatalogStorage] Revalidation background error:', e);
        }
      }, 50);
    }

    return cached;
  }

  async clearStorage(): Promise<void> {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_ITEMS, STORE_METADATA], 'readwrite');
        tx.objectStore(STORE_ITEMS).clear();
        tx.objectStore(STORE_METADATA).clear();

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) {
        console.warn('[CatalogStorage] Failed to clear storage:', e);
        resolve();
      }
    });
  }
}

export const catalogStorage = new CatalogStorage();
