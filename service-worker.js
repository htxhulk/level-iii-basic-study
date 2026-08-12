const CACHE='level3-basic-v2d';
const STATIC=['./manifest.webmanifest?v=2d','./icon-192.png','./icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  const req = event.request;
  const url = new URL(req.url);

  if(req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')){
    event.respondWith(
      fetch(req, {cache:'no-store'}).catch(() => caches.match('./index.html?v=2d'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy));
      return response;
    }))
  );
});
