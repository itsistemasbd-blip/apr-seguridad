const CACHE_NAME = 'apr-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Estrategia simple: intenta la red primero, y si falla usa la copia en caché
// (útil si el celular se queda sin señal a mitad de un checklist).
// Importante: solo se aplica a archivos propios de la app (mismo origen).
// Las peticiones a otros dominios (CDNs como jsPDF, JsBarcode, Supabase) se dejan pasar
// directo al navegador, sin pasar por el Service Worker.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
