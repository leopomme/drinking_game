const CACHE_NAME = 'drinking-game-cache'; // Increment the version number
const urlsToCache = [
    './',
    './index.html',
    './static/style.css',
    './static/script.js',
    './static/conditions.js',
    './static/conditions.js',
    './manifest.json',
    // Add any other files you want to cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Force cache update by adding { cache: 'reload' }
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
  );
});

// Clear old caches during the activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        if (response) {
          return response;
        }
        // Fetch from network and cache dynamically
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          } else {
            return networkResponse;
          }
        });
      })
  );
});
