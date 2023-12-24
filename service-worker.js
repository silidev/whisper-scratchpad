const CACHE_NAME = 'your-app-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    'script.js',
    'service-worker.js',
    'style.css',
    'icon-192x192.png',
    'icon-512x512.png',
    'favicon.ico',
];

self.addEventListener('install', event => {
  event.waitUntil(
      caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
          })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request)
          .then(response => {
                if (response) {
                  return response;
                }
                return fetch(event.request);
              }
          )
  );
});