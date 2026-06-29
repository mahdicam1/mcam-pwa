const CACHE = "mcam-v1";
const FILES = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/quiz.js",
  "/js/calculator.js",
  "/js/whatsapp.js",
  "/js/faq.js",
  "/js/dashboard.js",
  "/assets/icon.svg",
  "/manifest.json"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
});

self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).catch(function() {
        return caches.match("/index.html");
      });
    })
  );
});
