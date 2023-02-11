/// <reference lib="webworker" />
declare var self: ServiceWorkerGlobalScope;

const cacheName = `cache-%CommitHash%`;

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[SW] Caching...");
      await cache.addAll(["%RequestInfo%"]);
    })()
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[SW] Fetching Resource: ${e.request.url}`);
      if (r) return r;
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[SW] Caching Resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

export {};
