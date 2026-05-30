const CACHE_NAME = 'hexchal-digital-bank-v12';
const APP_SHELL = [
  './',
  './index.html',
  './base.css',
  './layout.css',
  './components.css',
  './dashboard.css',
  './auth.css',
  './bank.js',
  './utils.js',
  './auth.js',
  './dashboard.js',
  './transactions.js',
  './loans.js',
  './cards.js',
  './reports.js',
  './app.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request).then(cachedResponse => cachedResponse || caches.match('./index.html')))
  );
});
