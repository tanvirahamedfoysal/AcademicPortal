// Device-local cache layer.
//
// Goal: never re-download something the backend says hasn't changed.
// Two stores in one IndexedDB database:
//   - "responses": JSON payloads from GET endpoints, keyed by URL, along
//     with a version marker (an `updated_at` / `last-update` value pulled
//     from the API) so we can tell whether the cached copy is stale.
//   - "media": raw image/file blobs keyed by their source URL, so a photo
//     that hasn't changed is never re-fetched from the network again.
//
// Any component can call cachedGet(url, fetcher, versionFetcher) to get
// stale-while-revalidate behaviour, or the lower level helpers directly.

const DB_NAME = "arp-cache";
const DB_VERSION = 1;
const STORE_RESPONSES = "responses";
const STORE_MEDIA = "media";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_RESPONSES)) {
        db.createObjectStore(STORE_RESPONSES, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function idbGet<T = any>(store: string, key: string): Promise<T | undefined> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result?.value);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function idbSet(store: string, key: string, value: any, version?: string) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put({ key, value, version, cachedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // best-effort cache, never block the app on a write failure
  }
}

async function idbGetEntry(store: string, key: string): Promise<{ value: any; version?: string } | undefined> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

/**
 * Stale-while-revalidate JSON fetch.
 * - Returns cached data instantly if present (via onCache callback).
 * - Always kicks off a network fetch of `fetcher`.
 * - If a `versionKey` is supplied and matches the cached version, the
 *   network response is still fetched (cheap JSON call) but callers can
 *   skip re-rendering heavy media tied to it — the version match tells
 *   the media layer nothing changed.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: { onCache?: (data: T) => void; version?: string } = {}
): Promise<T> {
  const entry = await idbGetEntry(STORE_RESPONSES, key);
  if (entry && opts.onCache) {
    opts.onCache(entry.value as T);
  }
  const fresh = await fetcher();
  await idbSet(STORE_RESPONSES, key, fresh, opts.version);
  return fresh;
}

export async function getCached<T = any>(key: string): Promise<T | undefined> {
  return idbGet<T>(STORE_RESPONSES, key);
}

export async function setCached(key: string, value: any, version?: string) {
  return idbSet(STORE_RESPONSES, key, value, version);
}

/**
 * Media caching: given a remote URL and an optional `updatedAt` marker,
 * return a local object: URL for the image. If a cached blob exists and
 * its stored version matches `updatedAt`, the network is never touched.
 */
export async function getCachedMediaUrl(srcUrl: string, updatedAt?: string): Promise<string> {
  if (!srcUrl) return srcUrl;
  const entry = await idbGetEntry(STORE_MEDIA, srcUrl);
  if (entry && (!updatedAt || entry.version === updatedAt)) {
    return URL.createObjectURL(entry.value as Blob);
  }
  try {
    const res = await fetch(srcUrl);
    if (!res.ok) throw new Error("media fetch failed");
    const blob = await res.blob();
    await idbSet(STORE_MEDIA, srcUrl, blob, updatedAt);
    return URL.createObjectURL(blob);
  } catch {
    // network/media fetch failed — fall back to stale cache if any, else raw URL
    if (entry) return URL.createObjectURL(entry.value as Blob);
    return srcUrl;
  }
}

export async function clearCache() {
  const db = await openDb();
  await Promise.all(
    [STORE_RESPONSES, STORE_MEDIA].map(
      (store) =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(store, "readwrite");
          tx.objectStore(store).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        })
    )
  );
}
