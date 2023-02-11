/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
declare var self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(
  self.__WB_MANIFEST.filter((entry) => {
    if (self.location.hostname == "localhost") return false;
    try {
      const url = typeof entry == "string" ? entry : entry.url,
        name = url.split("/").pop() || "";

      if (name.startsWith("KaTeX") || name.startsWith("apple-touch")) return false;

      return true;
    } catch (err) {
      return false;
    }
  })
);

self.addEventListener("install", (e) => {
  self.skipWaiting();
});
