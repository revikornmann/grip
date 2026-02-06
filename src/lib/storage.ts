import {
  STORAGE_PREFIX,
  STORAGE_VERSION,
  type StorageAdapter,
  type StorageEntry,
} from '@/types/storage';

function prefixKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function isAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = prefixKey('__test__');
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const storage: StorageAdapter = {
  get<T>(key: string): T | null {
    if (!isAvailable()) return null;
    try {
      const raw = window.localStorage.getItem(prefixKey(key));
      if (raw === null) return null;
      const entry: StorageEntry<T> = JSON.parse(raw);
      return entry.data;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isAvailable()) return;
    try {
      const entry: StorageEntry<T> = {
        data: value,
        meta: {
          version: STORAGE_VERSION,
          updatedAt: new Date().toISOString(),
        },
      };
      window.localStorage.setItem(prefixKey(key), JSON.stringify(entry));
    } catch {
      // Storage full or unavailable — fail silently
    }
  },

  remove(key: string): void {
    if (!isAvailable()) return;
    try {
      window.localStorage.removeItem(prefixKey(key));
    } catch {
      // Fail silently
    }
  },

  clear(): void {
    if (!isAvailable()) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // Fail silently
    }
  },

  has(key: string): boolean {
    if (!isAvailable()) return false;
    return window.localStorage.getItem(prefixKey(key)) !== null;
  },

  keys(): string[] {
    if (!isAvailable()) return [];
    const result: string[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k?.startsWith(STORAGE_PREFIX)) {
          result.push(k.slice(STORAGE_PREFIX.length));
        }
      }
    } catch {
      // Fail silently
    }
    return result;
  },
};
