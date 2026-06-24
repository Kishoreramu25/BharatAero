// Auto-updating "dummy" service worker for local development
// This forcefully deletes old caches and passes all network requests through normally.

self.addEventListener('install', (e) => {
  // Force the new service worker to become active immediately
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
  // Wipe out all existing caches from the old broken service worker
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Do nothing. Let the browser handle all network requests normally!
});
