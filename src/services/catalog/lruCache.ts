export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; expiry: number }>;
  private defaultTTL: number;

  constructor(capacity: number, defaultTTL = 1000 * 60 * 60) {
    this.capacity = capacity;
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: K, value: V, ttl: number = this.defaultTTL): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiry: Date.now() + ttl });
  }

  clear(): void {
    this.cache.clear();
  }
}
