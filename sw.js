/* KILL-SWITCH service worker. This site no longer uses a service worker for caching
   (it was causing stale-cache problems). Any browser that still has an old one registered
   will fetch this file on its next update check, install it, and then this version deletes
   every cache, unregisters itself, and reloads open pages once so they load fresh from the
   network. After that, no service worker is involved at all. */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));   // wipe all cached content
      await self.registration.unregister();                // remove this service worker
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(c => c.navigate(c.url));              // reload open tabs once, uncached
    } catch (_) {}
  })());
});

/* No fetch handler — every request goes straight to the network. */
