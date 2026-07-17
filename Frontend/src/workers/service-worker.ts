/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  static: `static-assets-${CACHE_VERSION}`,
  dynamic: `dynamic-content-${CACHE_VERSION}`,
  images: `media-cache-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/offline/offline-page.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.includes('assets-') || key.includes('content-'))
          .filter((key) => !Object.values(CACHE_NAMES).includes(key))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/_next/static') || url.pathname.includes('/images/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(request).then((networkResponse) => {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAMES.images).then((cache) => {
            cache.put(request, cacheCopy);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  if (url.origin === 'https://academic-portal-16620c77.fastapicloud.dev') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAMES.dynamic).then((cache) => cache.put(request, cacheCopy));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          throw new Error('No offline fallback for this API route');
        })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedHtml = await caches.match(request);
        if (cachedHtml) return cachedHtml;
        
        const offlinePage = await caches.match('/offline/offline-page.html');
        return offlinePage as Response;
      })
    );
  }
});