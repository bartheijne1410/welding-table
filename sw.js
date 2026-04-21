// ── v5 ── Verhoog dit versienummer bij elke update om cache te wissen
const CACHE = 'weldingtable-v5';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  // Force activate immediately — don't wait for old SW to finish
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE)
        .map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    // Network first — always try to get fresh version
    fetch(e.request)
      .then(response => {
        // Cache the fresh response
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() =>
        // Fallback to cache if offline
        caches.match(e.request).then(cached =>
          cached || caches.match('./index.html')
        )
      )
  );
});
