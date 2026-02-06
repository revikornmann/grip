export const STORAGE_VERSION = 1;

export const STORAGE_PREFIX = 'tax-calc:';

export interface StorageMeta {
  version: number;
  updatedAt: string;
}

export interface StorageEntry<T> {
  data: T;
  meta: StorageMeta;
}

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
}
