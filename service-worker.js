const CACHE_NAME = "la-huella-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./styles.css",
  "./src/app.js",
  "./src/admin.js",
  "./src/core/reservas.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});