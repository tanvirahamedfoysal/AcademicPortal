const DB_NAME = 'AcademicPortalDB';
const STORE_NAME = 'ApiCache';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

interface CacheRecord<T> {
  key: string;
  data: T;
  updated_at: string;
}

export const setCache = async <T>(key: string, data: T, updated_at: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const record: CacheRecord<T> = { key, data, updated_at };
    
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getCache = async <T>(key: string): Promise<CacheRecord<T> | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ? (request.result as CacheRecord<T>) : null);
    request.onerror = () => reject(request.error);
  });
};