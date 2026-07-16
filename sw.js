/* Seldovia.com service worker — network-first so live updates always win,
   with a cache fallback for offline / installable-app behavior.
   Bump CACHE when you want to guarantee old caches are cleared. */
const CACHE = "seldovia-v2-2";
const SHELL = [
  "index.html", "styles.css", "app.js",
  "explore.html", "calendar.html", "gazette.html", "gallery.html",
  "real-estate.html", "phone-book.html", "directory-add.html", "thanks.html",
  "bulletin.html", "contact.html",
  "images/seldovia-property-logo.jpg", "images/icon-192.png", "images/icon-512.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Network-first: fresh content online, cached fallback offline.
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("index.html")))
  );
});
