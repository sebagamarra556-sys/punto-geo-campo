const CACHE='punto-geo-campo-v7';const FILES=['./','./index.html','./styles.css','./attachments.css','./geo-paraguay.js','./app.js','./firebase.js','./manifest.webmanifest','./punto-geo-logo.jpg'];self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));

