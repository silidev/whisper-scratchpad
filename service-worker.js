const CACHE_NAME = 'whisper-scratchpad-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    'script.js',
    'HelgeUtils.js',
    'HtmlUtils.js',
    'service-worker.js',
    'style.css',
    'icon192x192.png',
    'icon512x512.png',
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
