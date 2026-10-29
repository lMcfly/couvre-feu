// Couvre-Feu : copie locale du jeu pour jouer sans réseau.
// Réseau d'abord (les mises à jour arrivent tout de suite), copie en cache si hors ligne.
const CACHE = 'couvre-feu-v63';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png', 'fonts/bangers-latin.woff2', 'fonts/comic-neue-latin.woff2', 'fonts/saira-stencil-one-latin.woff2', 'fonts/special-elite-latin.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return; // le classement en ligne ne passe pas par le cache
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => { }); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
