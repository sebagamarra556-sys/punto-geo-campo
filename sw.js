const CACHE = 'punto-geo-campo-v23';
const FILES = [
  './',
  './index.html',
  './styles.css?v=pendientes-archivo-v1',
  './attachments.css?v=agenda-v1',
  './geo-paraguay.js?v=pendientes-archivo-v1',
  './app.js?v=pendientes-archivo-v1',
  './firebase.js?v=pendientes-archivo-v1',
  './manifest.webmanifest',
  './punto-geo-logo.jpg',
  './icons/apple-touch-icon.png',
  './icons/apple-touch-icon.png?v=ios-v1',
  './icons/punto-geo-icon-192.png',
  './icons/punto-geo-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('punto-geo-campo-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
