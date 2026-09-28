// sw.js — Service Worker de la Tienda Escolar

// Un Service Worker es un script que el navegador ejecuta APARTE de la página,
// incluso cuando la pestaña está cerrada. Su superpoder es interceptar peticiones
// de red y decidir: ¿la resuelvo con caché, con internet, o con las dos?

const NOMBRE_CACHE = "tienda-escolar-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./css/estilos.css",
    "./js/app.js",
    "./js/carrito.js",
    "./js/csr.js",
    "./js/notificaciones.js",
    "./js/geolocalizacion.js",
    "./catalogo.json",
    "./manifest.json",
    "./icons/icon.svg",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./img/playera.svg",
    "./img/sudadera.svg",
    "./img/taza.svg",
    "./img/mochila.svg",
];

self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches.open(NOMBRE_CACHE).then((cache) => {
            return cache.addAll(APP_SHELL);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys().then((nombresGuardados) =>
            Promise.all(
                nombresGuardados
                    .filter((nombre) => nombre !== NOMBRE_CACHE)
                    .map((nombre) => caches.delete(nombre))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
    if (evento.request.method !== "GET") return;

    if (!evento.request.url.startsWith("http")) return;

    evento.respondWith(
        caches.match(evento.request).then((respuestaGuardada) => {
            if (respuestaGuardada) return respuestaGuardada;

            return fetch(evento.request)
                .then((respuestaDeRed) => {
                    const copia = respuestaDeRed.clone();

                    caches.open(NOMBRE_CACHE).then((cache) =>
                        cache.put(evento.request, copia)
                    );

                    return respuestaDeRed;
                })
                .catch(() => respuestaGuardada);
        })
    );
});