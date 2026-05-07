const CACHE = 'persinas-v4';
const ASSETS = [
  './persinas_asad_absensi.html',
  './persinas-asad-.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Supabase selalu online, jangan di-cache
  if (e.request.url.includes('supabase.co')) return;
  // CDN library (jspdf, html2canvas) jangan di-cache
  if (e.request.url.includes('cdnjs.cloudflare.com')) return;

  // Untuk HTML utama: network first, fallback cache
  if (
    e.request.url.includes('persinas_asad_absensi.html') ||
    e.request.url.endsWith('/')
  ) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Aset lain: cache first, fallback network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
