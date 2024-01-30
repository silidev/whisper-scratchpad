const CACHE_NAME = 'whisper-scratchpad-cache-v1';
const urlsToCache = [
    '/',
    'generated/DontInspect.js',
    'generated/InfoButton.js',
    'generated/HelgeUtils.js',
    'generated/HtmlUtils.js',
    'generated/script.js',
    'icon192x192.png',
    'icon512x512.png',
    'index.html',
    'lib/wc-menu-wrapper.min.js',
    'manifest.json',
    'service-worker.js',
    'style.css',
    'generated/CurrentNote.js',
    'generated/CutButton.js',
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
