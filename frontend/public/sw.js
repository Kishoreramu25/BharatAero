const CACHE_NAME = 'bharataero-cache-v1';
const DYNAMIC_CACHE_NAME = 'bharataero-dynamic-v1';

// Static files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.webp',
  '/favicon.svg',
  '/icons.svg'
];

// Install Event - Pre-cache critical local assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle intercepting & caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip POST, PUT, DELETE requests and non-http protocols (e.g. chrome-extension)
  if (event.request.method !== 'GET' || !requestUrl.protocol.startsWith('http')) {
    return;
  }

  // Strategy 1: Cache First with Stale-While-Revalidate for Leaflet Libraries & Web Fonts
  const isCdnLib = requestUrl.hostname.includes('unpkg.com') || 
                   requestUrl.hostname.includes('fonts.googleapis.com') ||
                   requestUrl.hostname.includes('fonts.gstatic.com');

  // Strategy 2: Cache First with network fallback for Map Tiles & hosted Pilot Avatar images
  const isMapTile = requestUrl.hostname.includes('tile.openstreetmap.org') ||
                    requestUrl.hostname.includes('arcgisonline.com');
  const isHostedImage = requestUrl.hostname.includes('googleusercontent.com');

  if (isCdnLib || isMapTile || isHostedImage) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // If it is a CDN library, trigger a background fetch to update the cache (stale-while-revalidate)
          if (isCdnLib) {
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            }).catch(() => {/* Ignore network update failure */});
          }
          return cachedResponse;
        }

        // Cache miss: fetch from network and save to cache
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseCopy);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[SW] Failed to fetch external asset:', event.request.url, err);
          return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
    );
    return;
  }

  // Strategy 3: Default Stale-While-Revalidate for Local Code Assets (js, css, html)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
