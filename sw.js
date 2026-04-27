const CACHE = 'love-galore-v1';
const ASSETS = [
  './index.html',
  './login.html',
  './dashboard.html',
  './time-capsules.html',
  './our-story.html',
  './gallery.html',
  './love-letters.html',
  './bucket-list.html',
  './calendar.html',
  './date-ideas.html',
  './search.html',
  './settings.html',
  './css/styles.css',
  './js/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('api.anthropic.com')) return; // never cache API calls
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => cached))
  );
});
