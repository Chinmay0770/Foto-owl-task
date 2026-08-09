interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly ttl: number = 60_000) {}

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}