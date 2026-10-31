/* TIKITEXTO · service worker
   - La página se pide SIEMPRE a la red primero: así nadie se queda con una versión antigua.
   - Si no hay conexión, se usa la última copia guardada.
   - Sube VERSION solo si cambias la lista SHELL o quieres vaciar la caché. */
const VERSION = "v6";
const CACHE = "tikitexto-" + VERSION;
const BASE = self.registration.scope; /* termina en "/", incluye el nombre del repositorio */
const INDEX = new URL("index.html", BASE).href;
const SHELL = ["", "index.html", "manifest.webmanifest", "icons/icon-192.png", "favicon.ico", "icons/icon-512.png",
  "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "privacidad.html", "aviso-legal.html", "cookies.html", "accesibilidad.html", "contacto.html"]
  .map(function (p) { return new URL(p, BASE).href; });

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k.indexOf("tikitexto-") === 0 && k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET" || req.url.indexOf(BASE) !== 0) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(new Request(req.url, { cache: "no-cache" }))
        .then(function (res) {
          if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(function (c) { c.put(req.url, copia); }); }
          return res;
        })
        .catch(function () { return caches.match(req.url).then(function (hit) { return hit || caches.match(INDEX); }); })
    );
    return;
  }

  /* Diccionarios de idioma: red primero (para ver siempre las traducciones nuevas), caché de respaldo */
  if (req.url.indexOf("/i18n/") >= 0) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      const red = fetch(req).then(function (res) {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
        return res;
      }).catch(function () { return hit; });
      return hit || red;
    })
  );
});
